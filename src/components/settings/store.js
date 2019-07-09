import { Store } from 'bakadux';

import constants from '../../../constants.json';

module.exports = new Store('settings', {
	scalePosition: constants.settings.scalePositions.LOWERCENTER,
	scaleColor: constants.settings.colors.AUTO,
	belowColor: constants.settings.colors.AUTO,
	pointColor: constants.settings.colors.RED,
	pointType: constants.settings.pointTypes.THERMOLIKE,
	autoPointFontSize: true,
	pointFontSize: 0,
	autoBackgroundOpacity: true,
	backgroundOpacity: 0,
	scaleSize: 0,
	autoScale: true,
	scaleBarHeight: 0,
	autoHeight: true,
	scaleBarTop: true,
	pixelSizeConstant: 0,
	autoPixelSizeConstant: true,
	activePoints: [],
	activeLayers: [{name: constants.settings.BASELAYER}]
});