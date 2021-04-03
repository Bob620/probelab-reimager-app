const path = require('path');
const fs = require('fs/promises');

const esbuild = require('esbuild');

const {
	buildPrefix,
	configureConfig,
	cmakeConfig,
	mesonConfig,
	exec,
	nodeGyp,
	electronConfig,
	macTargetVersion
} = require('./config.js');

async function compile(packages, pack, recompile = false) {
	const args = `${pack.args ? pack.args.join(' ') : ''} ${!recompile && pack['before-recompile'] ? pack['before-recompile'].join(' ') : ''}`;

	if (!pack.compiled || recompile) {
		switch(pack.method) {
			case 'configure':
				console.log(`Cleaning ${pack.name} (${pack.link})`);
				try {
					await exec('make distclean > /dev/null', pack.name);
				} catch(e) {
					try {
						await exec('make clean > /dev/null', pack.name);
					} catch(e) {
					}
				}

				if (pack.postClean)
					await pack.postClean();

				console.log(`Configuring ${pack.name} (${pack.link})`);
				await exec(`./configure ${configureConfig} ${args} > /dev/null`, pack.name);

				if (pack.postConfigure)
					await pack.postConfigure();

				console.log(`Building ${pack.name} (${pack.link})`);
				await exec('make install > /dev/null', pack.name);

				break;
			case 'cmake':
				console.log(`Cleaning ${pack.name} (${pack.link})`);
				try {
					await exec('make distclean > /dev/null', pack.name);
				} catch(e) {
					try {
						await exec('make clean > /dev/null', pack.name);
					} catch(e) {
					}
				}

				if (pack.postClean)
					await pack.postClean();

				console.log(`Configuring ${pack.name} (${pack.link})`);
				await exec(`cmake make ${cmakeConfig} ${args} . > /dev/null`, pack.name);

				if (pack.postConfigure)
					await pack.postConfigure();

				console.log(`Building ${pack.name} (${pack.link})`);
				await exec('cmake --build . --target install > /dev/null', pack.name);
				break;
			case 'meson':
				console.log(`Cleaning ${pack.name} (${pack.link})`);
				try {
					await fs.rmdir(`${buildPrefix}/${pack.name}/_build`, {recursive: true});
				} catch(e) {
				}

				if (pack.postClean)
					await pack.postClean();

				console.log(`Configuring ${pack.name} (${pack.link})`);
				try {
					await exec(`meson _build ${mesonConfig} ${args}`, pack.name);
				} catch(err) {
					throw err.stdout.toString();
				}

				await fs.writeFile(`${buildPrefix}/${pack.name}/_build/build.ninja`, (await fs.readFile(`${buildPrefix}/${pack.name}/_build/build.ninja`, {encoding: 'utf8'}))
					.replace('-liconv', `${buildPrefix}/lib/libiconv.dylib`)
					.replace(/command = cc/gm, `command = cc -mmacosx-version-min=${macTargetVersion}`)
					.replace(/command = c\+\+/gm, `command = c++ -mmacosx-version-min=${macTargetVersion}`));

				if (pack.postConfigure)
					await pack.postConfigure();

				console.log(`Building ${pack.name} (${pack.link})`);
				try {
					await exec(`ninja -C _build install`, pack.name);
				} catch(err) {
					throw err.stdout.toString();
				}

				break;
			case 'make':
				console.log(`Cleaning ${pack.name} (${pack.link})`);
				try {
					await exec('make distclean > /dev/null', pack.name);
				} catch(e) {
					try {
						await exec('make clean > /dev/null', pack.name);
					} catch(e) {
					}
				}

				if (pack.postClean)
					await pack.postClean();

				if (pack.postConfigure)
					await pack.postConfigure();

				console.log(`Building ${pack.name} (${pack.link})`);
				await exec('make install > /dev/null', pack.name);

				break;
			case 'dll':
				if (pack.postClean)
					await pack.postClean();

				if (pack.postConfigure)
					await pack.postConfigure();

				for (const file of await fs.readdir(path.resolve(`${buildPrefix}/${pack.name}/`)))
					if (file === 'Release')
						for (const file of await fs.readdir(path.resolve(`${buildPrefix}/${pack.name}/Release`)))
							if (file.endsWith('.dll'))
								await fs.link(path.resolve(`${buildPrefix}/${pack.name}/Release/${file}`), path.resolve(`${buildPrefix}/${pack.name}/${file}`));

				break;
			case 'electron':
				// Run clean and configure functions
				if (pack.postClean)
					await pack.postClean();

				if (pack.postConfigure)
					await pack.postConfigure();

				// Install using npm
				console.log(`NPM Installing ${pack.name} (${pack.link})`);
				await exec(`npm install > /dev/null`, pack.name);

				const packJson = require(`${buildPrefix}/${pack.name}/package.json`);
				const dllDir = path.resolve(`${buildPrefix}/electron/${pack.name}`);

				// Build the package
				try {
					console.log(`Building ${pack.name} (${pack.link})`);
					//await exec(`npm rebuild ${electronConfig} > /dev/null`, pack.name);
					await exec(`${nodeGyp} rebuild ${electronConfig} > /dev/null`, pack.name);

					console.log('Copying built dlls and node files');
					await fs.mkdir(dllDir, {recursive: true});
					for (const file of await fs.readdir(`${buildPrefix}/${pack.name}/build/Release/`))
						if (file.endsWith('.dll') || (file.endsWith('.node') && !file.endsWith('postbuild.node')))
							try {
								await fs.copyFile(`${buildPrefix}/${pack.name}/build/Release/${file}`, `${dllDir}/${file}`);
							} catch(e) {
							}
				} catch(e) {
					console.log(`Skipping building of ${pack.name} due to node-gyp error`);
				}

				console.log(`Minifying ${pack.name} from entry ${packJson.main}`);
				await esbuild.build({
					entryPoints: [path.resolve(`${buildPrefix}/${pack.name}/${packJson.main}`)],
					bundle: true,
					minify: false,
					loader: {
					},
					define: {
						'process.env.NODE_ENV': '"production"',
					},
					platform: 'node',
					external: ['sharp', 'canvas', 'node-adodb', 'probelab-reimager', '*.node'],
					outfile: path.resolve(`${buildPrefix}/electron/${pack.name}/${packJson.main}`)
				});

				console.log('Copying package files');
				const files = await fs.readdir(`${buildPrefix}/${pack.name}`);
				for (const file of files)
					switch(file.toLowerCase()) {
						case 'package.json':
						case 'license':
							await fs.copyFile(`${buildPrefix}/${pack.name}/${file}`, `${buildPrefix}/electron/${pack.name}/${file}`);
							break;
					}

				// Inject required dlls
				if (process.platform === 'win32' && pack.requiresDlls) {
					console.log('Injecting external package DLLs');
					await fs.mkdir(dllDir, {recursive: true});
					for (const dllPack of pack.requiresDlls)
						for (const file of await fs.readdir(path.join(buildPrefix, dllPack)))
							if (file.endsWith('.dll'))
								await fs.copyFile(path.join(buildPrefix, dllPack, file), `${dllDir}/${file}`);
				}

				// Bundle dylibs on mac to make sure paths don't break
				if (process.platform === 'darwin')
					try {													//  Search Dir for libs                Bundled libs to  exec lib dir     file to fix
						await exec(`"${buildPrefix}/bin/dylibbundler" -s "${buildPrefix}/lib" -of -cd -b -d "../bin/libs" -p "./bin/libs/" -x "${dllDir}/${pack.name}.node"`);
					} catch(e) {
						console.log(`Unable to bundle ${pack.name}.node`);
					}
				break;
			default:
				break;
		}

		if (pack.postCompile)
			await pack.postCompile();

		if (pack.recompiles && pack.recompiles.length > 0)
			for (const packName of pack.recompiles)
				await compile(packages, packages.get(packName), true);
	}
}

module.exports = {
	compile
};