import React, { Component } from 'react';

import './image.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class Settings extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section id='main'>
				<div className='colors'>
					<div className='scale selectable'>
						<p onClick={generalActions.toggleAutoPixelSizeConstant}>Pixel Size Constant: </p>
						{
							generalStore.get('autoPixelSizeConstant') ?
								<input onClick={generalActions.toggleAutoPixelSizeConstant} onChange={generalActions.changeFromAutoPixelSizeConstant} type='text' value='Auto'/> :
								<input type='number' maxLength='10' min='0' max='500' value={generalStore.get('pixelSizeConstant')} onChange={generalActions.changePixelSizeConstant} />
						}
					</div>
					<div onClick={generalActions.navigateHome}
						 className='refresh selectable'>
						<p>Home</p>
					</div>
				</div>
			</section>
		);
	}
}

module.exports = Settings;