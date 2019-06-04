import { Store } from 'bakadux';

module.exports = new Store('settings', {
	scalePosition: 5,
	scaleColor: 'auto',
	belowColor: 'auto',
	scaleSize: 0,
	autoScale: true,
	scaleBarHeight: 0,
	autoHeight: true,
	scaleBarTop: true,
	pixelSizeConstant: 0,
	autoPixelSizeConstant: true
});