import React, { Component } from 'react';

import '../general/common.scss'
import './options.scss'

import constants from '../../../constants';
import settingActions from '../settings/actions';
import generalStore from '../general/store';
import settingStore from '../settings/store';

module.exports = class OptionsList extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const selectedUuid = generalStore.get('selectedUuid');
		let image = generalStore.get('images').get(selectedUuid);
		image = image ? image : generalStore.get('safebox').get(selectedUuid);
		const activePoints = settingStore.get('activePoints');
		const activeLayers = settingStore.get('activeLayers');
		const optionsList = generalStore.get('optionsList');

		return (
			<div className='options-list'>
				<ul>
					{
						optionsList === constants.optionsLists.POINTS ?
							image && Array.from(image.points.values()).map(point =>
								<li key={point.uuid}
									className={activePoints.includes(point.uuid) ? 'div-selected point' : 'point'}
									onClick={activePoints.includes(point.uuid) ? settingActions.removePoint.bind(undefined, point.uuid) :
										settingActions.addPoint.bind(undefined, point.uuid)}>
									<div>
										<div/>
									</div>
									<p>Point {point.name}</p>
								</li>)
							: (optionsList === constants.optionsLists.LAYERS ?
							image && sortLayers(Array.from(image.layers.values())).filter(i => i).map(layer =>
								<li key={layer.uuid}
									className={activeLayers.includes(layer.uuid) ? 'div-selected layer' : 'layer'}>
									<div
										onClick={activeLayers.includes(layer.uuid) ? settingActions.removeLayer.bind(undefined, layer.uuid) :
											settingActions.addLayer.bind(undefined, layer.uuid)}>
										<div/>
									</div>
									<p>{layer.name}</p>
								</li>)
							: <div/>)
					}
				</ul>
			</div>
		)
	}
};

function sortLayers(layers) {
	let outputLayers = [];
	const order = generalStore.get('layerOrder');
	for (let i = 0; i < order.length; i ++)
		outputLayers.push(undefined);

	return layers.reduce((layers, layer) => {
		const position = order.indexOf(layer.element);
		if (position !== -1)
			layers[position] = layer;
		else
			layers.push(layer);
		return layers;
	}, outputLayers);
}
