import React, { Component } from 'react';

import '../general/common.scss'
import './navbar.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class Navbar extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const currentPos = generalStore.get('scalePosition');
		return (
			<section id='navbar'>
				<h1>Thermo-ReImager</h1>
				<div>
					<div className={'selectable ' + (currentPos === 0 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 0)}>Below Left</p>
					</div>
					<div className={'selectable ' + (currentPos === 6 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 6)}>Below Right</p>
					</div>
					<div className={'selectable ' + (currentPos === 7 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 7)}>BelowCenter</p>
					</div>
					<div className={'selectable ' + (currentPos === 1 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 1)}>Lower Left</p>
					</div>
					<div className={'selectable ' + (currentPos === 2 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 2)}>Lower Right</p>
					</div>
					<div className={'selectable ' + (currentPos === 5 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 5)}>Lower Center</p>
					</div>
					<div className={'selectable ' + (currentPos === 3 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 3)}>Upper Left</p>
					</div>
					<div className={'selectable ' + (currentPos === 4 ? 'selected' : '')}>
						<p onClick={generalActions.setScalePosition.bind(undefined, 4)}>Upper Right</p>
					</div>
					<div className={'selectable'}>
						<p onClick={generalActions.writeSelectedImage}>Save Image</p>
					</div>
				</div>
			</section>
		);
	}
}

module.exports = Navbar;