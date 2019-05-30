import React, { Component } from 'react';

import './image.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class Image extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const selectedImage = generalStore.get('selectedImage');

		if (selectedImage)
			return (
				<section id='main'>
					<div className='colors'>
						<div className='colorOptions'>
							<p>Font Color</p>
							<select value={generalStore.get('scaleColor')} onChange={generalActions.changeScaleColor}>
								<option value='auto'>Auto</option>
								<option value='white'>White</option>
								<option value='black'>Black</option>
							</select>
						</div>
						<div className='colorOptions'>
							<p>Below Color</p>
							<select value={generalStore.get('belowColor')} onChange={generalActions.changeBelowColor}>
								<option value='auto'>Auto</option>
								<option value='white'>White</option>
								<option value='black'>Black</option>
							</select>
						</div>
						<div className='scale selectable'>
							<p onClick={generalActions.toggleAutoScale}>Scale(µm): </p>
							{
								generalStore.get('autoScale') ?
									<input onClick={generalActions.toggleAutoScale} onChange={generalActions.changeFromAutoScale} type='text' value='Auto'/> :
									<input type='number' min='0' max='100000' value={generalStore.get('scaleSize')} onChange={generalActions.changeScaleSize} />
							}
						</div>
						<div className='scale selectable'>
							<p onClick={generalActions.toggleAutoScaleHeight}>Scale Bar Height(%): </p>
							{
								generalStore.get('autoHeight') ?
									<input onClick={generalActions.toggleAutoScaleHeight} onChange={generalActions.changeFromAutoHeight} type='text' value='Auto'/> :
									<input type='number' min='0' max='100' value={generalStore.get('scaleBarHeight')} onChange={generalActions.changeScaleBarHeight} />
							}
						</div>
						<div className='refresh selectable'>
							<p onClick={generalActions.loadImage.bind(undefined, false)}>Refresh Image</p>
						</div>
					</div>
					<div className='image'>
						<img src={selectedImage.data.image} />
					</div>
				</section>
			);
		return (
			<section id='main'>
			</section>
		);
	}
}

module.exports = Image;