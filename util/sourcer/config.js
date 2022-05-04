const fs = require('fs/promises');
const path = require('path');
const fsConstants = require('fs').constants;
const execSync = require('child_process').execSync;

const packageJson = require('../../package.json');

const electronVersion = packageJson.devDependencies.electron;
const packageVersion = packageJson.version;

const dirPrefix = path.dirname(path.dirname(__dirname));
const buildPrefix = path.join(dirPrefix, 'build');

const macTargetVersion = '10.11';

const rustCoreutils = [
	'[', 'b2sum', 'b3sum', 'base32', 'base64', 'basename', 'basenc', 'cat', 'cksum', 'comm', 'cp', 'csplit', 'cut', 'date',
	'dd', 'df', 'dircolors', 'dirname', 'du', 'echo', 'env', 'expand', 'expr', 'factor', 'false', 'fmt', 'fold', 'hashsum',
	'head', 'join', 'link', 'ln', 'ls', 'md5sum', 'mkdir', 'mktemp', 'more', 'mv', 'nl', 'numfmt', 'od', 'paste', 'pr',
	'printenv', 'printf', 'ptx', 'pwd', 'readlink', 'realpath', 'relpath', 'rm', 'rmdir', 'seq', 'sha1sum', 'sha224sum',
	'sha256sum', 'sha3-224sum', 'sha3-256sum', 'sha3-384sum', 'sha3-512sum', 'sha384sum', 'sha3sum',
	'sha512sum', 'shake128sum', 'shake256sum', 'shred', 'shuf', 'sleep', 'sort', 'split', 'sum', 'tac', 'tail', 'tee',
	'test', 'touch', 'tr', 'true', 'truncate', 'tsort', 'unexpand', 'uniq', 'unlink', 'wc', 'yes'
];

const env = {
	LDFLAGS: `-mmacosx-version-min=${macTargetVersion}`,
	LD_LIBRARY_PATH: `${buildPrefix}/lib`,
	CXXFLAGS: `-stdlib=libc++ -mmacosx-version-min=${macTargetVersion}`,
	CPPFLAGS: `-stdlib=libc++ -mmacosx-version-min=${macTargetVersion}`,
	CFLAGS: `-stdlib=libc++ -mmacosx-version-min=${macTargetVersion}`,
	//MACOSX_DEPLOYMENT_TARGET: macTargetVersion, // Breaks gobject-introspection?
	PATH: `${buildPrefix}:${buildPrefix}/bin:/usr/local/bin:/usr/bin:/bin`,
	PKG_CONFIG_PATH: `${buildPrefix}/lib/pkgconfig`,
	CMAKE_INSTALL_PREFIX: `${buildPrefix}/`,
	HOME: path.join(process.env.HOME, '.electron-gyp')
};

// Extra env variables need to be added in order to build on windows
if (process.platform === 'win32') {
	env.PATH = process.env.Path;
	env.APPDATA = process.env.APPDATA;
	env.ProgramData = process.env.ProgramData;
//	env.LOCALAPPDATA = process.env.LOCALAPPDATA;
//	env['CommonProgramFiles(x86)'] = process.env['CommonProgramFiles(x86)'];
//	env.CommonProgramW6432 = process.env.CommonProgramW6432;
//	env['ProgramFiles(x86)'] = process.env['ProgramFiles(x86)'];
//	env.ProgramW6432 = process.env.ProgramW6432;
//	env.WINDIR = process.env.WINDIR;
//	env.PROGRAMFILES = process.env.PROGRAMFILES;
//	env.DriverData = process.env.DriverData;
//	env.COMMONPROGRAMFILES = process.env.COMMONPROGRAMFILES;
//	env.VS140COMNTOOLS = process.env.VS140COMNTOOLS; // npm config set msvs_version 2015
}

const mesonConfig = `--prefix="${buildPrefix}/" -Dbuildtype=release`;
const configureConfig = `--prefix="${buildPrefix}/"`;
const cmakeConfig = `-f makefile.unix -DCMAKE_INSTALL_PREFIX="${buildPrefix}" -DCMAKE_SYSTEM_PREFIX_PATH="${buildPrefix}" -DCMAKE_BUILD_TYPE=Release`;
const electronConfig = `--target=${electronVersion} --arch=x64 --dist-url=https://atom.io/download/electron --release `;

const nodeGyp = `${process.platform === 'win32' ? '' : 'HOME=~/.electron-gyp'} "${path.resolve(`${buildPrefix}/../node_modules/.bin/node-gyp${process.platform === 'win32' ? '.cmd' : ''}`)}" -j max`;

let compileOrder = new Set();

async function testForFile(fileName) {
	let exists = false;

	try {
		await fs.access(`${buildPrefix}/bin/${fileName}`, fsConstants.F_OK);
		exists = true;
	} catch(e) {
	}

	try {
		await fs.access(`${buildPrefix}/include/${fileName}`, fsConstants.F_OK);
		exists = true;
	} catch(e) {
	}

	try {
		await fs.access(`${buildPrefix}/lib/${fileName}`, fsConstants.F_OK);
		exists = true;
	} catch(e) {
	}

	try {
		await fs.access(`${buildPrefix}/etc/${fileName}`, fsConstants.F_OK);
		exists = true;
	} catch(e) {
	}

	try {
		await fs.access(`${buildPrefix}/share/${fileName}`, fsConstants.F_OK);
		exists = true;
	} catch(e) {
	}

	try {
		await fs.access(`${buildPrefix}/electron/${fileName}`, fsConstants.F_OK);
		exists = true;
	} catch(e) {
	}

	return exists;
}

async function prepare(packages, packName) {
	const pack = packages.get(packName);
	try {
		await fs.access(`${buildPrefix}/${packName}`, fsConstants.F_OK);
		pack.downloaded = true;
	} catch(e) {
		pack.downloaded = false;
	}

	pack.compiled = false;
	if (pack.makes && pack.makes.length > 0 && pack.downloaded)
		try {
			for (const file of pack.makes)
				if (!await testForFile(file))
					throw '';

			pack.compiled = true;
		} catch(e) {
		}

	if (pack.requiresDlls)
		for (const prePack of pack.requiresDlls)
			await prepare(packages, prePack);

	if (pack.requires)
		for (const prePack of pack.requires)
			await prepare(packages, prePack);

	compileOrder.add(pack.name);
}

async function exec(command, cwd = '', override = false, customEnv = env) {
	if (process.platform === 'win32') {
		command = command.replace(/\/dev\/null/g, 'nul');

		if (rustCoreutils.includes(command.split(' ')[0]))
			command = 'coreutils.exe ' + command;
	}

	cwd = override ? path.resolve(cwd) : path.join(buildPrefix, cwd);

	return execSync(command, {
		env: customEnv,
		cwd,
		maxBuffer: 1024 * 1024
	});
}

async function execRust(command, cwd = '', override = false, customEnv = env) {
	cwd = override ? path.resolve(cwd) : path.join(buildPrefix, cwd);

	customEnv.PATH = `${customEnv.PATH};C:\\Program Files\\NASM;C:\\msys64\\usr\\bin;`
	//customEnv.PATH = customEnv.PATH.replaceAll('C:', '/c').replaceAll('\\', '/').replaceAll(';', ':')

	return execSync(command, {
		env: customEnv,
		cwd,
		maxBuffer: 1024 * 1024
	});
}

module.exports = {
	env,
	dirPrefix,
	buildPrefix,
	mesonConfig,
	cmakeConfig,
	configureConfig,
	electronConfig,
	macTargetVersion,
	packageVersion,
	nodeGyp,
	electronVersion,
	exec,
	execRust,
	getCompileOrder: async packages => {
		try {
			await fs.access(buildPrefix, fsConstants.F_OK);
		} catch(e) {
			await fs.mkdir(buildPrefix);
		}

		try {
			await fs.access(`${buildPrefix}/electron`, fsConstants.F_OK);
		} catch(e) {
			await fs.mkdir(`${buildPrefix}/electron`);
		}

		await prepare(packages, 'package');

		return compileOrder;
	}
};