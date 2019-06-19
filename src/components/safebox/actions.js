import { CreateActions } from 'bakadux';

export default CreateActions([
	{
		actionType: 'addImage',
		func: ({actions, stores}, fromUuid, callback=undefined) => {
			let image = stores.general.get('images')[fromUuid];
			let imageUuid = '';

			if (image) {
				imageUuid = image.uuid;
			} else {
				image = stores.general.get('safebox').get(fromUuid);
				imageUuid = image.imageUuid;
			}

			if (image) {
				let settings = {};

				for (const key of stores.settings.getKeys())
					settings[key] = stores.settings.get(key);

				actions.saveImage(fromUuid, {
					uri: image.uri,
					magnification: image.magnification,
					image: image.image,
					output: image.output,
					points: image.points,
					settingUuid: JSON.stringify(settings),
					imageUuid,
					fromUuid,
					name: (' ' + image.name).slice(1),
					settings: JSON.parse(JSON.stringify(settings)),
					workingDir: (' ' + stores.general.get('workingDir')).slice(1)
				}, callback);
			}
		}
	},
	{
		actionType: 'updateImage',
		func: ({actions, stores}, uuid) => {
			let image = stores.general.get('safebox').get(uuid);

			if (image) {
				let settings = {};

				for (const key of stores.settings.getKeys())
					settings[key] = stores.settings.get(key);

				actions.addImage(uuid, newUuid => {
					actions.removeImage(undefined, uuid);
					actions.loadImage(newUuid);
				});
			}
		}
	},
	{
		actionType: 'removeImage',
		func: ({actions, stores}, event, uuid) => {
			if (event)
				event.preventDefault();
			stores.general.get('safebox').delete(uuid);
			actions.deleteImage(uuid);

			if (stores.general.get('selectedUuid') === uuid) {
				stores.general.set('selectedImage', undefined);
				stores.general.set('selectedUuid', undefined);
			} else
				actions.navigateHome();
		}
	},
	{
		actionType: 'restoreImage',
		func: ({actions, stores}, uuid) => {
			const image = stores.general.get('safebox').get(uuid);

			if (image) {
				actions.setSettings(image.settings);
				actions.loadImage(uuid);
			}
		}
	}
]);