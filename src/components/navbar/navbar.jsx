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
					<div onClick={generalActions.setScalePosition.bind(undefined, 0)}
						 className={'selectable ' + (currentPos === 0 ? 'selected' : '')}>
						<p>Below Left</p>
					</div>
					<div onClick={generalActions.setScalePosition.bind(undefined, 6)}
						 className={'selectable ' + (currentPos === 6 ? 'selected' : '')}>
						<p>Below Right</p>
					</div>
					<div onClick={generalActions.setScalePosition.bind(undefined, 7)}
						 className={'selectable ' + (currentPos === 7 ? 'selected' : '')}>
						<p>Below Center</p>
					</div>
					<div onClick={generalActions.setScalePosition.bind(undefined, 1)}
						 className={'selectable ' + (currentPos === 1 ? 'selected' : '')}>
						<p>Lower Left</p>
					</div>
					<div onClick={generalActions.setScalePosition.bind(undefined, 2)}
						 className={'selectable ' + (currentPos === 2 ? 'selected' : '')}>
						<p>Lower Right</p>
					</div>
					<div onClick={generalActions.setScalePosition.bind(undefined, 5)}
						 className={'selectable ' + (currentPos === 5 ? 'selected' : '')}>
						<p>Lower Center</p>
					</div>
					<div onClick={generalActions.setScalePosition.bind(undefined, 3)}
						 className={'selectable ' + (currentPos === 3 ? 'selected' : '')}>
						<p>Upper Left</p>
					</div>
					<div onClick={generalActions.setScalePosition.bind(undefined, 4)}
						 className={'selectable ' + (currentPos === 4 ? 'selected' : '')}>
						<p>Upper Right</p>
					</div>
					<div onClick={generalActions.writeSelectedImage}
						 className={'selectable'}>
						<p>Save Image</p>
					</div>
				</div>
			</section>
		);
	}
}

module.exports = Navbar;