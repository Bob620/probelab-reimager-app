const fs = require('fs');
const ThermoReimager = require('thermo-reimager');

const generateUUID = require('../generateuuid.js');

Promise.all([ThermoReimager.PointShoot, ThermoReimager.ExtractedMap]).then(([PointShoot, ExtractedMap]) => {
	let thermos = {};
	let safebox = {};
	let image = undefined;
	let imageUuid = undefined;
	let thermo = undefined;

	process.on('message', async ({type, data, uuid}) => {
		try {
			switch(type) {
				case 'save':
					const newUuid = generateUUID.v4();
					thermo = thermos[data.uuid];
					if (thermo === undefined)
						thermo = safebox[data.uuid];

					safebox[newUuid] = thermo;
					process.send({type: 'resolve', data: {uuid: newUuid}, uuid});
					break;
				case 'remove':
					safebox[data.uuid] = undefined;
					break;
				case 'processDirectory':
					thermos = processDirectory(data.uri);
					const tempThermos = processDirectory(`${data.uri}.~temp/`);

					for (const uuid of Object.keys(tempThermos))
						thermos[uuid] = tempThermos[uuid];

					process.send({type: 'resolve', data: thermos, uuid});
					break;
				case 'addScale':
					thermo = thermos[data.uuid];
					if (thermo === undefined)
						thermo = safebox[data.uuid];

					imageUuid = data.uuid;
					image = await addScale(thermo, data);
					process.send({type: 'resolve', data: await image.getBase64Async('image/png'), uuid});
					break;
				case 'writeImage':
					thermo = thermos[data.uuid];
					if (thermo === undefined)
						thermo = safebox[data.uuid];

					await writeImage(thermo, data);
					process.send({type: 'resolve', data: {uuid: data.uuid}, uuid});
					break;
			}
		} catch (err) {
			process.send({type: 'reject', data: err.stack, uuid});
		}
	});

	async function writeImage(thermo, data) {
		if (thermo.data.image)
			await thermo.writeImage(data);
		else
			await thermo.addScaleAndWrite(data.scaleType, {
				scaleSize: data.scaleSize ? data.scaleSize : 0,
				scaleColor: data.scaleColor ? data.scaleColor : ThermoReimager.constants.scale.colors.AUTO,
				belowColor: data.belowColor ? data.belowColor : ThermoReimager.constants.scale.colors.AUTO,
				scaleBarHeight: data.scaleBarHeight ? data.scaleBarHeight : ThermoReimager.constants.scale.AUTOSIZE,
				scaleBarTop: data.scaleBarTop ? data.scaleBarTop : ThermoReimager.constants.scale.SCALEBARTOP,
				pixelSizeConstant: data.pixelSizeConstant ? data.pixelSizeConstant : ThermoReimager.constants.PIXELSIZECONSTANT,
				uri: data.uri
			});

		thermo.data.image = undefined;
	}

	async function addScale(thermo, data) {
		await thermo.addScale(data.scaleType, {
			scaleSize: data.scaleSize ? data.scaleSize : 0,
			scaleColor: data.scaleColor ? data.scaleColor : ThermoReimager.constants.scale.colors.AUTO,
			belowColor: data.belowColor ? data.belowColor : ThermoReimager.constants.scale.colors.AUTO,
			scaleBarHeight: data.scaleBarHeight ? data.scaleBarHeight : ThermoReimager.constants.scale.AUTOSIZE,
			scaleBarTop: data.scaleBarTop ? data.scaleBarTop : ThermoReimager.constants.scale.SCALEBARTOP,
			pixelSizeConstant: data.pixelSizeConstant ? data.pixelSizeConstant : ThermoReimager.constants.PIXELSIZECONSTANT
		});

		const image = thermo.data.image;
		thermo.data.image = undefined;

		return image;
	}

	function processDirectory(dirUri) {
		try {
			const directory = fs.readdirSync(dirUri, {withFileTypes: true});

			return directory.flatMap(dir => {
				if (dir.isDirectory()) {
					const files = fs.readdirSync(dirUri + dir.name, {withFileTypes: true});
					return files.filter(file => file.isFile()).map(file => {
						file.uri = dirUri + dir.name + '/' + file.name;
						if (file.name.endsWith(ThermoReimager.constants.pointShoot.fileFormats.ENTRY))
							return new PointShoot(file);

						if (file.name.endsWith(ThermoReimager.constants.extractedMap.fileFormats.ENTRY))
							return new ExtractedMap(file);
					}).filter(item => item);
				}
			}).filter(i => i).reduce((items, item) => {
				item.data.uuid = item.data.files.entry;
				items[item.data.uuid] = item;
				return items;
			}, {});
		} catch(err) {
			return {};
		}
	}

	process.send({
		type: 'ready',
		data: {}
	});
});