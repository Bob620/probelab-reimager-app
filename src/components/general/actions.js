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
				comms.send('removeImage', {
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
			if (typeof event === 'object' && event.target.files[0])
				dir = event.target.files[0].path;
			if (dir) {
				stores.general.set('selectedUuid', undefined);
				stores.general.set('workingDir', dir);

				comms.send('processDirectory', { dir }).then(([{images}]) => {
					actions.updateDirImages(images);
					const selectedUuid = stores.general.get('selectedUuid');
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
		func: ({stores}, images) => {
			stores.general.set('images', images.reduce((images, image) => {
				images[image.uuid] = image;
				return images;
			}, {}));
		}
	},
	{
		actionType: 'selectImage',
		func: ({stores}, uuid) => {
			if (Object.keys(stores.general.get('images')).includes(uuid) || Array.from(stores.general.get('safebox').keys()).includes(uuid)) {
				let image = stores.general.get('images')[uuid];
				image = image !== undefined ? image : stores.general.get('safebox').get(uuid);

				stores.settings.set('activePoints', stores.settings.get('activePoints').filter(name => image.points[name] !== undefined));
				stores.general.set('selectedUuid', uuid);
				stores.general.set('selectedImage', undefined);
			}
		}
	},
	{
		actionType: 'loadImage',
		func: ({stores}, uuid=false) => {
			const oldUuid = stores.general.get('selectedUuid');
			const selectedUuid = uuid ? uuid : oldUuid;

			let image = stores.general.get('images')[selectedUuid];
			image = image !== undefined ? image : stores.general.get('safebox').get(selectedUuid);

			if (uuid)
				actions.selectImage(uuid);

			if (oldUuid || uuid)
				comms.send('loadImage', {
					oldUuid: (uuid && oldUuid) ? oldUuid : '',
					uuid: uuid ? uuid : oldUuid,
					settings: {
						scaleColor: stores.settings.get('scaleColor'),
						belowColor: stores.settings.get('belowColor'),
						scaleSize: stores.settings.get('autoScale') ? 0 : (stores.settings.get('scaleSize') === '' ? 0 : stores.settings.get('scaleSize')),
						scaleBarHeight: stores.settings.get('autoHeight') ? 0 : (stores.settings.get('scaleBarHeight') / 100),
						scaleBarTop: stores.settings.get('scaleBarTop'),
						pixelSizeConstant: stores.settings.get('pixelSizeConstant'),
						backgroundOpacity: stores.settings.get('autoBackgroundOpacity') ? 0 : stores.settings.get('backgroundOpacity'),
						pointType: stores.settings.get('pointType'),
						textColor: stores.settings.get('pointColor'),
						pointSize: stores.settings.get('autoPointFontSize') ? 0 : (stores.settings.get('pointFontSize') / 2),
						pointFontSize: stores.settings.get('autoPointFontSize') ? 0 : stores.settings.get('pointFontSize'),
					},
					scaleType: stores.settings.get('scalePosition'),
					points: stores.settings.get('activePoints').filter(name => image.points[name] !== undefined).map(name => image.points[name]),
					layers: stores.settings.get('activeLayers').filter(name => image.layers[name] !== undefined).map(name => image.layers[name])
				}).then(([{uuid, image, data}]) => {
					if (stores.general.get('selectedUuid') === uuid)
						stores.general.set('selectedImage', image);
					//stores.general.get('images')[uuid] = data;
					actions.navigateHome();
				}).catch(() => {});
		}
	},
	{
		actionType: 'writeSelectedImage',
		func: ({stores}, override=undefined, callback=() => {}) => {
			const selectedUuid = override ? override : stores.general.get('selectedUuid');
			let image = stores.general.get('images')[selectedUuid];
			image = image !== undefined ? image : stores.general.get('safebox').get(selectedUuid);
			let data = {};

			if (image.fromUuid)
				data = {
					name: image.name,
					uuid: selectedUuid,
					scaleType: image.settings.scalePosition,
					scaleColor: image.settings.scaleColor,
					belowColor: image.settings.belowColor,
					scaleSize: image.settings.autoScale ? 0 : (image.settings.scaleSize !== '' ? image.settings.scaleSize : 0),
					scaleBarHeight: image.settings.scaleBarHeight/100,
					scaleBarTop: image.settings.scaleBarTop,
					pixelSizeConstant: image.settings.pixelSizeConstant,
					backgroundOpacity: image.settings.autoBackgroundOpacity ? 0 : image.settings.backgroundOpacity,
					pointType: image.settings.pointType,
					textColor: image.settings.pointColor,
					pointSize: image.settings.autoPointFontSize ? 0 : (image.settings.pointFontSize / 2),
					pointFontSize: image.settings.autoPointFontSize ? 0 : image.settings.pointFontSize,
					points: image.settings.activePoints.filter(name => image.points[name] !== undefined).map(name => image.points[name])
				};
			else
				data = {
					name: image.name,
					uuid: selectedUuid,
					scaleType: stores.settings.get('scalePosition'),
					scaleColor: stores.settings.get('scaleColor'),
					belowColor: stores.settings.get('belowColor'),
					scaleSize: stores.settings.get('autoScale') ? 0 : (stores.settings.get('scaleSize') !== '' ? stores.settings.get('scaleSize') : 0),
					scaleBarHeight: stores.settings.get('autoHeight') ? 0 : (stores.settings.get('scaleBarHeight') / 100),
					scaleBarTop: stores.settings.get('scaleBarTop'),
					pixelSizeConstant: stores.settings.get('pixelSizeConstant'),
					backgroundOpacity: stores.settings.get('autoBackgroundOpacity') ? 0 : stores.settings.get('backgroundOpacity'),
					pointType: stores.settings.get('pointType'),
					textColor: stores.settings.get('pointColor'),
					pointSize: stores.settings.get('autoPointFontSize') ? 0 : (stores.settings.get('pointFontSize') / 2),
					pointFontSize: stores.settings.get('autoPointFontSize') ? 0 : stores.settings.get('pointFontSize'),
					points: stores.settings.get('activePoints').filter(name => image.points[name] !== undefined).map(name => image.points[name])
				};

			if (selectedUuid)
				comms.send('writeImage', data).then(({uuid, thermo}) => {
					//stores.general.get('images')[uuid] = thermo;
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