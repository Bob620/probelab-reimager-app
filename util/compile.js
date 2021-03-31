const {createDir, installPack, exec, copyDirSync, hashFile} = require('./util.js');
const {macTargetVersion, packageVersion} = require('./sourcer/config.js');

createDir('.', 'build');
createDir('./build', 'electron');

console.log('Building and packaging existing code...');
exec('node package.js');
exec('npm run minify');

console.log('Installing production npm packages...');
fs.mkdirSync(`./bin/unpackaged/node_modules`, {recursive: true});

let installPackage = installPack;

switch(process.platform) {
	case 'darwin':
		installPackage = installPackage.bind('bin/Probelab ReImager-darwin-x64/resources/app');
		console.log(`Preparing packages for MacOSX (${macTargetVersion}) build...`);
		exec('npm run build-el-capitan');

		console.log(`Injecting packages into MacOSX (${macTargetVersion}) build...`);
		installPackage('sharp');
		installPackage('canvas');
		installPackage('probelab-reimager');

		console.log('Packaging...');
		exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');

		console.log(`Injecting dylibs into MacOSX (${macTargetVersion}) build...`);
		copyDirSync(`./bin/libs`, `./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/contents/Frameworks/Electron Framework.framework/Libraries/libs`);

		console.log('Building installer package for MacOS x64');
		exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-darwin-x64"');

		fs.renameSync(`./dist/Probelab ReImager-${packageVersion}.dmg`, `./dist/reimager-${packageVersion}.dmg`);
		const hash = hashFile(`./dist/reimager-${packageVersion}.dmg`);
		console.log(`sha256: ${hash}`);
		break;
	case 'win32':
		installPackage = installPackage.bind('bin/Probelab ReImager-win32-x64/resources/app');
		console.log(`Preparing packages for Windows build...`);
		exec('npm run build-windows');

		console.log('Packaging...');
		exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');
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
