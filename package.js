const fs = require('fs');

const binDir = fs.readdirSync('./');
if (!binDir.includes('bin'))
	fs.mkdirSync('./bin');

const unpackagedDir = fs.readdirSync('./bin');
if (!unpackagedDir.includes('unpackaged'))
	fs.mkdirSync('./bin/unpackaged');

const srcDir = fs.readdirSync('./bin/unpackaged');
if (!srcDir.includes('src'))
	fs.mkdirSync('./bin/unpackaged/src');

function linkDir(uri, outputUri) {
	try {
		fs.mkdirSync(outputUri);
	} catch(err) {}

	const dir = fs.readdirSync(uri, {withFileTypes: true});

	for (const fileDirent of dir)
		if (fileDirent.isFile())
			try {
				console.log(`Linking ${uri}/${fileDirent.name} -> ${outputUri}/${fileDirent.name}`);
				fs.linkSync(`${uri}/${fileDirent.name}`, `${outputUri}/${fileDirent.name}`);
			} catch(err) {}
		else if (fileDirent.isDirectory())
			linkDir(`${uri}/${fileDirent.name}`, `${outputUri}/${fileDirent.name}`);
}

linkDir('./assets', './bin/unpackaged/assets');
linkDir('./src/backend', './bin/unpackaged/src/backend');

try {
	fs.linkSync('./package.json', './bin/unpackaged/package.json');
} catch(err) {}
try {
	fs.linkSync('./LICENSE', './bin/unpackaged/LICENSE');
} catch (err) {}
try {
	fs.linkSync('./constants.json', './bin/unpackaged/constants.json');
} catch(err) {}