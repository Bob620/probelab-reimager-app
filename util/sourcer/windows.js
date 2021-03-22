const fs = require('fs/promises');

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
			'sharp',
			'canvas'
		],
		'recompiles': [],
		'makes': []
	}],
	['canvas', {
		'details': 'https://www.npmjs.com/package/canvas',
		'link': 'https://github.com/Automattic/node-canvas/archive/v2.7.0.tar.gz',
		'name': 'canvas',
		'method': 'electron',
		'args': [],
		'requires': [],
		'requiresDlls': [
			'cairo-prebuilt'
		],
		'recompiles': [],
		'makes': ['canvas'],
		'postConfigure': async () => {
			await exec('npm install nan@2.14.0', 'canvas');
		},
		'postCompile': async () => {
			await exec('npm install node-pre-gyp', 'electron/canvas');
		},
		buildEnv: process.env
	}],
	['sharp', {
		'details': 'https://sharp.pixelplumbing.com',
		'link': 'https://github.com/lovell/sharp/archive/v0.27.2.zip',
		'name': 'sharp',
		'method': 'electron',
		'args': [],
		'requires': [],
		'requiresDlls': [
			'sharp-prebuilt'
		],
		'recompiles': [],
		'makes': ['sharp'],
		'postCompile': async () => {
			const files = await fs.readdir(`${buildPrefix}/sharp/vendor/8.10.5/lib/`);
			for (const file of files)
				if (file.endsWith('.dll'))
					await fs.copyFile(`${buildPrefix}/sharp/vendor/8.10.5/lib/${file}`, `${buildPrefix}/electron/sharp/build/Release/${file}`);
		}
	}],
	['sharp-prebuilt', {
		'details': 'https://sharp.pixelplumbing.com',
		'link': 'https://github.com/lovell/sharp/releases/download/v0.27.2/sharp-v0.27.2-napi-v3-win32-x64.tar.gz',
		'name': 'sharp-prebuilt',
		'method': 'dll',
		'args': [],
		'requires': [],
		'recompiles': [],
		'makes': ['sharp-prebuilt']
	}],
	['cairo-prebuilt', {
		'details': 'https://www.npmjs.com/package/canvas',
		'link': 'https://github.com/Automattic/node-canvas/releases/download/v2.7.0/canvas-v2.7.0-node-v83-win32-unknown-x64.tar.gz',
		'name': 'cairo-prebuilt',
		'method': 'dll',
		'args': [],
		'requires': [],
		'recompiles': [],
		'makes': ['cairo-prebuilt']
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
				await compile(pack);
				pack.compiled = true;
			} catch(err) {
				console.log(err);
			}
	}
});
