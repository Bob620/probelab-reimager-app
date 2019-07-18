import { CreateActions } from 'bakadux';

export default CreateActions([
	{
		actionType: 'setSettings',
		func: ({stores}, newSettings) => {
			newSettings = JSON.parse(JSON.stringify(newSettings));

			for (const key of Object.keys(newSettings))
				stores.settings.set(key, newSettings[key]);
		}
	},
	{
		actionType: 'toggleAutoScale',
		func: ({stores}, force=undefined) => {
			stores.settings.set('autoScale', force !== undefined ? force : !stores.settings.get('autoScale'));
		}
	},
	{
		actionType: 'toggleAutoScaleHeight',
		func: ({stores}, force=undefined) => {
			stores.settings.set('autoHeight', force !== undefined ? force : !stores.settings.get('autoHeight'));
		}
	},
	{
		actionType: 'changeBarPosition',
		func: ({stores}, force=undefined, {target}) => {
			stores.settings.set('scaleBarPosition', force !== undefined ? force : target.value);
		}
	},
	{
		actionType: 'toggleAutoPixelSizeConstant',
		func: ({stores}, force=undefined) => {
			stores.settings.set('autoPixelSizeConstant', force !== undefined ? force : !stores.settings.get('autoPixelSizeConstant'));
		}
	},
	{
		actionType: 'toggleAutoPointFontSize',
		func: ({stores}, force=undefined) => {
			stores.settings.set('autoPointFontSize', force !== undefined ? force : !stores.settings.get('autoPointFontSize'));
		}
	},
	{
		actionType: 'toggleAutoBackgroundOpacity',
		func: ({stores}, force=undefined) => {
			stores.settings.set('autoBackgroundOpacity', force !== undefined ? force : !stores.settings.get('autoBackgroundOpacity'));
		}
	},
	{
		actionType: 'setScalePosition',
		func: ({stores}, pos=0) => {
			const oldPos = stores.settings.get('scalePosition');
			if (oldPos !== pos)
				stores.settings.set('scalePosition', pos);
		}
	},
	{
		actionType: 'changeBelowColor',
		func: ({stores}, {target}) => {
			stores.settings.set('belowColor', target.value);
		}
	},
	{
		actionType: 'changeScaleColor',
		func: ({stores}, {target}) => {
			stores.settings.set('scaleColor', target.value);
		}
	},
	{
		actionType: 'changePointColor',
		func: ({stores}, {target}) => {
			stores.settings.set('pointColor', target.value);
		}
	},
	{
		actionType: 'changePointType',
		func: ({stores}, {target}) => {
			stores.settings.set('pointType', target.value);
		}
	},
	{
		actionType: 'changeScaleSize',
		func: ({stores}, {target}) => {
			const num = parseInt(target.value);
			if (!isNaN(num))
				if (0 <= num)
					if (num <= 10000000)
						stores.settings.set('scaleSize', num);
					else
						stores.settings.set('scaleSize', 10000000);
				else
					stores.settings.set('scaleSize', 0);

			if (target.value === '')
				stores.settings.set('scaleSize', '');
		}
	},
	{
		actionType: 'changePixelSizeConstant',
		func: ({stores}, {target}) => {
			const num = parseFloat(target.value);
			if (!isNaN(num))
				if (0 < num)
					if (num <= 500)
						stores.settings.set('pixelSizeConstant', num);
					else
						stores.settings.set('pixelSizeConstant', 500);
				else
					stores.settings.set('pixelSizeConstant', 0);

			if (target.value === '')
				stores.settings.set('pixelSizeConstant', '');
		}
	},
	{
		actionType: 'changeScaleBarHeight',
		func: ({stores}, {target}) => {
			const num = parseInt(target.value === '0' ? '0' : target.value.replace(/^0+/g, ''));
			if (!isNaN(num))
				if (0 <= num)
					if (num <= 100)
						stores.settings.set('scaleBarHeight', num);
					else
						stores.settings.set('scaleBarHeight', 100);
				else
					stores.settings.set('scaleBarHeight', 0);

			if (target.value === '')
				stores.settings.set('scaleBarHeight', '');
		}
	},
	{
		actionType: 'changePointFontSize',
		func: ({stores}, {target}) => {
			const num = parseInt(target.value === '0' ? '0' : target.value.replace(/^0+/g, ''));
			if (!isNaN(num))
				if (0 <= num)
					if (num <= 100)
						stores.settings.set('pointFontSize', num);
					else
						stores.settings.set('pointFontSize', 100);
				else
					stores.settings.set('pointFontSize', 0);

			if (target.value === '')
				stores.settings.set('pointFontSize', '');
		}
	},
	{
		actionType: 'changeBackgroundOpacity',
		func: ({stores}, {target}) => {
			const num = parseInt(target.value === '0' ? '0' : target.value.replace(/^0+/g, ''));
			if (!isNaN(num))
				if (0 <= num)
					if (num <= 100)
						stores.settings.set('backgroundOpacity', num);
					else
						stores.settings.set('backgroundOpacity', 100);
				else
					stores.settings.set('backgroundOpacity', 0);

			if (target.value === '')
				stores.settings.set('backgroundOpacity', '');
		}
	},
	{
		actionType: 'changeLayerOpacity',
		func: ({stores}, {target}) => {
			const num = parseInt(target.value === '0' ? '0' : target.value.replace(/^0+/g, ''));
			if (!isNaN(num))
				if (0 <= num)
					if (num <= 100)
						stores.settings.set('layerOpacity', num/100);
					else
						stores.settings.set('layerOpacity', 1);
				else
					stores.settings.set('layerOpacity', 0);

			if (target.value === '')
				stores.settings.set('layerOpacity', '');
		}
	},
	{
		actionType: 'changeFromAutoScale',
		func: ({actions, stores}, event) => {
			actions.changeScaleSize(event);
			stores.settings.set('autoScale', false);
		}
	},
	{
		actionType: 'changeFromAutoHeight',
		func: ({actions, stores}, event) => {
			actions.changeScaleBarHeight(event);
			stores.settings.set('autoHeight', false);
		}
	},
	{
		actionType: 'changeFromAutoPixelSizeConstant',
		func: ({actions, stores}, event) => {
			actions.changeScaleBarHeight(event);
			stores.settings.set('autoPixelSizeConstant', false);
		}
	},
	{
		actionType: 'changeFromAutoPointFontSize',
		func: ({actions, stores}, event) => {
			actions.changePointFontSize(event);
			stores.settings.set('autoPointFontSize', false);
		}
	},
	{
		actionType: 'changeFromAutoBackgroundOpacity',
		func: ({actions, stores}, event) => {
			actions.changeBackgroundOpacity(event);
			stores.settings.set('autoBackgroundOpacity', false);
		}
	},
	{
		actionType: 'addPoint',
		func: ({stores, actions}, uuid) => {
			let points = stores.settings.get('activePoints');

			if (!points.includes(uuid))
				points.push(uuid);
			actions.navigateHome();
		}
	},
	{
		actionType: 'removePoint',
		func: ({stores, actions}, uuid) => {
			const settingStore = stores.settings;
			let points = settingStore.get('activePoints');
			const pointPos = points.indexOf(uuid);

			if (pointPos !== -1) {
				points.splice(pointPos, 1);
				settingStore.set('selectAllPoints', false);
			}
			actions.navigateHome();
		}
	},
	{
		actionType: 'addLayer',
		func: ({stores, actions}, element) => {
			let layers = stores.settings.get('activeLayers');

			if (!layers.includes(element))
				layers.push(element);
			actions.navigateHome();
		}
	},
	{
		actionType: 'removeLayer',
		func: ({stores, actions}, element) => {
			let layers = stores.settings.get('activeLayers');
			const layerPos = layers.indexOf(element);

			if (layerPos !== -1)
				layers.splice(layerPos, 1);
			actions.navigateHome();
		}
	},
	{
		actionType: 'colorLayer',
		func: ({stores, actions}, element, color) => {
			let layers = stores.settings.get('layerColors');
			layers[element] = color;

			actions.navigateHome();
		}
	},
	{
		actionType: 'selectAllPoints',
		func: ({stores, actions}, imageUuid) => {
			const generalStore = stores.general;
			const settingStore = stores.settings;

			let image = generalStore.get('images').get(imageUuid);
			image = image ? image : generalStore.get('safebox').get(imageUuid);

			settingStore.set('selectAllPoints', true);
			settingStore.set('activePoints', Array.from(image.points.keys()));
			actions.navigateHome();
		}
	},
	{
		actionType: 'deselectAllPoints',
		func: ({stores, actions}) => {
			const settingStore = stores.settings;
			settingStore.set('activePoints', []);
			settingStore.set('selectAllPoints', false);
			actions.navigateHome();
		}
	}
]);