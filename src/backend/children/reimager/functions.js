const fs = require('fs');
const fsPromise = fs.promises;
const { PointShoot, ExtractedMap, constants } = require('thermo-reimager');

const appConstants = require('../../../../constants.json');

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
		return {
			scaleColor: Functions.sanitizeColor(inputSettings.scaleColor),
			belowColor: Functions.sanitizeColor(inputSettings.belowColor),
			textColor: Functions.sanitizeColor(inputSettings.pointColor),
			pointType: Functions.sanitizePointType(inputSettings.pointType),
			backgroundOpacity: inputSettings.autoBackgroundOpacity ? 0 : inputSettings.backgroundOpacity,
			pointFontSize: inputSettings.autoPointFontSize ? 0 : inputSettings.pointFontSize,
			pointSize: inputSettings.autoPointFontSize ? 0 : (inputSettings.pointFontSize / 2),
			scaleSize: inputSettings.autoScale ? 0 : inputSettings.scaleSize,
			scaleBarHeight: inputSettings.autoHeight ? 0 : (inputSettings.scaleBarHeight / 100),
			scaleBarTop: true,
			pixelSizeConstant: inputSettings.autoPixelSizeConstant ? 0 : inputSettings.pixelSizeConstant,
			png: inputSettings.png ? inputSettings.png : undefined,
			jpeg: inputSettings.jpeg ? inputSettings.jpeg : undefined,
			tiff: inputSettings.tiff ? inputSettings.tiff : undefined,
			webp: inputSettings.webp ? inputSettings.webp : undefined
		}
	},
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