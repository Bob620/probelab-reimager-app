import { Store } from 'bakadux';

import constants from '../../../constants.json';

module.exports = new Store('general', {
	page: 'landing',
	workingDir: '',
	images: new Map(),
	safebox: new Map(),
	selectedUuid: undefined,
	selectedImage: undefined,
	sidebarWidth: 300,
	optionsWidth: 300,
	interactable: true,
	optionsList: constants.optionsLists.POINTS,
	layerOrder: [constants.settings.BASELAYER]
});