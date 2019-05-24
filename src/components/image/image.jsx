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
					<img src={selectedImage.data.image} />
				</section>
			);
		return (
			<section id='main'>
			</section>
		);
	}
}

module.exports = Image;