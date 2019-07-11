import { CreateActions } from 'bakadux';
import GenerateUuid from '../general/generateuuid';

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

				const activePoints = settingStore.get('activePoints').map(point => point.uuid);
				const activeLayers = settingStore.get('activeLayers').map(layer => layer.uuid);

				for (const key of settingStore.getKeys())
					data.settings[key] = JSON.parse(JSON.stringify(settingStore.get(key)));

				data.settings.activePoints = [];
				data.settings.activeLayers = [];

				data.points = Array.from(image.points.values()).reduce((points, point) => {
					const uuid = GenerateUuid.v4();
					const oldUuid = point.uuid;

					point.uuid = uuid;
					points.set(uuid, point);

					if (activePoints.includes(oldUuid))
						data.settings.activePoints.push(point);

					return points;
				}, new Map());

				data.layers = Array.from(image.layers.values()).reduce((layers, layer) => {
					const uuid = GenerateUuid.v4();
					const oldUuid = layer.uuid;

					layer.uuid = uuid;
					layers.set(uuid, layer);

					if (activeLayers.includes(oldUuid))
						data.settings.activeLayers.push(layer);

					return layers;
				}, new Map());

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
				actions.loadImage(uuid, true);
			}
		}
	}
]);