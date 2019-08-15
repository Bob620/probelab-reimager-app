import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell as fasBell } from '@fortawesome/free-solid-svg-icons';
import { faBell as farBell } from '@fortawesome/free-regular-svg-icons';

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
		const notifs = generalStore.get('notifications');
		const page = generalStore.get('page');

		return (
			<section id='navbar'>
				{page !== 'settings' ? <div className='notifications'>
					<div onClick={generalActions.navigateSettings}>
						<FontAwesomeIcon icon={notifs.length === 0 ? farBell : fasBell} />
						{notifs.length !== 0 && <p>{notifs.length}</p>}
					</div>
				</div> : ''}
				<h1>Probelab ReImager</h1>
				{ generalStore.get('page') === 'landing' &&
					<div onClick={generalActions.loadImage.bind(undefined, false)}
						 className='refresh selectable'>
						<p>Refresh Image</p>
					</div>
				}
				{generalStore.get('page') !== 'landing' &&
					<div onClick={generalActions.navigateHome}
						 className='refresh selectable'>
						<p>Home</p>
					</div>
				}
			</section>
		);
	}
}

module.exports = Navbar;