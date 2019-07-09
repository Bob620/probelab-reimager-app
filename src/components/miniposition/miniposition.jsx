import React, { Component } from 'react';

import '../general/common.scss'
import './miniposition.scss'

class MiniPosition extends Component {
	constructor(props) {
		super(props);

		this.state = {pos: props.pos};
	}

	render() {
		return (
			<div className={`mini-position ${this.state.pos}`}>
				<div></div>
				<div className='pos'></div>
				<div></div>
			</div>
		);
	}
}

module.exports = MiniPosition;