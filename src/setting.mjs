import path from 'path'

import { fileURLToPath } from 'url'
import { getFieldsSize } from './utils.mjs'

const defaultSetting = {
	// -- setting for all
	fields: ['country'],
	dataDir: '../data/',
	tmpDataDir: '../tmp/',

	// ---- small memory setting
	smallMemory: false,
	smallMemoryFileSize: 4096,

	// ---- setting for lookup
	addCountryInfo: false,

	// -- setting for update
	licenseKey: 'redist',
	ipLocationDb: '',
	downloadType: 'reuse',
	series: 'GeoLite2', // or GeoIP2
	language: 'en',
	fakeData: false,

	sameDbSetting: false,
	multiDbDir: false,
}

// default setting
export const setting = {
	v4: {ipv4: true, ipv6: false, name: 'v4'},
	v6: {ipv4: false, ipv6: true, name: 'v6'},
	mainFieldHash: {},
	locFieldHash: {},
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mainFields = ['latitude', 'longitude', 'area', 'postcode']
const locFields = ['country', 'region1', 'region1_name', 'region2', 'region2_name', 'metro', 'timezone', 'city', 'eu']

const make_key = (key) => {
	return 'ILA_' + key.replace(/([A-Z])/g, char => '_' + char).toUpperCase()
}

export const getSettingCmd = () => {
	const ret = []
	for(const key in defaultSetting){
		if(setting[key] && setting[key] !== defaultSetting[key]){
			ret.push(make_key(key) + '=' + String(setting[key]))
		}
	}
	return ret.join(' ')
}

const inputSetting = {}
var settingKeys = Object.keys(defaultSetting)
for(var env in process.env){
	for(var key of settingKeys){
		if(env.toUpperCase() === make_key(key)){
			inputSetting[key] = process.env[env]
		}
	}
}
for(var arg of process.argv){
	var v = arg.toUpperCase()
	for(var key of settingKeys){
		if(v.includes(make_key(key) + '=')){
			inputSetting[key] = arg.split('=')[1]
		}
	}
}

const NumReg = /^\d+$/
export const setSetting = (_setting = {}) => {
	for(var key in _setting){
		var value = setting[key] = _setting[key]
		if(value === "false") setting[key] = false
		else if(value === "true")  setting[key] = true
		else if(NumReg.test(value)) setting[key] = parseInt(value)
	}

	// Directory Setting
	const windowsDriveReg = /^[a-zA-Z]:\\/
	if(!setting.dataDir.startsWith('/') && !setting.dataDir.startsWith('\\\\') && !windowsDriveReg.test(setting.dataDir)){
		setting.dataDir = path.resolve(__dirname, setting.dataDir)
	}
	if(!setting.tmpDataDir.startsWith('/') && !setting.tmpDataDir.startsWith('\\\\') && !windowsDriveReg.test(setting.tmpDataDir)){
		setting.tmpDataDir = path.resolve(__dirname, setting.tmpDataDir)
	}

	// Fields Setting
	if(typeof setting.fields === 'string'){
		setting.fields = setting.fields.split(/\s*,\s*/)
	}
	if(setting.fields.includes('all')) {
		setting.fields = mainFields.concat(locFields)
	} else {
		setting.fields = setting.fields.filter(v => mainFields.includes(v) || locFields.includes(v))
	}

	if(setting.fields.length === 1 && setting.fields[0] === 'country'){
		setting.dataType = 'country'
	} else {
		setting.dataType = 'city'		
	}
	setting.isCountry = setting.dataType === 'country'
	setting.isCity = !setting.isCountry

	for(var field of mainFields){
		setting.mainFieldHash[field] = setting.fields.includes(field)
	}

	setting.noLocFile = true
	for(var field of locFields){
		setting.locFieldHash[field] = setting.fields.includes(field)
		if(setting.locFieldHash[field]){
			setting.noLocFile = false
		}
	}
	if(setting.isCountry) setting.noLocFile = true
	setting.locFile = !setting.noLocFile

	// Main Data Record Size
	var mainRecordSize = setting.isCountry ? 2 : getFieldsSize(setting.fields.filter(v => mainFields.includes(v)))
	if(setting.locFile) mainRecordSize += 4
	setting.v4.recordSize = setting.v6.recordSize = setting.mainRecordSize = mainRecordSize
	setting.locRecordSize = getFieldsSize(setting.fields.filter(v => locFields.includes(v)))
	if(setting.smallMemory){
		setting.v4.recordSize += 4
		setting.v6.recordSize += 8
		setting.v4.fileLineMax = (setting.smallMemoryFileSize / setting.v4.recordSize | 0) || 1
		setting.v6.fileLineMax = (setting.smallMemoryFileSize / setting.v6.recordSize | 0) || 1
		setting.fileMax = 1024
		setting.v4.folderLineMax = setting.v4.fileLineMax * setting.fileMax
		setting.v6.folderLineMax = setting.v6.fileLineMax * setting.fileMax
	}
}

setSetting(Object.assign({}, defaultSetting, inputSetting))