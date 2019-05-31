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
					<div onClick={generalActions.toggleBarLocation} className='scale selectable'>
						<p>Scale Bar: </p>
						{
							generalStore.get('scaleBarTop') ?
								<p>Above</p> : <p>Below</p>
						}
					</div>
					<div className='scale selectable'>
						<p onClick={generalActions.toggleAutoScale}>Scale(µm): </p>
						{
							generalStore.get('autoScale') ?
								<input onClick={generalActions.toggleAutoScale} onChange={generalActions.changeFromAutoScale} type='text' value='Auto'/> :
								<input type='number' maxLength='8' min='0' max='10000000' value={generalStore.get('scaleSize')} onChange={generalActions.changeScaleSize} />
						}
					</div>
					<div className='scale selectable'>
						<p onClick={generalActions.toggleAutoScaleHeight}>Scale Bar Height(%): </p>
						{
							generalStore.get('autoHeight') ?
								<input onClick={generalActions.toggleAutoScaleHeight} onChange={generalActions.changeFromAutoHeight} type='text' value='Auto'/> :
								<input type='number' maxLength='3' min='0' max='100' value={generalStore.get('scaleBarHeight')} onChange={generalActions.changeScaleBarHeight} />
						}
					</div>
					<div onClick={generalActions.navigateSettings}
						 className='refresh selectable'>
						<p>Settings</p>
					</div>
					<div onClick={generalActions.loadImage.bind(undefined, false)}
						 className='refresh selectable'>
						<p>Refresh Image</p>
					</div>
				</div>
				{
					selectedImage &&
					<div className='image'>
						<img src={selectedImage.data.image} />
					</div>
				}
			</section>
		);
	}
}

module.exports = Image;