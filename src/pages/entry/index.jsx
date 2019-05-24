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

class Page extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section className='app'>
				<Navbar />
				<Sidebar />
				<Image />
			</section>
		);
	}
}

dispatcher.render(Page);