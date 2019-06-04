import { CreateActions } from 'bakadux';

export default CreateActions([
	{
		actionType: 'addImage',
		func: ({actions, stores}, uuid) => {
			let image = stores.general.get('images')[uuid];
			image = image ? image : stores.general.get('safebox').get(uuid);

			if (image) {
				let settings = {};

				for (const key of stores.settings.getKeys())
					settings[key] = stores.settings.get(key);

				actions.saveImage(uuid, {
					settingUuid: JSON.stringify(settings),
					imageUuid: uuid,
					name: (' ' + ((image.data && image.data.name) ? image.data.name : image.name)).slice(1),
					settings: JSON.parse(JSON.stringify(settings)),
					workingDir: (' ' + stores.general.get('workingDir')).slice(1)
				});
			}
		}
	},
	{
		actionType: 'removeImage',
		func: ({actions, stores}, event, uuid) => {
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