import React, { Component } from 'react';

import '../general/common.scss'
import './navbar.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';
import settingStore from '../../components/settings/store.js';
import settingActions from '../../components/settings/actions.js';
import safeboxActions from '../../components/safebox/actions.js';

class Navbar extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const currentPos = settingStore.get('scalePosition');
		return (
			<section id='navbar'>
				<h1>Probelab ReImager</h1>
				<div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 0)}
						 className={'selectable ' + (currentPos === 0 ? 'selected' : '')}>
						<p>Below Left</p>
					</div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 6)}
						 className={'selectable ' + (currentPos === 6 ? 'selected' : '')}>
						<p>Below Right</p>
					</div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 7)}
						 className={'selectable ' + (currentPos === 7 ? 'selected' : '')}>
						<p>Below Center</p>
					</div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 1)}
						 className={'selectable ' + (currentPos === 1 ? 'selected' : '')}>
						<p>Lower Left</p>
					</div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 2)}
						 className={'selectable ' + (currentPos === 2 ? 'selected' : '')}>
						<p>Lower Right</p>
					</div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 5)}
						 className={'selectable ' + (currentPos === 5 ? 'selected' : '')}>
						<p>Lower Center</p>
					</div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 3)}
						 className={'selectable ' + (currentPos === 3 ? 'selected' : '')}>
						<p>Upper Left</p>
					</div>
					<div onClick={settingActions.setScalePosition.bind(undefined, 4)}
						 className={'selectable ' + (currentPos === 4 ? 'selected' : '')}>
						<p>Upper Right</p>
					</div>
					<div onClick={safeboxActions.addImage.bind(undefined, generalStore.get('selectedUuid'))}
						 className={'selectable'}>
						<p>Store</p>
					</div>
					<div onClick={generalActions.writeSelectedImage.bind(undefined, undefined)}
						 className={'selectable'}>
						<p>Export Image</p>
					</div>
				</div>
			</section>
		);
	}
}

module.exports = Navbar;