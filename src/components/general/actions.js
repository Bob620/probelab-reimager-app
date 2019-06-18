import { CreateActions } from 'bakadux';
import Communications from './communications';

const comms = new Communications();

comms.onMessage('updateDirectory', ({images}) => {
	actions.updateDirImages(images);
});

const actions = CreateActions([
	{
		actionType: 'saveImage',
		func: ({stores}, uuid, data, callback=undefined) => {
			if (uuid)
				comms.sendMessage('saveImage', {
					uuid
				}).then(({uuid: newUuid}) => {
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
				comms.sendMessage('removeImage', {
					uuid
				}, false);
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
			let dir = event;
			if (typeof event === 'object')
				dir = event.target.files[0].path;
			if (dir) {
				stores.general.set('selectedUuid', undefined);
				stores.general.set('workingDir', dir);

				comms.sendMessage('processDirectory', { dir }).then(({images}) => {
					actions.updateDirImages(images);
					const selectedUuid = stores.general.get('selectedUuid');
					if (selectedUuid)
						actions.selectImage(selectedUuid);
				});
			}
		}
	},
	{
		actionType: 'updateDirImages',
		func: ({stores}, images) => {
			stores.general.set('images', images);
		}
	},
	{
		actionType: 'selectImage',
		func: ({stores}, uuid) => {
			if (Object.keys(stores.general.get('images')).includes(uuid) || Array.from(stores.general.get('safebox').keys()).includes(uuid)) {
				stores.general.set('selectedUuid', uuid);
				stores.general.set('selectedImage', undefined);
			}
		}
	},
	{
		actionType: 'loadImage',
		func: ({stores}, uuid=false) => {
			const oldUuid = stores.general.get('selectedUuid');

			if (uuid)
				actions.selectImage(uuid);

			if (oldUuid || uuid)
				comms.sendMessage('loadImage', {
						oldUuid: (uuid && oldUuid) ? oldUuid : '',
						uuid: uuid ? uuid : oldUuid,
						scaleType: stores.settings.get('scalePosition'),
						scaleColor: stores.settings.get('scaleColor'),
						belowColor: stores.settings.get('belowColor'),
						scaleSize: stores.settings.get('autoScale') ? 0 : (stores.settings.get('scaleSize') === '' ? 0 : stores.settings.get('scaleSize')),
						scaleBarHeight: stores.settings.get('autoHeight') ? 0 : (stores.settings.get('scaleBarHeight') / 100),
						scaleBarTop: stores.settings.get('scaleBarTop'),
						pixelSizeConstant: stores.settings.get('pixelSizeConstant')
				}).then(({uuid, image}) => {
					if (stores.general.get('selectedUuid') === uuid)
						stores.general.set('selectedImage', image);
					actions.navigateHome();
				});
		}
	},
	{
		actionType: 'writeSelectedImage',
		func: ({stores}, override=undefined, callback=() => {}) => {
			const selectedUuid = override ? override : stores.general.get('selectedUuid');
			let image = stores.general.get('images')[selectedUuid];
			image = image !== undefined ? image : stores.general.get('safebox').get(selectedUuid);
			let data = {};

			if (image.name)
				data = {
					name: image.name,
					uuid: selectedUuid,
					scaleType: image.settings.scalePosition,
					scaleColor: image.settings.scaleColor,
					belowColor: image.settings.belowColor,
					scaleSize: image.settings.autoScale ? 0 : (image.settings.scaleSize !== '' ? image.settings.scaleSize : 0),
					scaleBarHeight: image.settings.scaleBarHeight/100,
					scaleBarTop: image.settings.scaleBarTop,
					pixelSizeConstant: image.settings.pixelSizeConstant
				};
			else
				data = {
					name: image.data.name,
					uuid: selectedUuid,
					scaleType: stores.settings.get('scalePosition'),
					scaleColor: stores.settings.get('scaleColor'),
					belowColor: stores.settings.get('belowColor'),
					scaleSize: stores.settings.get('autoScale') ? 0 : (stores.settings.get('scaleSize') !== '' ? stores.settings.get('scaleSize') : 0),
					scaleBarHeight: stores.settings.get('autoHeight') ? 0 : (stores.settings.get('scaleBarHeight') / 100),
					scaleBarTop: stores.settings.get('scaleBarTop'),
					pixelSizeConstant: stores.settings.get('pixelSizeConstant')
				};

			if (selectedUuid)
				comms.sendMessage('writeImage', data).then(({image, uuid}) => {
					actions.navigateHome();
					if (typeof callback === 'function')
						callback();
				});
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
		actionType: 'moveSidebar',
		func: ({stores}, event) => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';
			const xpos = event.screenX;
			const optionsWidth = stores.general.get('optionsWidth');

			if (xpos > 160) // Smaller wraps Export button text
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

			if (xpos < -160) // Smaller wraps Export button text
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