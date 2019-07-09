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
		const imageDataUrl = generalStore.get('selectedImage');
		const selectedUuid = generalStore.get('selectedUuid');
		let image = generalStore.get('images').get(selectedUuid);
		image = image !== undefined ? image : generalStore.get('safebox').get(selectedUuid);

		return (
			<section id='main' className='image'>
				<div className='image'>
					{ imageDataUrl ? <img src={imageDataUrl} /> : (selectedUuid !== undefined ? <div className='loading'><span>Loading</span><div /><div /><div /></div> : <div />) }
				</div>
				{
					image !== undefined && image.image.width !== undefined ?
						<div className='image-info'>
							<div>
								<p>Image Width: {image.image.width}px</p>
								<p>Image Height: {image.image.height}px</p>
							</div>
							<div>
								<p>Output Width: {image.output.width ? image.output.width : image.image.width}px</p>
								<p>Output Height: {image.output.height ? image.output.height : image.image.height}px</p>
							</div>
						</div> : <div/>
				}
			</section>
		);
	}
}

module.exports = Image;