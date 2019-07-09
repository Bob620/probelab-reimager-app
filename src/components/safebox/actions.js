import { CreateActions } from 'bakadux';

export default CreateActions([
	{
		actionType: 'addImage',
		func: ({actions, stores}, fromUuid, callback=undefined) => {
			const settingStore = stores.settings;
			const generalStore = stores.general;

			let image = generalStore.get('images').get(fromUuid);
			image = image ? image : generalStore.get('safebox').get(fromUuid);

			if (image) {
				let data = JSON.parse(JSON.stringify(image));
				data.settings = {};

				for (const key of settingStore.getKeys())
					data.settings[key] = JSON.parse(JSON.stringify(settingStore.get(key)));

				actions.saveImage(fromUuid, data, callback);
			}
		}
	},
	{
		actionType: 'updateImage',
		func: ({actions, stores}, uuid) => {
			let image = stores.general.get('safebox').get(uuid);

			if (image)
				actions.addImage(uuid, newUuid => {
					actions.removeImage(undefined, uuid);
					actions.loadImage(newUuid);
				});
		}
	},
	{
		actionType: 'removeImage',
		func: ({actions, stores}, event, uuid) => {
			const generalStore = stores.general;

			if (event)
				event.preventDefault();

			generalStore.get('safebox').delete(uuid);
			actions.deleteImage(uuid);

			if (generalStore.get('selectedUuid') === uuid) {
				generalStore.set('selectedImage', undefined);
				generalStore.set('selectedUuid', undefined);
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