const path = require('path');
const fs = require('fs');
const fsPromise = fs.promises;
const {NSS, constants, JeolImage, PFE} = require('probelab-reimager');

const appConstants = require('../../../../constants.json');
const {CreateFakeLog} = require('../../log.js');

const Functions = {
	sanitizePosition: inputPos => {
		switch(inputPos) {
			case appConstants.settings.scalePositions.UPPERRIGHT:
				return constants.scale.types.UPPERRIGHT;
			case appConstants.settings.scalePositions.UPPERLEFT:
				return constants.scale.types.UPPERLEFT;
			case appConstants.settings.scalePositions.LOWERLEFT:
				return constants.scale.types.LOWERLEFT;
			case appConstants.settings.scalePositions.LOWERRIGHT:
				return constants.scale.types.LOWERRIGHT;
			default:
			case appConstants.settings.scalePositions.LOWERCENTER:
				return constants.scale.types.LOWERCENTER;
			case appConstants.settings.scalePositions.BELOWLEFT:
				return constants.scale.types.BELOWLEFT;
			case appConstants.settings.scalePositions.BELOWRIGHT:
				return constants.scale.types.BELOWRIGHT;
			case appConstants.settings.scalePositions.BELOWCENTER:
				return constants.scale.types.BELOWCENTER;
			case appConstants.settings.scalePositions.JEOL:
				return constants.scale.types.JEOL;
			case appConstants.settings.scalePositions.NONE:
				return constants.scale.types.NONE;
		}
	},
	sanitizeColor: inputColor => {
		switch(inputColor) {
			default:
			case appConstants.settings.colors.AUTO:
				return constants.colors.AUTO;
			case appConstants.settings.colors.WHITE:
				return constants.colors.white;
			case appConstants.settings.colors.BLACK:
				return constants.colors.black;
			case appConstants.settings.colors.RED:
				return constants.colors.red;
			case appConstants.settings.colors.ORANGE:
				return constants.colors.orange;
		}
	},
	sanitizePointType: pointType => {
		switch(pointType) {
			default:
			case appConstants.settings.pointTypes.THERMOLIKE:
				return constants.point.types.THERMOINSTANT;
			case appConstants.settings.pointTypes.THERMOROUND:
				return constants.point.types.THERMOINSTANTROUND;
			case appConstants.settings.pointTypes.CROSS:
				return constants.point.types.CROSS;
			case appConstants.settings.pointTypes.CIRCLE:
				return constants.point.types.CIRCLE;
		}
	},
	sanitizeSettings: inputSettings => {
		const settings = {
			scaleColor: Functions.sanitizeColor(inputSettings.scaleColor),
			belowColor: Functions.sanitizeColor(inputSettings.belowColor),
			textColor: Functions.sanitizeColor(inputSettings.pointColor),
			pointType: Functions.sanitizePointType(inputSettings.pointType),
			backgroundOpacity: inputSettings.autoBackgroundOpacity ? 0 : inputSettings.backgroundOpacity,
			pointFontSize: inputSettings.autoPointFontSize ? 0 : inputSettings.pointFontSize,
			pointSize: inputSettings.autoPointFontSize ? 0 : (inputSettings.pointFontSize / 2),
			scaleSize: inputSettings.autoScale ? 0 : inputSettings.scaleSize,
			scaleBarHeight: inputSettings.autoHeight ? 0 : (inputSettings.scaleBarHeight / 100),
			scaleBarLabelSize: inputSettings.autoLabelSize ? 0 : (inputSettings.scaleBarLabelSize / 100),
			scaleBarTop: inputSettings.scaleBarPosition === appConstants.settings.scaleBarPositions.ABOVE,
			pixelSizeConstant: inputSettings.autoPixelSizeConstant ? 0 : inputSettings.pixelSizeConstant,
			uri: inputSettings.uri
		};

		if (inputSettings.png)
			settings.png = inputSettings.png;
		if (inputSettings.jpeg)
			settings.jpeg = inputSettings.jpeg;
		if (inputSettings.tiff)
			settings.tiff = inputSettings.tiff;
		if (inputSettings.webp)
			settings.webp = inputSettings.webp;
		if (inputSettings.acq)
			settings.acq = inputSettings.acq;

		return settings;
	},
	getDir: async (dirUri, canvas, pixelSizeConstant = constants.PIXELSIZECONSTANT, log = CreateFakeLog()) => {
		const directory = await fsPromise.readdir(dirUri, {withFileTypes: true});
		log.info(`Found ${directory.length} files in selected directory`);
		const files = (await Functions.getImages(dirUri, canvas, pixelSizeConstant, log)).filter(i => i);
		log.info(`Found ${files.length} valid images in selected directory`);
		const subFiles = (await Promise.all(directory.map(dir => dir.isDirectory() ? Functions.getImages(dirUri + dir.name + path.sep, canvas, pixelSizeConstant, log) : []))).flat().filter(i => i);
		log.info(`Found ${subFiles.length} valid images in sub directories`);
		return files.concat(subFiles);
	},
	getImages: async (dirUri, canvas, pixelSizeConstant = constants.PIXELSIZECONSTANT, log = CreateFakeLog()) => {
		const files = (await fsPromise.readdir(dirUri, {withFileTypes: true})).filter(file => file.isFile());
		let thermos = [];
		let extraLayers = [];

		return (await Promise.all(files.flatMap(file => {
			file.uri = dirUri + file.name;
			if (file.name.endsWith(constants.extractedMap.fileFormats.LAYER)) {
				extraLayers.push(file);
				return Promise.all(thermos.map(thermo => thermo.addLayerFile(file.uri))).then(() => undefined);
			} else {
				const thermoItem = Functions.createThermo(file, canvas, pixelSizeConstant, undefined, log);
				if (thermoItem && thermoItem[1]) {
					let outThermos;
					if (thermoItem[0].getImages === undefined) {
						outThermos = [thermoItem[0]];
					} else {
						outThermos = thermoItem[1];
					}

					return new Promise(async resolve => {
						try {
							for (const thermo of await outThermos) {
								await thermo.init();
								thermos.push(thermo);
								for (const layer of extraLayers)
									await thermo.addLayerFile(layer.uri);
							}
							resolve(outThermos);
						} catch(e) {
							log.warn(e.stack);
							log.warn(e.message);
							resolve();
						}
					});
				}
			}
		}).flat())).filter(i => i).flat();
	},
	createThermo: (file, canvas, pixelSizeConstant = constants.PIXELSIZECONSTANT, uuid = undefined, log = CreateFakeLog()) => {
		if (file.isFile()) {
			let thermo;
			const fileName = file.name.toLowerCase();

			if (fileName.endsWith(constants.jeol.fileFormats.ENTRY))
				try {
					thermo = new JeolImage(file, canvas);
				} catch(err) {
				}

			if (fileName.endsWith(constants.pointShoot.fileFormats.ENTRY) || fileName.endsWith(constants.extractedMap.fileFormats.ENTRY) || fileName.endsWith('.map'))
				thermo = new NSS(file, pixelSizeConstant, canvas);

			if (fileName.endsWith(constants.pfe.fileFormats.ENTRY.toLowerCase()))
				thermo = new PFE(file, canvas);

			if (thermo)
				return [thermo, new Promise(async (resolve, reject) => {
					try {
						const output = await thermo.init();
						thermo.data.uuid = uuid ? uuid : thermo.data.uuid;
						resolve(output);
					} catch(e) {
						reject(e);
					}
				})];
		}

		return undefined;
	}
};

module.exports = Functions;