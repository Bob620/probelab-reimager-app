import React, { Component } from 'react';

import './safebox.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';
import safeboxActions from './actions';

class Safebox extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		let selectedUuid = generalStore.get('selectedUuid');
		const safebox = Array.from(generalStore.get('safebox').values());

		return (
			<section id='safebox'>
			</section>
		);
	}
}

module.exports = Safebox;