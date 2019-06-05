import React, { Component } from 'react';

import '../general/common.scss'
import './miniposition.scss'

class MiniPosition extends Component {
	constructor(props) {
		super(props);

		let pos = 'lc';

		switch(props.pos) {
			case 0:
				pos = 'bl';
				break;
			case 1:
				pos = 'll';
				break;
			case 2:
				pos = 'lr';
				break;
			case 3:
				pos = 'ul';
				break;
			case 4:
				pos = 'ur';
				break;
			case 5:
				pos = 'lc';
				break;
			case 6:
				pos = 'br';
				break;
			case 7:
				pos = 'bc';
				break;
		}

		this.state = {pos};
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