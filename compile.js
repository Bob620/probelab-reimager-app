const fs = require('fs');
const execSync = require('child_process').execSync;

function exec(command, cwd = './') {
	return execSync(command, {
		cwd,
		stdio: 'inherit'
	});
}

console.log('Building and packaging existing code...');
exec('npm run build-prod');
exec('node package.js');

console.log('Installing production npm packages...');
exec('npm install --production', './bin/unpackaged');

console.log('Rebuilding packages...');
exec('"../../node_modules/.bin/electron-rebuild" -f', './bin/unpackaged');

console.log('Packaging...');
exec('"./node_modules/.bin/electron-packager" ./bin/unpackaged --out ./bin --overwrite');

try {
	fs.accessSync('./bin/Probelab ReImager-win32-x64', fs.constants.F_OK);
	console.log('Building installer package for Windows x64');
	exec('"./node_modules/.bin/electron-builder" --pd \"./bin/Probelab ReImager-win32-x64\"');
} catch(e) {}

try {
	fs.accessSync('./bin/Probelab ReImager-darwin-x64', fs.constants.F_OK);
	console.log('Building installer package for MacOS x64');
	exec('"./node_modules/.bin/electron-builder" --pd \"./bin/Probelab ReImager-darwin-x64\"');
} catch(e) {}

try {
	fs.accessSync('./bin/Probelab ReImager-linux-x64', fs.constants.F_OK);
	console.log('Building installer package for Linux x64');
	exec('"./node_modules/.bin/electron-builder" --pd \"./bin/Probelab ReImager-linux-x64\"');
} catch(e) {}