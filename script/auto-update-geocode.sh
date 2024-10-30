# get current version from package.json

cd browser/geocode
RES1=`find data -name '*.idx' -size -1k 2>/dev/null`
if [ -z "$RES1" ]; then
	VERT=`node -p "var j=require('./package.json');j.version=j.version.split('.').slice(0,-1).join('.')+'.'+require('dayjs')().format('YYYYMMDD');require('fs').writeFileSync('./package.json',JSON.stringify(j,null,2));j.version;"`
	git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
	git config --local user.name "github-actions[bot]"
	git commit -a -m "v${VERT} auto update ip database"
	npm publish
fi

cd ../..

cd browser/geocode-extra
RES2=`find data -name '*.idx' -size -1k 2>/dev/null`
if [ -z "$RES2" ]; then
	VERT=`node -p "var j=require('./package.json');j.version=j.version.split('.').slice(0,-1).join('.')+'.'+require('dayjs')().format('YYYYMMDD');require('fs').writeFileSync('./package.json',JSON.stringify(j,null,2));j.version;"`
	git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
	git config --local user.name "github-actions[bot]"
	git commit -a -m "v${VERT} auto update ip database"
	npm publish
fi
