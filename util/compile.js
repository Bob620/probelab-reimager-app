const fs = require('fs')

const {createDir, installPackage: installPack, exec, copyDirSync, hashFile} = require('./util.js');
const {macTargetVersion, packageVersion} = require('./sourcer/config.js');

createDir('.', 'build');
createDir('./build', 'electron');

console.log('Building and packaging existing code...');
exec('node package.js');
exec('npm run minify');

console.log('Installing production npm packages...');
fs.mkdirSync(`./bin/unpackaged/node_modules`, {recursive: true});

let installPackage;

console.log('Packaging...');
exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');
switch(process.platform) {
	case 'darwin':
		installPackage = installPack.bind(undefined, 'bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/contents/Resources/app');
		console.log(`Preparing packages for MacOS (${macTargetVersion}) build...`);
		exec('npm run build-el-capitan');

		fs.accessSync('./bin/Probelab ReImager-darwin-x64', fs.constants.F_OK);

		console.log(`Injecting packages into MacOS (${macTargetVersion}) build...`);
		installPackage('sharp');
		installPackage('canvas');
		installPackage('probelab-reimager');

		console.log(`Injecting dylibs into MacOSX (${macTargetVersion}) build...`);
		copyDirSync(`./bin/libs`, `./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/contents/Frameworks/Electron Framework.framework/Libraries/libs`);

		console.log('Building installer package for MacOS x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-darwin-x64"');

		fs.renameSync(`./dist/Probelab ReImager-${packageVersion}.dmg`, `./dist/reimager-${packageVersion}.dmg`);
		const hash = hashFile(`./dist/reimager-${packageVersion}.dmg`);
		console.log(`sha256: ${hash}`);
		break;
	case 'win32':
		installPackage = installPack.bind(undefined, 'bin/Probelab ReImager-win32-x64/resources/app');
		console.log(`Preparing packages for Windows build...`);
		exec('npm run build-windows');

		fs.accessSync('./bin/Probelab ReImager-win32-x64', fs.constants.F_OK);

		console.log(`Injecting packages into Windows build...`);
		installPackage('sharp');
		installPackage('canvas');
		installPackage('node-adodb');
		installPackage('probelab-reimager');

		console.log('Building installer package for Windows x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-win32-x64"');
		break;
	default:
	case 'linux':
		console.log('Rebuilding packages...');
		exec('"../../node_modules/.bin/electron-rebuild" -f -e "../../node_modules/electron"', './bin/unpackaged');

		console.log('Packaging...');
		exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');

		fs.accessSync('./bin/Probelab ReImager-linux-x64', fs.constants.F_OK);
		console.log('Building installer package for Linux x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-linux-x64"');
		break;
}
