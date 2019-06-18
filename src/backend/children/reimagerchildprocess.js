const fs = require('fs');
const { PointShoot, ExtractedMap, CanvasRoot, constants, NodeCanvas } = require('thermo-reimager');

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
				workingDir = data.uri ? data.uri : workingDir;
				thermos = processDirectory(workingDir);
				const tempThermos = processDirectory(`${workingDir}~temp/`);

				if (dirWatcher)
					dirWatcher.close();
				if (dirTempWatcher)
					dirTempWatcher.close();

				dirWatcher = fs.watch(workingDir, () => {
					process.send({type: 'directoryUpdate'});
				});
				dirTempWatcher = fs.watch(`${workingDir}~temp/`, () => {
					process.send({type: 'directoryUpdate'});
				});

				for (const uuid of Object.keys(tempThermos))
					thermos[uuid] = tempThermos[uuid];

				process.send({type: 'resolve', data: Object.values(thermos).reduce((thermos, thermo) => {thermos[thermo.data.uuid] = thermo.serialize(); return thermos}, {}), uuid});
				break;
			case 'addScale':
				thermo = thermos[data.uuid];
				if (thermo === undefined)
					thermo = safebox[data.uuid];

				imageUuid = data.uuid;
				image = await addScale(thermo, data);
				process.send({type: 'resolve', data: {uuid: imageUuid, image}, uuid});
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

	if (thermo.data.image)
		await thermo.writeImage(data);
	else
		await thermo.createWrite(data.scaleType, {
			scaleSize: data.scaleSize ? data.scaleSize : 0,
			scaleBarHeight: data.scaleBarHeight ? data.scaleBarHeight : constants.scale.AUTOSIZE,
			scaleBarTop: data.scaleBarTop ? data.scaleBarTop : constants.scale.SCALEBARTOP,
			pixelSizeConstant: data.pixelSizeConstant ? data.pixelSizeConstant : constants.PIXELSIZECONSTANT,
			backgroundOpacity: data.backgroundOpacity ? data.backgroundOpacity : constants.scale.background.AUTOOPACITY,
			font: data.font ? data.font : constants.fonts.OPENSANS,
			uri: data.uri
		});
}

async function addScale(thermo, data) {
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
			item.serialize = function() {
				return {
					data: {
						uri: this.data.uri,
						name: this.data.name,
						uuid: this.data.uuid,
						points: this.data.points,
						files: this.data.files
					}
				}
			}.bind(item);

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