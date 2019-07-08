const fs = require('fs');
const fsPromise = fs.promises;
const { PointShoot, ExtractedMap, constants, calculations } = require('thermo-reimager');

const Functions = {
	getDir: async (dirUri, canvas) => {
		try {
			const directory = await fsPromise.readdir(dirUri, {withFileTypes: true});

			return (await Promise.all(directory.map(dir => {
				if (dir.isDirectory()) {
					const files = fs.readdirSync(dirUri + dir.name + '/', {withFileTypes: true});

					return Promise.all(files.filter(file => file.isFile()).map(file => {
						file.uri = dirUri + dir.name + '/' + file.name;
						return Functions.createThermo(file, canvas);
					}));
				}
			}))).flat().filter(i => i);
		} catch(err) {
			return [];
		}
	},
	createThermo: async (file, canvas, uuid=undefined) => {
		if (file.isFile()) {
			let thermo;

			if (file.name.endsWith(constants.pointShoot.fileFormats.ENTRY))
				thermo = new PointShoot(file, canvas);

			if (file.name.endsWith(constants.extractedMap.fileFormats.ENTRY))
				thermo = new ExtractedMap(file, canvas);

			if (thermo) {
				await thermo.init();
				thermo.data.uuid = uuid ? uuid : thermo.data.uuid;
				return thermo;
			}
		}

		return undefined;
	}
};

module.exports = Functions;