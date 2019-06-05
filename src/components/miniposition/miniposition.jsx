import React, { Component } from 'react';

import '../general/common.scss'
import './miniposition.scss'

class MiniPosition extends Component {
	constructor(props) {
		super(props);

		this.state = {pos: findPos(props.pos)};
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

function findPos(posNum) {
	switch(posNum) {
		case 0:
			return 'bl';
		case 1:
			return 'll';
		case 2:
			return 'lr';
		case 3:
			return 'ul';
		case 4:
			return 'ur';
		case 5:
			return 'lc';
		case 6:
			return 'br';
		case 7:
			return 'bc';
	}

	return 'lc';
}

module.exports = MiniPosition;