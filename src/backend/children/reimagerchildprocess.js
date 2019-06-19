const fs = require('fs');
const { PointShoot, ExtractedMap, CanvasRoot, constants, NodeCanvas, calculations } = require('thermo-reimager');

const generateUUID = require('../generateuuid.js');
const canvas = new CanvasRoot(new NodeCanvas(require('canvas')));

let dirWatcher = undefined;
let dirTempWatcher = undefined;
let workingDir = '';
let thermos = {};
let safebox = {};
let image = undefined;
let imageUuid = undefined;
let thermo = undefined;

process.on('message', async ({type, data, uuid}) => {
	try {
		let serial;
		switch(type) {
			case 'canvas':
				if (data.type === 'init')
					await canvas.init();
				break;
			case 'save':
				const newUuid = generateUUID.v1Lexical();
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
				if (data && data.uri && workingDir !== data.uri) {
					workingDir = data.uri ? data.uri : workingDir;
					if (dirWatcher)
						dirWatcher.close();
					if (dirTempWatcher)
						dirTempWatcher.close();

					try {
						fs.accessSync(workingDir);
						dirWatcher = fs.watch(workingDir, () => {
							process.send({type: 'directoryUpdate'});
						});

						fs.accessSync(`${workingDir}~temp/`);
						dirTempWatcher = fs.watch(`${workingDir}~temp/`, () => {
							process.send({type: 'directoryUpdate'});
						});
					} catch(err) {}
				}

				try {
					fs.accessSync(workingDir);
					thermos = processDirectory(workingDir);
					try {
						fs.accessSync(`${workingDir}~temp/`);
						const tempThermos = processDirectory(`${workingDir}~temp/`);

						for (const uuid of Object.keys(tempThermos))
							thermos[uuid] = tempThermos[uuid];
					} catch(err) {}

					process.send({type: 'resolve', data: Object.values(thermos).reduce((thermos, thermo) => {
						thermos[thermo.data.uuid] = thermo.serialize();
						thermos[thermo.data.uuid].uuid = thermo.data.uuid;
						return thermos
					}, {}), uuid});
				} catch(err) {
					process.send({type: 'reject', data: err.stack, uuid});
				}
				break;
			case 'addScale':
				imageUuid = data.uuid;
				thermo = thermos[data.uuid];
				if (thermo === undefined)
					thermo = safebox[data.uuid];

				if (imageUuid === data.uuid) {
					image = await addScale(thermo, data, data.points);
					serial = thermo.serialize();
					serial.uuid = thermo.data.uuid;
					if (imageUuid === data.uuid)
						process.send({type: 'resolve', data: {uuid: data.uuid, image, thermo: serial}, uuid});
					else
						process.send({type: 'reject', data: {uuid: data.uuid}, uuid});
				} else
					process.send({type: 'reject', data: {uuid: data.uuid}, uuid});
				break;
			case 'writeImage':
				thermo = thermos[data.uuid];
				if (thermo === undefined)
					thermo = safebox[data.uuid];

				await writeImage(thermo, data);
				serial = thermo.serialize();
				serial.uuid = thermo.data.uuid;
				process.send({type: 'resolve', data: {uuid: data.uuid, thermo: serial}, uuid});
				break;
		}
	} catch (err) {
		process.send({type: 'reject', data: err.stack, uuid});
	}
});

async function writeImage(thermo, data) {
	switch (data.scaleColor) {
		default:
		case 'auto':
			data.scaleColor = constants.colors.AUTO;
			break;
		case 'white':
			data.scaleColor = constants.colors.white;
			break;
		case 'black':
			data.scaleColor = constants.colors.black;
			break;
	}

	switch (data.belowColor) {
		default:
		case 'auto':
			data.belowColor = constants.colors.AUTO;
			break;
		case 'white':
			data.belowColor = constants.colors.white;
			break;
		case 'black':
			data.belowColor = constants.colors.black;
			break;
	}

	switch(data.pointType) {
		default:
		case 'thermo':
			data.pointType = constants.point.types.THERMOINSTANT;
			break;
		case 'thermoCircle':
			data.pointType = constants.point.types.THERMOINSTANTROUND;
			break;
		case 'circle':
			data.pointType = constants.point.types.CIRCLE;
			break;
		case 'cross':
			data.pointType = constants.point.types.CROSS;
			break;
	}

	await thermo.createWrite(data.scaleType, {
		scaleSize: data.scaleSize ? data.scaleSize : 0,
		scaleBarHeight: data.scaleBarHeight ? data.scaleBarHeight : constants.scale.AUTOSIZE,
		scaleBarTop: data.scaleBarTop ? data.scaleBarTop : constants.scale.SCALEBARTOP,
		pixelSizeConstant: data.pixelSizeConstant ? data.pixelSizeConstant : constants.PIXELSIZECONSTANT,
		backgroundOpacity: data.backgroundOpacity ? data.backgroundOpacity : constants.scale.background.AUTOOPACITY,
		font: data.font ? data.font : constants.fonts.OPENSANS,
		uri: data.uri,
		pointType: data.pointType,
		textColor: data.textColor ? constants.colors[data.textColor] : constants.colors.red,
		pointSize: data.pointSize ? data.pointSize : constants.point.AUTOSIZE,
		pointFontSize: data.pointFontSize ? data.pointFontSize : constants.point.AUTOSIZE,
		pointFont: data.pointFont ? data.pointFont : constants.fonts.OPENSANS
	}, data.points.map(point => {
		const [x, y] = calculations.pointToXY(point, thermo.data.scale.imageWidth, thermo.data.scale.imageHeight);
		const test = {
			x, y,
			name: point.name.match(/pt(\d.+)psmsa/miu)[1].slice(0, -1)
		};
		process.send({type: 'debug', data: test});
		return test;
	}));
}

async function addScale(thermo, data, points=[]) {
	try {
		switch(data.scaleColor) {
			default:
			case 'auto':
				data.scaleColor = constants.colors.AUTO;
				break;
			case 'white':
				data.scaleColor = constants.colors.white;
				break;
			case 'black':
				data.scaleColor = constants.colors.black;
				break;
		}

		switch(data.belowColor) {
			default:
			case 'auto':
				data.belowColor = constants.colors.AUTO;
				break;
			case 'white':
				data.belowColor = constants.colors.white;
				break;
			case 'black':
				data.belowColor = constants.colors.black;
				break;
		}

		switch(data.pointType) {
			default:
			case 'thermo':
				data.pointType = constants.point.types.THERMOINSTANT;
				break;
			case 'thermoCircle':
				data.pointType = constants.point.types.THERMOINSTANTROUND;
				break;
			case 'circle':
				data.pointType = constants.point.types.CIRCLE;
				break;
			case 'cross':
				data.pointType = constants.point.types.CROSS;
				break;
		}

		await thermo.addScale(data.scaleType, {
			scaleSize: data.scaleSize ? data.scaleSize : 0,
			scaleColor: data.scaleColor,
			belowColor: data.belowColor,
			scaleBarHeight: data.scaleBarHeight ? data.scaleBarHeight : constants.scale.AUTOSIZE,
			scaleBarTop: data.scaleBarTop ? data.scaleBarTop : constants.scale.SCALEBARTOP,
			pixelSizeConstant: data.pixelSizeConstant ? data.pixelSizeConstant : constants.PIXELSIZECONSTANT,
			backgroundOpacity: data.backgroundOpacity ? data.backgroundOpacity : constants.scale.background.AUTOOPACITY,
			font: data.font ? data.font : constants.fonts.OPENSANS
		});

		for (const point of points)
			if (point && point.values)
				await thermo.addPoint(...calculations.pointToXY(point, thermo.data.scale.imageWidth, thermo.data.scale.imageHeight), point.name.match(/pt(\d.+)psmsa/miu)[1].slice(0, -1), {
					pointType: data.pointType,
					textColor: data.textColor ? constants.colors[data.textColor] : constants.colors.red,
					pointSize: data.pointSize ? data.pointSize : constants.point.AUTOSIZE,
					pointFontSize: data.pointFontSize ? data.pointFontSize : constants.point.AUTOSIZE,
					pointFont: data.pointFont ? data.pointFont : constants.fonts.OPENSANS
				});

		return await thermo.toUrl({png: {quality: 100}});
	} catch(err) {
		console.warn(err);
	}
}

function processDirectory(dirUri) {
	try {
		const directory = fs.readdirSync(dirUri, {withFileTypes: true});

		return directory.flatMap(dir => {
			if (dir.isDirectory()) {
				const files = fs.readdirSync(dirUri + dir.name, {withFileTypes: true});
				return files.filter(file => file.isFile()).map(file => {
					file.uri = dirUri + dir.name + '/' + file.name;
					if (file.name.endsWith(constants.pointShoot.fileFormats.ENTRY))
						return new PointShoot(file, canvas);

					if (file.name.endsWith(constants.extractedMap.fileFormats.ENTRY))
						return new ExtractedMap(file, canvas);
				}).filter(item => item);
			}
		}).filter(i => i).reduce((items, item) => {
			item.data.uuid = item.data.name;
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