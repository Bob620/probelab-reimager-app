const fs = require('fs/promises');

const bent = require('bent')('buffer');

const {buildPrefix, exec} = require('./config.js');

async function doomload(type, link, pack, name, downloadLocation, extractLocation) {
	try {
		await fs.writeFile(downloadLocation, await bent(link));
		await fs.mkdir(extractLocation);
		if (type === 'zip') {
			let rawName = name.split('.');
			rawName.pop();
			rawName = rawName.join('.');

			await exec(`unzip -d ${extractLocation} ${downloadLocation}`);
			try {
				await exec(`mv ${extractLocation}/${rawName}/* ${extractLocation}`);
			} catch(e) {
				try {
					await exec(`mv ${extractLocation}/${pack.name}-${rawName}/* ${extractLocation}`);
				} catch(e) {
					await exec(`mv ${extractLocation}/${pack.name}-${rawName.replace('v', '')}/* ${extractLocation}`);
				}
			}
		} else
			await exec(`tar --strip-components=1 -C ${extractLocation} -${type} ${downloadLocation}`);
	} catch(err) {
		if (err.statusCode === 302)
			return doomload(type, err.headers.location, pack, name, downloadLocation, extractLocation);
		throw err;
	}
}

async function download(pack) {
	let type;
	const name = pack.link.split('/').slice(-1)[0];
	const downloadLocation = `${buildPrefix}/${name}`;
	const extractLocation = `${buildPrefix}/${pack.name}`;

	if (!pack.downloaded)
		switch(pack.link.split('.').pop()) {
			case 'zip':
				if (!type) type = 'zip';
			case 'gz':
				if (!type) type = 'xzf';
			case 'xz':
				if (!type) type = 'xJf';
			case 'bz2':
				if (!type) type = 'xjf';
			case 'lz':
				if (!type) type = '-lzma -xf';
			case 'tar':
				if (!type) type = 'xf';
				console.log(`Downloading ${pack.name} (${pack.link})`);

				await doomload(type, pack.link, pack, name, downloadLocation, extractLocation);
				await fs.unlink(downloadLocation);
				pack.downloaded = true;
				break;
			case 'git':
				console.log(`Cloning ${pack.name} (${pack.link})`);

				await exec(`git clone --recurse-submodules ${pack.link}`);
				if (downloadLocation.split('.').slice(0, -1).join('.') !== extractLocation)
					await fs.rename(downloadLocation.split('.').slice(0, -1).join('.'), extractLocation);
				pack.downloaded = true;
				break;
			default:
				console.log(`Unable to download ${pack.name} (${pack.link})`);
				break;
		}
}

module.exports = {
	download
};