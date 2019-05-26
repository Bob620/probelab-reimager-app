import { Store } from 'bakadux';

module.exports = new Store('general', {
	page: 'landing',
	workingDir: '',
	images: {},
	selectedImage: undefined,
	scalePosition: 0
});