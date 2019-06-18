import React, { Component } from 'react';

import './image.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';
import settingStore from '../../components/settings/store.js';
import settingActions from '../../components/settings/actions.js';

class Image extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const image = generalStore.get('selectedImage');

		return (
			<section id='main'>
				<div className='colors'>
					<div className='colorOptions'>
						<p>Font Color</p>
						<select value={settingStore.get('scaleColor')} onChange={settingActions.changeScaleColor}>
							<option value='auto'>Auto</option>
							<option value='white'>White</option>
							<option value='black'>Black</option>
						</select>
					</div>
					<div className='colorOptions'>
						<p>Below Color</p>
						<select value={settingStore.get('belowColor')} onChange={settingActions.changeBelowColor}>
							<option value='auto'>Auto</option>
							<option value='white'>White</option>
							<option value='black'>Black</option>
						</select>
					</div>
					<div onClick={() => settingActions.toggleBarLocation()} className='scale selectable'>
						<p>Scale Bar: </p>
						{
							settingStore.get('scaleBarTop') ?
								<p>Above</p> : <p>Below</p>
						}
					</div>
					<div className='scale selectable'>
						<p onClick={() => settingActions.toggleAutoScale()}>Scale(µm): </p>
						{
							settingStore.get('autoScale') ?
								<input onClick={() => settingActions.toggleAutoScale()} onChange={settingActions.changeFromAutoScale} type='text' value='Auto'/> :
								<input type='number' maxLength='8' min='0' max='10000000' value={settingStore.get('scaleSize')} onChange={settingActions.changeScaleSize} />
						}
					</div>
					<div className='scale selectable'>
						<p onClick={() => settingActions.toggleAutoScaleHeight()}>Scale Bar Height(%): </p>
						{
							settingStore.get('autoHeight') ?
								<input onClick={() => settingActions.toggleAutoScaleHeight()} onChange={settingActions.changeFromAutoHeight} type='text' value='Auto'/> :
								<input type='number' maxLength='3' min='0' max='100' value={settingStore.get('scaleBarHeight')} onChange={settingActions.changeScaleBarHeight} />
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
				<div className='image'>
					{ image ? <img src={image} /> : (generalStore.get('selectedUuid') !== undefined ? <div className='loading'><span>Loading</span><div /><div /><div /></div> : <div />) }
				</div>
			</section>
		);
	}
}

module.exports = Image;