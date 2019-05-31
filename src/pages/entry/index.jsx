import React, { Component } from 'react';

import dispatcher from 'bakadux';

//import './bootstrap.min.css';
//import './flat-ui.min.css';
import '../../components/general/common.scss';

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

import Navbar from '../../components/navbar/navbar.jsx';
import Sidebar from '../../components/sidebar/sidebar.jsx';
import Image from '../../components/image/image.jsx';
import Settings from '../../components/settings/settings.jsx';

class Page extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const page = generalStore.get('page');

		switch(page) {
			default:
			case 'landing':
				return (
					<section className='app'>
						<Navbar />
						<Sidebar />
						<Image />
					</section>
				);
			case 'settings':
				return (
					<section className='app'>
						<Navbar />
						<Settings />
					</section>
				);
		}
	}
}

dispatcher.render(Page);