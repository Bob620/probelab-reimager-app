import React, { Component } from 'react';

import './person.scss'

module.exports = class extends Component {
	render() {
		return (
			<div className='about-person'>
				<h2>{this.props.name}</h2>
				<p>Contact: <strong>{this.props.contact}</strong></p>
				<p>Website: <a target='_blank' href={this.props.website}>{this.props.website}</a></p>
				<p>{this.props.role}</p>
			</div>
		);
	}
};