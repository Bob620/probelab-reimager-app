import React, { Component } from 'react';

import '../general/common.scss'
import './options.scss'

import history from '../general/history.js';
import generalActions from '../general/actions.js'
import settingActions from '../settings/actions';
import generalStore from '../general/store';
import settingStore from '../settings/store';

class Options extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const currentPos = settingStore.get('scalePosition');
		const belowColor = settingStore.get('belowColor');
		const interactable = generalStore.get('interactable');

		return (
			<section id='options'>
				<div className='expand' draggable='true' onDrag={generalActions.moveOptions}></div>
				<div className='content'>
					<div className='positions'>
						<div className={`ul ${interactable ? 'selectable' : ''} ${currentPos === 3 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 3) : () => {}}
						>
							<p>Upper Left</p>
						</div>
						<div className={`ur ${interactable ? 'selectable' : ''} ${currentPos === 4 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 4) : () => {}}
						>
							<p>Upper Right</p>
						</div>
						<div className={`ll ${interactable ? 'selectable' : ''} ${currentPos === 1 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 1) : () => {}}
						>
							<p>Lower Left</p>
						</div>
						<div className={`lc ${interactable ? 'selectable' : ''} ${currentPos === 5 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 5) : () => {}}
						>
							<p>Lower Center</p>
						</div>
						<div className={`lr ${interactable ? 'selectable' : ''} ${currentPos === 2 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 2) : () => {}}
						>
							<p>Lower Right</p>
						</div>
						<span className='filler-area'></span>
						<span className='filler-left'></span>
						<span className='filler-right'></span>
						<div className={`bl ${interactable ? 'selectable' : ''} ${currentPos === 0 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 0) : () => {}}
						>
							<p>Below Left</p>
						</div>
						<div className={`bc ${interactable ? 'selectable' : ''} ${currentPos === 7 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 7) : () => {}}
						>
							<p>Below Center</p>
						</div>
						<div className={`br ${interactable ? 'selectable' : ''} ${currentPos === 6 ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, 6) : () => {}}
						>
							<p>Below Right</p>
						</div>
					</div>
				</div>
			</section>
		);
	}
}

module.exports = Options;