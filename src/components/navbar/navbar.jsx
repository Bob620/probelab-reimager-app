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
		return (
			<section id='navbar'>
				<h1>Probelab ReImager</h1>
				<div>
					<div onClick={safeboxActions.addImage.bind(undefined, generalStore.get('selectedUuid'))}
						 className={'selectable'}>
						<p>Store</p>
					</div>
					<div onClick={safeboxActions.updateImage.bind(undefined, generalStore.get('selectedUuid'))}
						 className={'selectable'}>
						<p>Update</p>
					</div>
					<div onClick={generalActions.writeSelectedImage.bind(undefined, undefined)}
						 className={'selectable'}>
						<p>Export Image</p>
					</div>
					<div onClick={generalActions.navigateSettings}
						 className='refresh selectable'>
						<p>Settings</p>
					</div>
					<div onClick={generalActions.loadImage.bind(undefined, false)}
						 className='refresh selectable'>
						<p>Refresh Image</p>
					</div>
				</div>
			</section>
		);
	}
}

module.exports = Navbar;