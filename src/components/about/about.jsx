import React, { Component } from 'react';

import './about.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class About extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section id='main' className='about'>

			</section>
		);
	}
}

module.exports = About;