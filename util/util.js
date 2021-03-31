const crypto = require('crypto');
const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

const {buildPrefix} = require('./sourcer/config.js');

function createDir(location, name) {
	const binDir = fs.readdirSync(location);
	if (!binDir.includes(name)) {
		console.log(`Creating:\t${location}/${name}`);
		fs.mkdirSync(`${location}/${name}`);
	}
}

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
	} catch(e) {
	}

	for (const file of files) {
		const srcUri = `${src}${file.name}`;
		const destUri = `${dest}${file.name}`;

		if (file.isFile())
			fs.copyFileSync(srcUri, destUri);
		else if (file.isDirectory())
			copyDirSync(srcUri, destUri);
	}
}

function installPackage(location, packName) {
	const dest = path.resolve(location, 'node_modules', packName);
	const src = path.resolve(buildPrefix, 'electron',  packName);

	exec(`rm -fr ${dest}`);
	copyDirSync(src, dest);
}

module.exports = {
	installPackage,
	exec,
	copyDirSync,
	createDir,
	hashFile
};