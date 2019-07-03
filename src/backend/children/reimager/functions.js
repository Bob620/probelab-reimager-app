const fs = require('fs');
const fsPromise = fs.promises;
const { PointShoot, ExtractedMap, constants } = require('thermo-reimager');

const Functions = {
	getDir: async (dirUri, canvas) => {
		try {
			const directory = await fsPromise.readdir(dirUri, {withFileTypes: true});

			return directory.flatMap(dir => {
				if (dir.isDirectory()) {
					const files = fs.readdirSync(dirUri + dir.name + '/', {withFileTypes: true});

					return files.filter(file => file.isFile()).map(file => {
						file.uri = dirUri + dir.name + '/' + file.name;
						return Functions.createThermo(file, canvas);
					});
				}
			}).filter(i => i);
		} catch(err) {
			return [];
		}
	},
	createThermo: (file, canvas, uuid=undefined) => {
		if (file.isFile()) {
			let thermo;

			if (file.name.endsWith(constants.pointShoot.fileFormats.ENTRY))
				thermo = new PointShoot(file, canvas);

			if (file.name.endsWith(constants.extractedMap.fileFormats.ENTRY))
				thermo = new ExtractedMap(file, canvas);

			if (thermo) {
				thermo.data.uuid = uuid ? uuid : thermo.data.name;
				thermo.uuidSerialize = () => {
					let serial = thermo.serialize();
					serial.uuid = thermo.data.uuid;
					return serial;
				};

				return thermo;
			}
		}

		return undefined;
	}
};

module.exports = Functions;