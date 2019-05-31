import { Store } from 'bakadux';

module.exports = new Store('general', {
	page: 'landing',
	workingDir: '',
	images: {},
	selectedImage: undefined,
	scalePosition: 5,
	scaleColor: 'auto',
	belowColor: 'auto',
	scaleSize: 0,
	autoScale: true,
	scaleBarHeight: 0,
	autoHeight: true,
	scaleBarTop: true
});