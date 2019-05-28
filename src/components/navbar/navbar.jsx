import React, { Component } from 'react';

import './navbar.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class Navbar extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section id='navbar'>
				<h1>Thermo-ReImager</h1>
				<p onClick={generalActions.setScalePosition.bind(undefined, 0)}>Below</p>
				<p onClick={generalActions.setScalePosition.bind(undefined, 1)}>Lower Left</p>
				<p onClick={generalActions.setScalePosition.bind(undefined, 2)}>Lower Right</p>
				<p onClick={generalActions.setScalePosition.bind(undefined, 3)}>Upper Left</p>
				<p onClick={generalActions.setScalePosition.bind(undefined, 4)}>Upper Right</p>
				<p onClick={generalActions.writeSelectedImage}>Save Image</p>
			</section>
		);
	}
}

module.exports = Navbar;