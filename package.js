const fs = require('fs');

function createDir(location, name) {
	const binDir = fs.readdirSync(location);
	if (!binDir.includes(name)) {
		console.log(`Creating:\t${location}/${name}`);
		fs.mkdirSync(`${location}/${name}`);
	}
}

function linkDir(uri, outputUri) {
	try {
		fs.mkdirSync(outputUri);
	} catch (err) {
	}

	const dir = fs.readdirSync(uri, {withFileTypes: true});

	for (const fileDirent of dir)
		if (fileDirent.isFile())
			try {
				console.log(`Linking ${uri}/${fileDirent.name} -> ${outputUri}/${fileDirent.name}`);
				fs.linkSync(`${uri}/${fileDirent.name}`, `${outputUri}/${fileDirent.name}`);
			} catch (err) {
			}
		else if (fileDirent.isDirectory())
			linkDir(`${uri}/${fileDirent.name}`, `${outputUri}/${fileDirent.name}`);
}

function linkFile(file, newPath) {
	console.log(`Linking ${file} -> ${newPath}`);
	try {
		fs.linkSync(file, newPath);
	} catch (err) {
	}
}

console.log('Cleaning and creating unpacked dirs...');
try {
	fs.rmdirSync('./bin/unpackaged');
} catch (err) {
}
createDir('./', 'bin');
createDir('./bin', 'unpackaged');
createDir('./bin/unpackaged', 'src');

console.log('\nLinking assets...');
linkDir('./assets', './bin/unpackaged/assets');
//linkDir('./src/backend', './bin/unpackaged/src/backend');

console.log('\nLinking package json files...');
linkFile('./package.json', './bin/unpackaged/package.json');
linkFile('./package-lock.json', './bin/unpackaged/package-lock.json');
linkFile('./LICENSE', './bin/unpackaged/LICENSE');
//linkFile('./constants.json', './bin/unpackaged/constants.json');

console.log('\n');
