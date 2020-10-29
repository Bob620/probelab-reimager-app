const fs = require('fs');
const execSync = require('child_process').execSync;

const {buildPrefix} = require('./elcapitain/config.js');

function exec(command, cwd = './', returnResult = false, newEnv = {}) {
	let env = JSON.parse(JSON.stringify(process.env));
	for (const key of Array.from(Object.keys(newEnv)))
		env[key] = newEnv[key];

	const out = execSync(command, {
		cwd,
		stdio: returnResult ? 'pipe' : 'inherit',
		env
	});

	if (returnResult)
		return out.toString();
}

function installPackage(packName) {
	exec(`rm -fr ./node_modules/${packName}`, `./bin/unpackaged`);
	fs.renameSync(`${buildPrefix}/electron/${packName}`, `./bin/unpackaged/node_modules/${packName}`);
}

function bundleLib(packName) {
	exec(`"./build/bin/dylibbundler" -s "./build/lib" -of -cd -b -d "./bin/libs" -x "./bin/unpackaged/node_modules/${packName}/build/Release/${packName}.node" -p "@rpath/libs/"`, './');
}

console.log('Building and packaging existing code...');
exec('npm run build-prod');
exec('node package.js');

console.log('Installing production npm packages...');
exec('npm install --production', './bin/unpackaged');

if (process.platform === 'darwin') {
	console.log('Preparing packages for MacOSX (10.11) build...');
	exec('npm run build-el-capitan');

	console.log('Injecting packages into MacOSX (10.11) build...');
	installPackage('sharp');
	bundleLib('sharp');
	installPackage('canvas');
	bundleLib('canvas');

	console.log('Packaging...');
	exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');

	console.log('Injecting dylibs into MacOSX (10.11) build...');
	fs.renameSync(`./bin/libs`, `./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/contents/Frameworks/Electron Framework.framework/Libraries/libs`);

	console.log('Building installer package for MacOS x64');
	exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-darwin-x64"');
} else {
	console.log('Rebuilding packages...');
	exec('"../../node_modules/.bin/electron-rebuild" -f', './bin/unpackaged');

	console.log('Packaging...');
	exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');

	try {
		fs.accessSync('../bin/Probelab ReImager-win32-x64', fs.constants.F_OK);
		console.log('Building installer package for Windows x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-win32-x64"');
	} catch(e) {}

	try {
		fs.accessSync('../bin/Probelab ReImager-linux-x64', fs.constants.F_OK);
		console.log('Building installer package for Linux x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-linux-x64"');
	} catch(e) {}
}

