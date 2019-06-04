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
		actionType: 'toggleBarLocation',
		func: ({stores}, force=undefined) => {
			stores.settings.set('scaleBarTop', force !== undefined ? force : !stores.settings.get('scaleBarTop'));
		}
	},
	{
		actionType: 'toggleAutoPixelSizeConstant',
		func: ({stores}, force=undefined) => {
			stores.settings.set('autoPixelSizeConstant', force !== undefined ? force : !stores.settings.get('autoPixelSizeConstant'));
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
		actionType: 'changeFromAutoScale',
		func: ({stores}) => {
			actions.changeScaleSize(event);
			stores.settings.set('autoScale', false);
		}
	},
	{
		actionType: 'changeFromAutoHeight',
		func: ({stores}, event) => {
			actions.changeScaleBarHeight(event);
			stores.settings.set('autoHeight', false);
		}
	},
	{
		actionType: 'changeFromAutoPixelSizeConstant',
		func: ({stores}, event) => {
			actions.changeScaleBarHeight(event);
			stores.settings.set('autoPixelSizeConstant', false);
		}
	},
]);