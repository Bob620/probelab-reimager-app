import React, { Component } from 'react';

import './organization.scss'

module.exports = class extends Component {
	render() {
		return (
			<div className='about-organization'>
				<h2>{this.props.name}</h2>
			</div>
		);
	}
};