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