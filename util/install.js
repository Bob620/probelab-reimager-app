const {createDir, installPackage, exec} = require('./util.js');
const {macTargetVersion} = require('./sourcer/config.js');

createDir('.', 'build');
createDir('./build', 'electron');

console.log('Building existing code...');
exec('npm run minify');

let installLocation = './'
const installPackageRoot = installPackage.bind(undefined, installLocation);

switch(process.platform) {
	case 'darwin':
		console.log(`Preparing packages for MacOSX (${macTargetVersion})`);
		exec('npm run build-el-capitan');

		console.log(`Injecting packages into MacOSX (${macTargetVersion})`);
		installPackageRoot('sharp');
		installPackageRoot('canvas');
		installPackageRoot('probelab-reimager');
		break;
	case 'win32':
		console.log(`Preparing packages for Windows...`);
		exec('npm run build-windows');

		console.log(`Injecting packages into Windows...`);
		installPackageRoot('sharp');
		installPackageRoot('canvas');
		installPackageRoot('node-adodb');
		installPackageRoot('probelab-reimager');
		break;
	default:
	case 'linux':
		break;
}