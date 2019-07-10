import { CreateActions } from 'bakadux';
import Communications from './communications';
const { ipcRenderer } = window.require('electron');
import IPC from './ipc';

const comms = new Communications(new IPC(ipcRenderer));

comms.on('updateDirectory', ({images}) => {
	actions.updateDirImages(images);
});

const actions = CreateActions([
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
		actionType: 'navigateHome',
		func: ({stores}) => {
			stores.general.set('page', 'landing');
		}
	},
	{
		actionType: 'setWorkingDirectory',
		func: ({stores}, event) => {
			const generalStore = stores.general;

			let dir = event;
			if (typeof event === 'object' && event.target.files[0])
				dir = event.target.files[0].path;
			if (dir) {
				generalStore.set('selectedUuid', undefined);
				generalStore.set('workingDir', dir);

				comms.send('processDirectory', { dir }).then(([{thermos}]) => {
					actions.updateDirImages(thermos);

					const selectedUuid = generalStore.get('selectedUuid');
					if (selectedUuid)
						actions.selectImage(selectedUuid);
				}).catch(err => {
					console.log(err);
				});
			}
		}
	},
	{
		actionType: 'updateDirImages',
		func: ({stores}, thermos) => {
			stores.general.set('images', thermos.reduce((thermos, thermo) => {
				thermos.set(thermo.uuid, thermo);
				return thermos;
			}, new Map()));
		}
	},
	{
		actionType: 'selectImage',
		func: ({stores}, uuid) => {
			//const settingStore = stores.settings;
			const generalStore = stores.general;

			let image = generalStore.get('images').get(uuid);
			image = image ? image : generalStore.get('safebox').get(uuid);

			if (image) {
				//settingStore.set('activePoints', settingStore.get('activePoints').filter(name => image.points[name] !== undefined));
				generalStore.set('selectedUuid', uuid);
				generalStore.set('selectedImage', undefined);
			}
		}
	},
	{
		actionType: 'loadImage',
		func: ({stores}, uuid=false) => {
			const settingStore = stores.settings;
			const generalStore = stores.general;

			if (!uuid)
				uuid = generalStore.get('selectedUuid');

			let image = generalStore.get('images').get(uuid);
			image = image ? image : generalStore.get('safebox').get(uuid);

			actions.selectImage(uuid);

			let data = {
				uuid,
				imageUuid: image.imageUuid,
				settings: {}
			};

			for (const key of settingStore.getKeys())
				data.settings[key] = settingStore.get(key);

			comms.send('loadImage', data).then(([{uuid, image, data}]) => {
				if (generalStore.get('selectedUuid') === uuid)
					generalStore.set('selectedImage', image);
				//stores.general.get('images')[uuid] = data;
				actions.navigateHome();
			}).catch(() => {});
		}

	},
	{
		actionType: 'writeSelectedImage',
		func: ({stores}, override=undefined, callback=() => {}) => {
			const generalStore = stores.general;

			const selectedUuid = override ? override.uuid : generalStore.get('selectedUuid');

			if (selectedUuid) {
				const settingStore = override ? override : stores.settings;

				let image = generalStore.get('images').get(selectedUuid);
				image = image ? image : generalStore.get('safebox').get(selectedUuid);

				let data = {
					uuid: selectedUuid,
					imageUuid: image.imageUuid,
					settings: {}
				};

				for (const key of settingStore.getKeys())
					data.settings[key] = settingStore.get(key);

				comms.send('writeImage', data).then(() => {
					if (typeof callback === 'function')
						callback();
				}).catch(() => {});
			}
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
		actionType: 'changeOptionsList',
		func: ({stores}, value) => {
			stores.general.set('optionsList', value);
		}
	},
	{
		actionType: 'moveSidebar',
		func: ({stores}, event) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
			const xpos = event.screenX;
			const optionsWidth = stores.general.get('optionsWidth');

			if (xpos > 205) // Smaller wraps Export button text
				if (xpos < 500) {
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
				if (xpos > -500) {
					if (document.styleSheets[0].cssRules[0].selectorText === '.app')
						document.styleSheets[0].deleteRule(0);

					stores.general.set('optionsWidth', Math.abs(xpos));
					document.styleSheets[0].insertRule(`.app {grid-template-columns: ${sidebarWidth}px 1fr ${Math.abs(xpos)}px !important }`)
				}
		}
	}
]);

module.exports = actions;