import { Store } from 'bakadux';

import constants from '../../../constants.json';

module.exports = new Store('general', {
	page: 'landing',
	workingDir: '',
	easyExport: true,
	notifications: [],
	images: new Map(),
	safebox: new Map(),
	selectedUuids: new Set(),
	selectedUuid: undefined,
	selectedImage: undefined,
	sidebarWidth: 300,
	optionsWidth: 300,
	interactable: true,
	optionsList: constants.optionsLists.POINTS,
	confirmDeleteSaved: -1,
	storeExport: {exported: 0, total: 0, done: true},
	allExport: {exported: 0, total: 0, done: true},
	dirLoading: false,
	colors: [
		{
			name: 'red',
			RGBA: 'rgba(255, 0, 0, 1)',
			R: 255,
			G: 0,
			B: 0,
			opacity: 1
		},
		{
			name: 'teal',
			RGBA: 'rgba(0, 255, 255, 1)',
			R: 0,
			G: 255,
			B: 255,
			opacity: 1
		},
		{
			name: 'yellow',
			RGBA: 'rgba(255, 255, 0, 1)',
			R: 255,
			G: 255,
			B: 0,
			opacity: 1
		},
		{
			name: 'purple',
			RGBA: 'rgba(255, 0, 255, 1)',
			R: 255,
			G: 0,
			B: 255,
			opacity: 1
		},
		{
			name: 'green',
			RGBA: 'rgba(0, 255, 0, 1)',
			R: 0,
			G: 255,
			B: 0,
			opacity: 1
		},
		{
			name: 'blue',
			RGBA: 'rgba(0, 0, 255, 1)',
			R: 0,
			G: 0,
			B: 255,
			opacity: 1
		},
		{
			name: 'white',
			RGBA: 'rgba(255, 255, 255, 1)',
			R: 255,
			G: 255,
			B: 255,
			opacity: 1
		},
		{
			name: 'black',
			RGBA: 'rgba(0, 0, 0, 1)',
			R: 0,
			G: 0,
			B: 0,
			opacity: 1
		},
	]
});