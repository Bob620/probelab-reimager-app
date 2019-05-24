import { CreateActions } from 'bakadux';
import generalStore from './store';

const { ipcRenderer } = window.require('electron');

console.log(ipcRenderer);

ipcRenderer.on('data', (event, {type, data}) => {
	switch(type) {
		case 'updateDirImages':
			actions.updateDirImages(data.images);
			break;
		case 'loadedImage':
			let images = generalStore.get('images');
			let image = images[data.name];
			image.data.image = data.image;
			actions.selectImage(image);
	}
});

ipcRenderer.on('debug', (event, arg) => {
	console.log(arg);
});

const actions = CreateActions([
	{
		actionType: 'setWorkingDirectory',
		func: ({stores}, {target}) => {
			const dir = target.files[0].path;
			stores.general.set('workingDir', dir);

			ipcRenderer.send('data', {
				type: 'processDirectory',
				data: {
					dir
				}
			});
		}
	},
	{
		actionType: 'updateDirImages',
		func: ({stores}, images) => {
			stores.general.set('images', images);
		}
	},
	{
		actionType: 'loadImage',
		func: ({stores}, name, scaleType=undefined) => {
			const oldImage = stores.general.get('selectedImage');

			ipcRenderer.send('data', {
				type: 'loadImage',
				data: {
					oldName: oldImage ? oldImage.data.name : '',
					name,
					scaleType
				}
			});
		}
	},
	{
		actionType: 'selectImage',
		func: ({stores}, image) => {
			console.log('selecting image');
			const oldImage = stores.general.get('selectedImage');

			let images = stores.general.get('images');
			if (oldImage)
				images[oldImage.data.name].data.image = undefined;
			images[image.data.name] = image;
			stores.general.set('images', images);

			stores.general.set('selectedImage', image);
		}
	}
]);

module.exports = actions;