const crypto = require('crypto');
const fs = require('fs');
const execSync = require('child_process').execSync;

const {buildPrefix, macTargetVersion, packageVersion} = require('./elcapitain/config.js');

function hashFile(uri) {
	const hash = crypto.createHash('sha256');
	hash.update(fs.readFileSync(uri));
	return hash.digest('hex');
}

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

function copyDirSync(src, dest) {
	src = src.endsWith('/') ? src : src + '/';
	dest = dest.endsWith('/') ? dest : dest + '/';
	const files = fs.readdirSync(src, {withFileTypes: true});
	try {
		fs.mkdirSync(dest);
	} catch(e) {}

	for (const file of files) {
		const srcUri = `${src}${file.name}`;
		const destUri = `${dest}${file.name}`;

		if (file.isFile())
			fs.copyFileSync(srcUri, destUri);
		else if (file.isDirectory())
			copyDirSync(srcUri, destUri);
	}
}

function installPackage(packName) {
	exec(`rm -fr ./bin/unpackaged/node_modules/${packName}`);
	copyDirSync(`${buildPrefix}/electron/${packName}`, `./bin/unpackaged/node_modules/${packName}`);
}

console.log('Building and packaging existing code...');
exec('npm run build-prod');
exec('node package.js');

console.log('Installing production npm packages...');
exec('npm install --production', './bin/unpackaged');

if (process.platform === 'darwin') {
	console.log(`Preparing packages for MacOSX (${macTargetVersion}) build...`);
	exec('npm run build-el-capitan');

	console.log(`Injecting packages into MacOSX (${macTargetVersion}) build...`);
	installPackage('sharp');
	installPackage('canvas');

	console.log('Packaging...');
	exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');

	console.log(`Injecting dylibs into MacOSX (${macTargetVersion}) build...`);
	copyDirSync(`./bin/libs`, `./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/contents/Frameworks/Electron Framework.framework/Libraries/libs`);

	console.log('Building installer package for MacOS x64');
	exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-darwin-x64"');

	fs.renameSync(`./dist/Probelab ReImager-${packageVersion}.dmg`, `./dist/reimager-${packageVersion}.dmg`);
	const hash = hashFile(`./dist/reimager-${packageVersion}.dmg`);
	console.log(`sha256: ${hash}`);
} else {
	console.log('Rebuilding packages...');
	exec('"../../node_modules/.bin/electron-rebuild" -f', './bin/unpackaged');

	console.log('Packaging...');
	exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');

	try {
		fs.accessSync('./bin/Probelab ReImager-win32-x64', fs.constants.F_OK);
		console.log('Building installer package for Windows x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-win32-x64"');
	} catch(e) {}

	try {
		fs.accessSync('./bin/Probelab ReImager-linux-x64', fs.constants.F_OK);
		console.log('Building installer package for Linux x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-linux-x64"');
	} catch(e) {}
}

