import { Store } from 'bakadux';

module.exports = new Store('general', {
	page: 'landing',
	workingDir: '',
	images: {},
	safebox: new Map(),
	selectedUuid: undefined,
	sidebarWidth: 300,
	optionsWidth: 300,
	interactable: true
});