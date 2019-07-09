import { Store } from 'bakadux';

module.exports = new Store('general', {
	page: 'landing',
	workingDir: '',
	images: new Map(),
	safebox: new Map(),
	selectedUuid: undefined,
	selectedImage: undefined,
	sidebarWidth: 300,
	optionsWidth: 300,
	interactable: true
});