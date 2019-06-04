import { Store } from 'bakadux';

module.exports = new Store('general', {
	page: 'landing',
	workingDir: '',
	images: {},
	safebox: new Map(),
	selectedImage: undefined,
	selectedUuid: undefined
});