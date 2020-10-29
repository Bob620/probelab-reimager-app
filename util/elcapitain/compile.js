const fs = require('fs/promises');

const {buildPrefix, configureConfig, cmakeConfig, mesonConfig, exec, packages, nodeGyp, electronConfig} = require('./config.js');

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
				console.log(`Configuring ${pack.name} (${pack.link})`);
				await exec(`./configure ${configureConfig} ${pack.args.join(' ')} > /dev/null`, pack.name);

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
				console.log(`Configuring ${pack.name} (${pack.link})`);
				await exec(`cmake make ${cmakeConfig} ${pack.args.join(' ')} . > /dev/null`, pack.name);

				console.log(`Building ${pack.name} (${pack.link})`);
				await exec('cmake --build . --target install > /dev/null', pack.name);
				break;
			case 'meson':
				console.log(`Cleaning ${pack.name} (${pack.link})`);
				try {
					await fs.rmdir(`${buildPrefix}/${pack.name}/_build`, {recursive: true});
					await fs.unlink('meson_options.txt');
				} catch(e) {
				}

				console.log(`Configuring ${pack.name} (${pack.link})`);
				try {
					await exec(`meson _build ${mesonConfig} ${pack.args.join(' ')}`, pack.name);
				} catch(err) {
					throw err.stdout.toString();
				}

				await fs.writeFile(`${buildPrefix}/${pack.name}/_build/build.ninja`, (await fs.readFile(`${buildPrefix}/${pack.name}/_build/build.ninja`, {encoding: 'utf8'})).replace('-liconv', `${buildPrefix}/lib/libiconv.dylib`));

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

				console.log(`Building ${pack.name} (${pack.link})`);
				await exec('make install > /dev/null', pack.name);

				break;
			case 'electron':
				console.log(`Building ${pack.name} (${pack.link})`);
				await exec(`${nodeGyp} rebuild ${electronConfig} > /dev/null`, pack.name);

				console.log(`Packaging ${pack.name} (${pack.link})`);
				await exec('npm pack > /dev/null', pack.name);

				const tarballName = `${pack.name}-${require(`${buildPrefix}/${pack.name}/package.json`).version}.tgz`;
				try {
					await fs.rmdir(`${buildPrefix}/electron/package`, {recursive: true});
				} catch(e) {}
				
				await exec(`tar -C ${buildPrefix}/electron -xzf ${buildPrefix}/${pack.name}/${tarballName}`);
				try {
					await fs.unlink(`${buildPrefix}/${pack.name}/${tarballName}`);
				} catch(e) {}

				await fs.mkdir(`${buildPrefix}/electron/package/build/Release`, {recursive: true});
				await fs.copyFile(`${buildPrefix}/${pack.name}/build/Release/${pack.name}.node`, `${buildPrefix}/electron/package/build/Release/${pack.name}.node`);
				await fs.rename(`${buildPrefix}/electron/package`, `${buildPrefix}/electron/${pack.name}`);

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