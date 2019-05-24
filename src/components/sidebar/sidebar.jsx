import React, { Component } from 'react';

import './sidebar.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class Sidebar extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section id='sidebar'>
				<input onChange={generalActions.setWorkingDirectory} type="file" webkitdirectory="true" />
				<ul>{
					Object.values(generalStore.get('images')).map(image =>
						<li key={image.data.name} onClick={generalActions.loadImage.bind(undefined, image.data.name)}>
							<p>{image.data.name}</p>
						</li>
					)
				}</ul>
			</section>
		);
	}
}

module.exports = Sidebar;