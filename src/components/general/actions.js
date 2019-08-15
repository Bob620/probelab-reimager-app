import { CreateActions } from 'bakadux';
import Communications from './communications';
const { ipcRenderer } = window.require('electron');
import IPC from './ipc';
import GenerateUuid from './generateuuid.js';
import constants from '../../../constants';

import settingStore from '../settings/store.js';

const comms = new Communications(new IPC(ipcRenderer));

const autoPixelSizeConstant = localStorage.getItem('autoPixelSizeConstant') === 'true';
const pixelSizeConstant = localStorage.getItem('pixelSizeConstant');

settingStore.data.set('autoPixelSizeConstant', autoPixelSizeConstant);
settingStore.data.set('pixelSizeConstant', pixelSizeConstant);
settingStore.data.commitChanges();

//const notif = new Notification('Reimager Update Available', {
//	body: 'A new version of Probelab ReImager has been released'
//});

//notif.onclick = () => {
//
//};

comms.on('updateDirectory', ({images}) => {
	actions.updateDirImages(images, true);
});

comms.on('notification', notification => {
	actions.addNotification(notification);
});

comms.on('navigate', ({page}) => {
	switch(page) {
		default:
		case 'home':
			actions.navigateHome();
			break;
		case 'settings':
			actions.navigateSettings();
			break;
		case 'about':
			actions.navigateAbout();
			break;
	}
});

comms.on('exportUpdate', ({type, total, exported}) => {
	switch(type) {
		default:
		case 'store':
			actions.updateStoreExport({exported, total, done: exported === total});
			break;
		case 'all':
			actions.updateAllExport({exported, total, done: exported === total});
			break;
	}
});

const actions = CreateActions([
	{
		actionType: 'addNotification',
		func: ({stores}, data) => {
			const notifs = stores.general.get('notifications');
			notifs.unshift(data);
			stores.general.set('notifications', notifs);
		}
	},
	{
		actionType: 'updateStoreExport',
		func: ({stores}, data) => {
			stores.general.set('storeExport', data);
		}
	},
	{
		actionType: 'updateAllExport',
		func: ({stores}, data) => {
			stores.general.set('allExport', data);
		}
	},
	{
		actionType: 'saveImage',
		func: ({stores}, uuid, data, callback=undefined) => {
			if (uuid)
				comms.send('saveImage', {
					uuid
				}).then(([{uuid: newUuid}]) => {
					data.uuid = newUuid;
					stores.general.get('safebox').set(newUuid, data);
					actions.navigateHome();

					if (typeof callback === 'function')
						callback(newUuid);
				});
		}
	},
	{
		actionType: 'deleteImage',
		func: ({stores}, uuid) => {
			if (uuid)
				comms.send('removeImage', {
					uuid
				});
		}
	},
	{
		actionType: 'navigateSettings',
		func: ({stores}) => {
			stores.general.set('page', 'settings');
		}
	},
	{
		actionType: 'navigateAbout',
		func: ({stores}) => {
			stores.general.set('page', 'about');
		}
	},
	{
		actionType: 'navigateHome',
		func: ({stores}) => {
			stores.general.set('page', 'landing');
		}
	},
	{
		actionType: 'setWorkingDirectory',
		func: ({stores}, event) => {
			const generalStore = stores.general;
			let dir;

			if (typeof event === 'string')
				dir = event;
			else if (event.target.files[0])
				dir = event.target.files[0].path;

			if (dir) {
				generalStore.set('selectedUuid', undefined);
				generalStore.set('workingDir', dir);
				generalStore.set('loadingDir', true);

				comms.send('processDirectory', { dir }).then(([{thermos}]) => {
					generalStore.set('loadingDir', false);
					actions.updateDirImages(thermos);

					const selectedUuid = generalStore.get('selectedUuid');
					if (selectedUuid)
						actions.selectImage(selectedUuid);
				}).catch(err => {
					console.log(err);
					generalStore.set('loadingDir', false);
				});
			}
		}
	},
	{
		actionType: 'updateDirImages',
		func: ({stores}, thermos, update=false) => {
			stores.general.set('images', thermos.reduce((thermos, thermo) => {
				thermo.points = Object.values(thermo.points).reduce((points, point) => {
					const uuid = GenerateUuid.v4();
					point.uuid = uuid;
					points.set(uuid, point);
					return points;
				}, new Map());

				thermo.baseLayer = thermo.layers[constants.settings.BASELAYER];
				thermo.baseLayer.name = thermo.baseLayer.element;
				thermo.layers = Object.values(thermo.layers).reduce((layers, layer) => {
					layer.uuid = GenerateUuid.v4();
					layer.name = layer.element;
					layers.set(layer.element, layer);
					return layers;
				}, new Map());

				thermos.set(thermo.uuid, thermo);
				return thermos;
			}, update ? stores.general.get('images') : new Map()));
		}
	},
	{
		actionType: 'selectImage',
		func: ({stores}, uuid) => {
			const generalStore = stores.general;
			const settingStore = stores.settings;

			let image = generalStore.get('images').get(uuid);
			image = image ? image : generalStore.get('safebox').get(uuid);

			if (image) {
				//settingStore.set('activePoints', settingStore.get('activePoints').filter(name => image.points[name] !== undefined));
				generalStore.set('selectedUuid', uuid);
				generalStore.set('selectedImage', undefined);

				settingStore.set('layers', sortLayers(Array.from(image.layers.values()), settingStore.get('layerOrder')));

				if (settingStore.get('selectAllPoints'))
					settingStore.set('activePoints', Array.from(image.points.keys()));

				if (image.points.size === 0)
					generalStore.set('optionsList', constants.optionsLists.LAYERS);
				else
					generalStore.set('optionsList', constants.optionsLists.POINTS);
			}
		}
	},
	{
		actionType: 'loadImage',
		func: ({stores}, uuid=false, activeOverride=false, shift=false, ctrl=false) => {
			const settingStore = stores.settings;
			const generalStore = stores.general;
			const images = generalStore.get('images');
			let selectedUuids = generalStore.get('selectedUuids');
			let overwrite = false;

			if (ctrl) {
				const selectedUuid = generalStore.get('selectedUuid');
				if (images.has(selectedUuid)) {
					if (images.has(uuid))
						if (selectedUuids.has(uuid))
							selectedUuids.delete(uuid);
						else
							selectedUuids.add(uuid);
					generalStore.set('selectedUuids', selectedUuids);
					return;
				}
			}

			if (shift) {
				const selectedUuid = generalStore.get('selectedUuid');
				if (images.has(selectedUuid)) {
					if (images.has(uuid)) {
						const imageKeys = Array.from((images.values())).sort((one, two) => one.name < two.name ? -1 : 1).map(image => image.uuid);
						const selectedIndex = imageKeys.indexOf(selectedUuid);
						const newIndex = imageKeys.indexOf(uuid);

						if (selectedIndex > newIndex)
							selectedUuids = new Set(Array.from(images.keys()).filter(imageUuid => imageKeys.indexOf(imageUuid) >= newIndex && imageKeys.indexOf(imageUuid) <= selectedIndex));
						else
							selectedUuids = new Set(Array.from(images.keys()).filter(imageUuid => imageKeys.indexOf(imageUuid) <= newIndex && imageKeys.indexOf(imageUuid) >= selectedIndex));
					}

					generalStore.set('selectedUuids', selectedUuids);
					return;
				}
			}

			generalStore.set('selectedUuids', new Set());

			if (!uuid)
				uuid = generalStore.get('selectedUuid');
			else if (!activeOverride)
				overwrite = true;

			let image = images.get(uuid);
			image = image ? image : generalStore.get('safebox').get(uuid);

			if (image) {
				actions.selectImage(uuid, shift);

				let data = {
					uuid,
					imageUuid: image.imageUuid,
					settings: {}
				};

				for (const key of settingStore.getKeys())
					data.settings[key] = JSON.parse(JSON.stringify(settingStore.get(key)));

				if (overwrite) {
					data.settings.activePoints = [];

					if (settingStore.get('selectAllPoints'))
						settingStore.set('activePoints', Array.from(image.points.keys()));
					else
						settingStore.set('activePoints', []);
				}

				data.settings.activePoints = (data.settings.selectAllPoints ? Array.from(image.points.keys()) : data.settings.activePoints).reduce((points, uuid) => {
					points.push(image.points.get(uuid));
					return points;
				}, []);

				const layerColors = settingStore.get('layerColors');
				data.settings.activeLayers = sortLayers(data.settings.activeLayers.reduce((layers, element) => {
					if (element && image.layers.has(element)) {
						let layer = JSON.parse(JSON.stringify(image.layers.get(element)));
						layer.opacity = data.settings.layerOpacity === '' ? 100 : data.settings.layerOpacity;
						if (layerColors[element])
							layer.color = layerColors[element];
						layers.push(layer);
					}
					return layers;
				}, []), data.settings.layerOrder).reverse();

				generalStore.set('selectedUuids', new Set([uuid]));

				comms.send('loadImage', data).then(([{uuid, image, data}]) => {
					if (generalStore.get('selectedUuid') === uuid)
						generalStore.set('selectedImage', image);
					if (images.has(uuid))
						images.get(uuid).output = data.output;
					actions.navigateHome();
				}).catch(() => {
				});
			}
		}
	},
	{
		actionType: 'writeSelectedImage',
		func: ({stores}, override=undefined, callback=() => {}) => {
			const generalStore = stores.general;

			const selectedUuid = override ? override : generalStore.get('selectedUuid');

			if (selectedUuid) {
				const settingStore = stores.settings;

				let image = generalStore.get('images').get(selectedUuid);
				image = image ? image : generalStore.get('safebox').get(selectedUuid);

				let data = {
					uuid: selectedUuid,
					imageUuid: image.imageUuid,
					settings: {}
				};

				for (const key of settingStore.getKeys())
					data.settings[key] = JSON.parse(JSON.stringify(settingStore.get(key)));

				data.settings.activePoints = (data.settings.selectAllPoints ? Array.from(image.points.keys()) : data.settings.activePoints).reduce((points, uuid) => {
					points.push(image.points.get(uuid));
					return points;
				}, []);

				const layerColors = settingStore.get('layerColors');
				data.settings.activeLayers = sortLayers(data.settings.activeLayers.reduce((layers, element) => {
					if (element && image.layers.has(element)) {
						let layer = JSON.parse(JSON.stringify(image.layers.get(element)));
						if (layerColors[element])
							layer.color = layerColors[element];
						layers.push(layer);
					}
					return layers;
				}, []), data.settings.layerOrder).reverse();

				comms.send('writeImage', data).then(() => {
					if (typeof callback === 'function')
						callback();
				}).catch(() => {});
			}
		}
	},
	{
		actionType: 'toggleEasyExport',
		func: ({stores}) => {
			stores.general.set('easyExport', !stores.general.get('easyExport'))
		}
	},
	{
		actionType: 'writeSelectedImages',
		func: ({actions, stores}, uuidList=undefined, easy=stores.general.get('easyExport')) => {
			let uuids = uuidList !== undefined ? uuidList : Array.from(stores.general.get('selectedUuids').keys());

			if (easy)
				actions.writeAllImages(uuids);
			else
				if (uuids.length > 0)
					actions.writeSelectedImage(uuids.pop(), actions.writeSelectedImages.bind(undefined, uuids, easy));
		}
	},
	{
		actionType: 'writeSavedImages',
		func: ({actions, stores}, uuidList=undefined) => {
			let uuids = uuidList !== undefined ? uuidList : Array.from(stores.general.get('safebox').keys());

			if (uuids.length > 0) {
				const uuid = uuids.pop();

				actions.restoreImage(uuid);
				actions.writeSelectedImage(undefined, actions.writeSavedImages.bind(undefined, uuids));
			}
		}
	},
	{
		actionType: 'writeAllImages',
		func: ({actions, stores}, uuidList=undefined) => {
			const generalStore = stores.general;
			const settingStore = stores.settings;

			const allImages = generalStore.get('images');
			const allImageArray = Array.from(allImages.values());

			let uuids = uuidList !== undefined ? uuidList : allImageArray.map(image => image.imageUuid);

			if (uuids.length > 0) {
				let settings = {};
				for (const key of settingStore.getKeys())
					settings[key] = JSON.parse(JSON.stringify(settingStore.get(key)));

				const images = uuids.map(uuid => {
					const layerColors = settingStore.get('layerColors');
					let image = allImages.get(uuid);

					return {
						imageUuid: uuid,
						activePoints: (settings.selectAllPoints ? Array.from(image.points.keys()) : settings.activePoints).reduce((points, uuid) => {
							points.push(image.points.get(uuid));
							return points;
						}, []),
						activeLayers: sortLayers(settings.activeLayers.reduce((layers, element) => {
							if (element && image.layers.has(element)) {
								let layer = JSON.parse(JSON.stringify(image.layers.get(element)));
								if (layerColors[element])
									layer.color = layerColors[element];
								layers.push(layer);
							}
							return layers;
						}, []), settings.layerOrder).reverse()
					}
				});

				comms.send('writeImages', {images, settings})
				.then(() => {

				}).catch(() => {

				});
			}
		}
	},
	{
		actionType: 'changeOptionsList',
		func: ({stores}, value) => {
			stores.general.set('optionsList', value);
		}
	},
	{
		actionType: 'timerHandle',
		func: ({stores}) => {
			const generalStore = stores.general;
			const current = generalStore.get('confirmDeleteSaved');

			if (current > -1) {
				generalStore.set('confirmDeleteSaved', current - 1);
				setTimeout(actions.timerHandle, 1000);
			}
		}
	},
	{
		actionType: 'confirmDeleteSaved',
		func: ({stores}) => {
			const generalStore = stores.general;
			generalStore.set('confirmDeleteSaved', 3);

			setTimeout(actions.timerHandle, 1000);
		}
	},
	{
		actionType: 'deleteSaved',
		func: ({stores}) => {
			const generalStore = stores.general;

			generalStore.set('safebox', new Map());
			generalStore.set('confirmDeleteSaved', -1);
		}
	},
	{
		actionType: 'moveSidebar',
		func: ({stores}, event) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
			const xpos = event.screenX;
			const optionsWidth = stores.general.get('optionsWidth');

			if (xpos > 290) // Smaller breaks Export button text
				if (xpos < 500)
					if (xpos + optionsWidth <= window.innerWidth * .8) {
						if (document.styleSheets[0].cssRules[0].selectorText === '.app')
							document.styleSheets[0].deleteRule(0);

						stores.general.set('sidebarWidth', xpos);
						document.styleSheets[0].insertRule(`.app {grid-template-columns: ${xpos}px 1fr ${optionsWidth}px !important }`)
					}
		}
	},
	{
		actionType: 'moveOptions',
		func: ({stores}, event) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
			const xpos = event.screenX - window.innerWidth;
			const sidebarWidth = stores.general.get('sidebarWidth');

			if (xpos < -272) // Smaller wraps button text
				if (xpos > -500)
					if (Math.abs(xpos) + sidebarWidth <= window.innerWidth * .75) {
						if (document.styleSheets[0].cssRules[0].selectorText === '.app')
							document.styleSheets[0].deleteRule(0);

						stores.general.set('optionsWidth', Math.abs(xpos));
						document.styleSheets[0].insertRule(`.app {grid-template-columns: ${sidebarWidth}px 1fr ${Math.abs(xpos)}px !important }`)
					}
		}
	}
]);

function sortLayers(layers, order) {
	let outputLayers = [];
	for (let i = 0; i < order.length; i ++)
		outputLayers.push(undefined);

	let offset = 0;

	return layers.reduce((layers, layer) => {
		const position = order.indexOf(layer.element);
		if (position !== -1)
			layers[position + offset] = layer;
		else {
			layers.splice(0, 0, layer);
			offset++;
		}
		return layers;
	}, outputLayers).filter(i => i);
}

module.exports = actions;