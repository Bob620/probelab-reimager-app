const path = require('path');
const fs = require('fs/promises');

const {
	buildPrefix,
	configureConfig,
	cmakeConfig,
	mesonConfig,
	exec,
	packages,
	nodeGyp,
	electronConfig,
	macTargetVersion
} = require('./config.js');

async function compile(pack, recompile = false) {
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
				await exec(`./configure ${configureConfig} ${pack.args.join(' ')} > /dev/null`, pack.name);

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
				await exec(`cmake make ${cmakeConfig} ${pack.args.join(' ')} . > /dev/null`, pack.name);

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
					await exec(`meson _build ${mesonConfig} ${pack.args.join(' ')}`, pack.name);
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

				// Build the package
				console.log(`Building ${pack.name} (${pack.link})`);
				//await exec(`npm rebuild ${electronConfig} > /dev/null`, pack.name);
				await exec(`${nodeGyp} rebuild ${electronConfig} > /dev/null`, pack.name);

				if (process.platform === 'win32') {
					await fs.mkdir(`${buildPrefix}/electron/windows`, {recursive: true});
					for (const file of await fs.readdir(`${buildPrefix}/${pack.name}/build/Release/`))
						if (file.endsWith('.dll'))
							await fs.copyFile(`${buildPrefix}/${pack.name}/build/Release/${file}`, `${buildPrefix}/electron/windows/${file}`);
				}

				// Package the package to make it as small as possible
				console.log(`Packaging ${pack.name} (${pack.link})`);
				await exec('npm pack > /dev/null', pack.name);

				// Cleanup package directory to make sure any failed packages don't pollute
				const tarballName = `${pack.name}-${require(`${buildPrefix}/${pack.name}/package.json`).version}.tgz`;
				try {
					await fs.rmdir(`${buildPrefix}/electron/package`, {recursive: true});
				} catch(e) {
				}

				// Untar the package into the post-build directory
				await exec(`tar -C ${buildPrefix}/electron -xzf ${buildPrefix}/${pack.name}/${tarballName}`);
				try {
					await fs.unlink(`${buildPrefix}/${pack.name}/${tarballName}`);
				} catch(e) {
				}

				// Inject the compiled files back into the release as expected by node-gyp
				// Packaging does not keep compiled files as it is expected to be platform agnostic
				await fs.mkdir(`${buildPrefix}/electron/package/build/Release`, {recursive: true});
				await fs.copyFile(`${buildPrefix}/${pack.name}/build/Release/${pack.name}.node`, `${buildPrefix}/electron/package/build/Release/${pack.name}.node`);

				// Inject previously existing dlls
				if (process.platform === 'win32') {
					const files = await fs.readdir(`${buildPrefix}/electron/windows/`);
					for (const file of files)
						if (file.endsWith('.dll'))
							await fs.copyFile(`${buildPrefix}/electron/windows/${file}`, `${buildPrefix}/electron/package/build/Release/${file}`);
					await fs.rm(`${buildPrefix}/electron/windows`, {recursive: true});
				}

				// Inject required dlls
				if (process.platform === 'win32' && pack.requiresDlls)
					for (const dllPack of pack.requiresDlls)
						for (const file of await fs.readdir(path.join(buildPrefix, dllPack)))
							if (file.endsWith('.dll'))
								await fs.copyFile(path.join(buildPrefix, dllPack, file), `${buildPrefix}/electron/package/build/Release/${file}`);

				// move the generic package to post-compiled state
				await fs.rename(`${buildPrefix}/electron/package`, `${buildPrefix}/electron/${pack.name}`);

				// Bundle dylibs on mac to make sure paths don't break
				if (process.platform === 'darwin')
					await exec(`"${buildPrefix}/bin/dylibbundler" -s "${buildPrefix}/lib" -of -cd -b -d "./bin/libs" -x "${buildPrefix}/electron/${pack.name}/build/Release/${pack.name}.node" -p "@rpath/libs/"`);
				break;
			default:
				break;
		}

		if (pack.postCompile)
			await pack.postCompile();

		if (pack.recompiles && pack.recompiles.length > 0)
			for (const packName of pack.recompiles)
				await compile(packages.get(packName), true);
	}
}

module.exports = {
	compile
};