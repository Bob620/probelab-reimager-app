import React, { Component } from 'react';

import './package.scss'

module.exports = class extends Component {
	render() {
		return (
			<div className='about-package'>
				<h2>{this.props.name} {this.props.version}</h2>
				<p>{this.props.name} is licensed under {this.props.license}.</p>
				{this.props.copyright.map((copyright, key) =>
					<p key={key}>Copyright (c) {copyright.year} {copyright.name} {copyright.contact ? <strong>{copyright.contact}</strong> : ''}</p>
				)}
				<p>More information at <a target='_blank' href={this.props.website}>{this.props.website}</a></p>
			</div>
		);
	}
};