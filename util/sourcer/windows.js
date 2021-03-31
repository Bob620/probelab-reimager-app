const fs = require('fs/promises');

const {getCompileOrder, exec, buildPrefix} = require('./config.js');
const {compile} = require('./compile.js');
const {download} = require('./download.js');

async function copyDir(src, dest) {
	src = src.endsWith('/') ? src : src + '/';
	dest = dest.endsWith('/') ? dest : dest + '/';
	const files = await fs.readdir(src, {withFileTypes: true});
	try {
		await fs.mkdir(dest);
	} catch(e) {
	}

	for (const file of files) {
		const srcUri = `${src}${file.name}`;
		const destUri = `${dest}${file.name}`;

		if (file.isFile())
			await fs.copyFile(srcUri, destUri);
		else if (file.isDirectory())
			await copyDir(srcUri, destUri);
	}
}

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
		'method': 'electron',
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
			await fs.writeFile(`${buildPrefix}/electron/canvas/index.js`, (await fs.readFile(`${buildPrefix}/electron/canvas/index.js`, 'utf8'))
				.replace(/\.\.\/build\/Release\/canvas\.node/gi, './canvas.node'));
		},
		buildEnv: process.env
	}],
	['node-adodb', {
		'details': 'https://github.com/nuintun/node-adodb',
		'link': 'https://github.com/nuintun/node-adodb/archive/refs/tags/5.0.3.tar.gz',
		'name': 'node-adodb',
		'method': 'electron',
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
			await fs.writeFile(`${buildPrefix}/electron/sharp/lib/index.js`, (await fs.readFile(`${buildPrefix}/electron/sharp/lib/index.js`, 'utf8'))
				.replace(/\.\.\/build\/Release\/sharp\.node/gi, '../sharp.node'));
			const files = await fs.readdir(`${buildPrefix}/sharp/vendor/8.10.5/lib/`);
			for (const file of files)
				if (file.endsWith('.dll'))
					await fs.copyFile(`${buildPrefix}/sharp/vendor/8.10.5/lib/${file}`, `${buildPrefix}/electron/sharp/${file}`);
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
		'makes': ['sharp']
	}],
	['cairo-prebuilt', {
		'details': 'https://www.npmjs.com/package/canvas',
		'link': 'https://github.com/Automattic/node-canvas/releases/download/v2.7.0/canvas-v2.7.0-node-v83-win32-unknown-x64.tar.gz',
		'name': 'cairo-prebuilt',
		'method': 'dll',
		'args': [],
		'requires': [],
		'recompiles': [],
		'makes': ['canvas']
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
