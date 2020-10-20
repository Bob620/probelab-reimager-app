const fs = require('fs');
const execSync = require('child_process').execSync;

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
	fs.accessSync('./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/contents/Frameworks/Electron Framework.framework/Libraries/', fs.constants.F_OK);

	try {
		fs.accessSync('./bin/macdylibbundler/dylibbundler', fs.constants.F_OK);
		console.log('macdylibbundler exists');
	} catch(err) {
		exec('rm -fr "./bin/macdylibbundler"');
		console.log('Downloading macdylibbundler...');
		exec('git clone https://github.com/auriamg/macdylibbundler.git', './bin/');
		console.log('Compiling macdylibbundler...');
		exec('make', './bin/macdylibbundler/');
	}

	console.log('Injecting dylibs into darwin build...');
	exec('"./bin/macdylibbundler/dylibbundler" -of -cd -b -d "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Frameworks/Electron Framework.framework/Libraries/libs" -x "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Resources/app/node_modules/sharp/build/Release/sharp.node" -p "@rpath/libs/"', './');
	exec('"./bin/macdylibbundler/dylibbundler" -of -cd -b -d "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Frameworks/Electron Framework.framework/Libraries/libs" -x "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Resources/app/node_modules/canvas/build/Release/canvas-postbuild.node" -p "@rpath/libs/"', './');
	exec('"./bin/macdylibbundler/dylibbundler" -of -cd -b -d "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Frameworks/Electron Framework.framework/Libraries/libs" -x "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Resources/app/node_modules/canvas/bin/darwin-x64-80/canvas.node" -p "@rpath/libs/"', './');
	exec('"./bin/macdylibbundler/dylibbundler" -of -cd -b -d "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Frameworks/Electron Framework.framework/Libraries/libs" -x "./bin/Probelab ReImager-darwin-x64/Probelab ReImager.app/Contents/Resources/app/node_modules/canvas/build/Release/canvas.node" -p "@rpath/libs/"', './');
} catch(err) {
	console.log(err);
}

try {
	fs.accessSync('./bin/Probelab ReImager-win32-x64', fs.constants.F_OK);
	console.log('Building installer package for Windows x64');
	exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-win32-x64"');
} catch(e) {}

try {
	fs.accessSync('./bin/Probelab ReImager-darwin-x64', fs.constants.F_OK);
	console.log('Building installer package for MacOS x64');
	exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-darwin-x64"');
} catch(e) {}

try {
	fs.accessSync('./bin/Probelab ReImager-linux-x64', fs.constants.F_OK);
	console.log('Building installer package for Linux x64');
	exec('"./node_modules/.bin/electron-builder" --pd "./bin/Probelab ReImager-linux-x64"');
} catch(e) {}