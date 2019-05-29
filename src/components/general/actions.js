import { CreateActions } from 'bakadux';
import generalStore from './store';

const { ipcRenderer } = window.require('electron');

ipcRenderer.on('data', (event, {type, data}) => {
	switch(type) {
		case 'updateDirImages':
			actions.updateDirImages(data.images);
			break;
		case 'loadedImage':
			const oldImage = generalStore.get('selectedImage');
			let images = generalStore.get('images');

			if (oldImage && images[oldImage.data.name])
				images[oldImage.data.name].data.image = undefined;

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
			if (dir) {
				stores.general.set('workingDir', dir);

				ipcRenderer.send('data', {
					type: 'processDirectory',
					data: {
						dir
					}
				});
			}
		}
	},
	{
		actionType: 'updateDirImages',
		func: ({stores}, images) => {
			stores.general.set('images', images);
			console.log(images);
		}
	},
	{
		actionType: 'setScalePosition',
		func: ({stores}, pos=0) => {
			const oldPos = stores.general.get('scalePosition');
			if (oldPos !== pos)
				stores.general.set('scalePosition', pos);
		}
	},
	{
		actionType: 'loadImage',
		func: ({stores}, name=false) => {
			const oldImage = stores.general.get('selectedImage');

			if (oldImage || name)
				ipcRenderer.send('data', {
					type: 'loadImage',
					data: {
						oldName: (name && oldImage) ? oldImage.data.name : '',
						name: name ? name : oldImage.data.name,
						scaleType: stores.general.get('scalePosition'),
						scaleColor: stores.general.get('scaleColor'),
						belowColor: stores.general.get('belowColor'),
						scaleSize: (stores.general.get('autoScale') || stores.general.get('scaleSize') === '') ? 0 : stores.general.get('scaleSize')
					}
				});
		}
	},
	{
		actionType: 'selectImage',
		func: ({stores}, image) => {
			let images = stores.general.get('images');
			images[image.data.name] = image;
			stores.general.set('images', images);

			stores.general.set('selectedImage', image);
		}
	},
	{
		actionType: 'writeSelectedImage',
		func: ({stores}) => {
			if (stores.general.get('selectedImage'))
				ipcRenderer.send('data', {
					type: 'writeImage',
					data: {
						name: stores.general.get('selectedImage').data.name,
						scaleType: stores.general.get('scalePosition'),
						scaleColor: stores.general.get('scaleColor'),
						belowColor: stores.general.get('belowColor'),
						scaleSize: (stores.general.get('autoScale') || stores.general.get('scaleSize') === '') ? 0 : stores.general.get('scaleSize')
					}
				});
		}
	},
	{
		actionType: 'changeBelowColor',
		func: ({stores}, {target}) => {
			stores.general.set('belowColor', target.value);
		}
	},
	{
		actionType: 'changeScaleColor',
		func: ({stores}, {target}) => {
			stores.general.set('scaleColor', target.value);
		}
	},
	{
		actionType: 'changeScaleSize',
		func: ({stores}, {target}) => {
			const num = parseInt(target.value);
			if (!isNaN(num) && 0 <= num <= 100000)
				stores.general.set('scaleSize', num);

			if (target.value === '')
				stores.general.set('scaleSize', num);
		}
	},
	{
		actionType: 'toggleAutoScale',
		func: ({stores}) => {
			stores.general.set('autoScale', !stores.general.get('autoScale'));
		}
	},
	{
		actionType: 'changeFromAuto',
		func: ({stores}) => {
			stores.general.set('autoScale', !stores.general.get('autoScale'));
		}
	}
]);

module.exports = actions;