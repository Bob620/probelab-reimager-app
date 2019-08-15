import React, { Component } from 'react';

import './acknowledgement.scss'

module.exports = class extends Component {
	render() {
		return (
			<div className='about-acknowledgement'>
				<p>{this.props.text}</p>
				<br />
				<p>{this.props.name}</p>
				<p>{this.props.location}</p>
			</div>
		);
	}
};