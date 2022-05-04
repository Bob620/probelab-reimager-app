const fs = require('fs/promises');

const {copyDir} = require('../util.js');
const {getCompileOrder, exec, buildPrefix} = require('./config.js');
const {compile} = require('./compile.js');
const {download} = require('./download.js');

const packages = new Map([
	['package', {
		'details': '',
		'link': '',
		'name': 'package',
		'method': '',
		'args': [],
		'requires': [
			'probelab-reimager'
		],
		'recompiles': [],
		'makes': []
	}],
	['probelab-reimager', {
		'details': 'https://github.com/Bob620/probelab-reimager',
		'link': 'https://github.com/Bob620/probelab-reimager/archive/refs/heads/dev.zip',
		'name': 'probelab-reimager',
		'method': 'node',
		'args': [],
		'requires': [
			'sharp',
			'canvas',
			'node-adodb'
		],
		'recompiles': [],
		'makes': ['probelab-reimager'],
		'postCompile': async () => {
			await copyDir(`${buildPrefix}/probelab-reimager/fonts`, `${buildPrefix}/electron/probelab-reimager/fonts`);
			await fs.writeFile(`${buildPrefix}/electron/probelab-reimager/module.js`, (await fs.readFile(`${buildPrefix}/electron/probelab-reimager/module.js`, 'utf8'))
				.replace(/\/\.\.\/fonts/gi, '/fonts'));
		}
	}],
	['canvas', {
		'details': 'https://github.com/Brooooooklyn/canvas',
		'link': 'https://github.com/Brooooooklyn/canvas.git',
		'name': 'canvas',
		'method': 'rust',
		'args': [],
		'requires': [],
		'requiresDlls': [
		],
		'recompiles': [],
		'makes': ['canvas'],
		buildEnv: process.env
	}],
	['node-adodb', {
		'details': 'https://github.com/nuintun/node-adodb',
		'link': 'https://github.com/nuintun/node-adodb/archive/refs/tags/5.0.3.tar.gz',
		'name': 'node-adodb',
		'method': 'node',
		'args': [],
		'requires': [],
		'recompiles': [],
		'makes': ['node-adodb'],
		'postCompile': async () => {
			await fs.copyFile(`${buildPrefix}/node-adodb/lib/adodb.js`, `${buildPrefix}/electron/node-adodb/adodb.js`);
		}
	}],
	['sharp', {
		'details': 'https://sharp.pixelplumbing.com',
		'link': 'https://github.com/lovell/sharp/archive/v0.30.4.zip',
		'name': 'sharp',
		'method': 'electron',
		'args': [],
		'requires': [],
		'requiresDlls': [
			'sharp-prebuilt'
		],
		'recompiles': [],
		'makes': ['sharp']
	}],
	['sharp-prebuilt', {
		'details': 'https://sharp.pixelplumbing.com',
		'link': 'https://github.com/lovell/sharp/releases/download/v0.30.4/sharp-v0.30.4-napi-v5-win32-x64.tar.gz',
		'name': 'sharp-prebuilt',
		'method': 'dll',
		'args': [],
		'requires': [],
		'recompiles': [],
		'makes': ['sharp']
	}]
]);

getCompileOrder(packages).then(async compileOrder => {
	let toCompile = new Set();

	for (const packName of compileOrder) {
		const pack = packages.get(packName);
		if (pack.link !== '')
			await download(pack);

		if (pack.requires.filter(e => !packages.get(e).compiled).length !== 0) {
			toCompile.add(packName);
		} else
			try {
				await compile(packages, pack);
				pack.compiled = true;
			} catch(err) {
				console.log(err);
			}
	}
});
