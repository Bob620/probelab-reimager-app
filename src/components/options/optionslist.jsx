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

		this.state = {
			image: '',
			dragging: {
				element: '',
				index: -1
			},
			layers: generalStore.get('layers')
		}
	}

	componentWillUpdate(nextProps, nextState, nextContext) {
		const selectedUuid = generalStore.get('selectedUuid');
		let image = generalStore.get('images').get(selectedUuid);
		image = image ? image : generalStore.get('safebox').get(selectedUuid);

		if (image && image.uuid !== this.state.image)
			this.setState({
				image: image.uuid,
				layers: generalStore.get('layers')
			});
	}

	render() {
		let image = generalStore.get('images').get(this.state.image);
		image = image ? image : generalStore.get('safebox').get(this.state.image);

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
							image && this.state.layers.filter(i => i).map((layer, index) =>
								<li key={layer.uuid}
									draggable="true"
									onDragStart={e => {
										this.setState({
											dragging: layer
										});
									}}
									onDragEnd={e => {
										this.setState({
											dragging: ''
										});
									}}
									onDragOver={e => {
										const otherIndex = this.state.layers.indexOf(this.state.dragging);
										if (otherIndex !== -1) {
											this.state.layers[otherIndex] = layer;
											this.state.layers[index] = this.state.dragging;
											this.setState({
												layers: this.state.layers
											});
										}
									}}
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

function sortLayers(layers, order) {
	let outputLayers = [];
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
