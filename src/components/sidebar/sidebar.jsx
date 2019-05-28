import React, { Component } from 'react';

import '../general/common.scss'
import './sidebar.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class Sidebar extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		let selectedName = generalStore.get('selectedImage');
		selectedName = selectedName ? selectedName.data.name : '';

		return (
			<section id='sidebar'>
				<div>
					<input onChange={generalActions.setWorkingDirectory} type="file" webkitdirectory="true" />
				</div>
				<ul>{
					Object.values(generalStore.get('images')).map(image =>
						<li className={'selectable ' + (image.data.name === selectedName ? 'selected' : '')}
							key={image.data.name}
							onClick={image.data.name === selectedName ? () => {} : generalActions.loadImage.bind(undefined, image.data.name)}
						>
							<p>{image.data.name}</p>
						</li>
					)
				}</ul>
			</section>
		);
	}
}

module.exports = Sidebar;