const path = require('path');
const fs = require('fs/promises');

const esbuild = require('esbuild');
const sassPlugin = require('esbuild-sass-plugin');

async function Minify() {
	await esbuild.build({
		entryPoints: [path.resolve('src/pages/entry/index.jsx')],
		bundle: true,
		minify: true,
		loader: {
			'.js': 'jsx',
			'.scss': 'css'
		},
		define: {
			'process.env.NODE_ENV': '"production"'
		},
		platform: 'browser',
		target: ['chrome89'],
		external: ['electron', 'crypto'],
		outfile: path.resolve('assets/react/entry.js'),
		plugins: [sassPlugin.sassPlugin()]
	});

	await esbuild.build({
		entryPoints: [path.resolve('src/backend/main.js')],
		bundle: true,
		minify: true,
		define: {
			'process.env.NODE_ENV': '"production"'
		},
		platform: 'node',
		external: ['electron'],
		outfile: path.resolve('bin/unpackaged/src/backend/main.js')
	});

	for (const child of await fs.readdir(path.resolve('src/backend/children/'), {withFileTypes: true}))
		if (child.isDirectory())
			await esbuild.build({
				entryPoints: [path.resolve(`src/backend/children/${child.name}/child.js`)],
				bundle: true,
				minify: true,
				define: {
					'process.env.NODE_ENV': '"production"'
				},
				platform: 'node',
				external: ['sharp', 'canvas', 'node-adodb', 'lzma-native', 'probelab-reimager'],
				outfile: path.resolve(`bin/unpackaged/src/backend/children/${child.name}/child.js`)
			});
}

Minify();