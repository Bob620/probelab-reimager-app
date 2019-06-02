const fs = require('fs');
const ThermoReimager = require('thermo-reimager');

const generateUUID = require('./generateuuid.js');

Promise.all([ThermoReimager.PointShoot, ThermoReimager.ExtractedMap]).then(([PointShoot, ExtractedMap]) => {
	let thermos = {};
	let thermo;

	process.on('message', async ({type, data, uuid}) => {
		try {
			switch(type) {
				case 'processDirectory':
					thermos = processDirectory(data.uri);
					process.send({type: 'resolve', data: thermos, uuid});
					break;
				case 'addScale':
					thermo = await addScale(thermos[data.uuid], data);
					process.send({type: 'resolve', data: await thermo.data.image.getBase64Async('image/png'), uuid});
					break;
				case 'writeImage':
					await writeImage(thermos[data.uuid], data);
					process.send({type: 'resolve', data: {uuid: data.uuid}, uuid});
					break;
			}
		} catch (err) {
			process.send({type: 'reject', data: err, uuid});
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
				uri: path
			});
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

		return thermo;
	}

	function processDirectory(dirUri) {
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
			item.data.uuid = generateUUID.v4();
			items[item.data.uuid] = item;
			return items;
		}, {});
	}

	process.send({
		type: 'ready',
		data: {}
	});
});