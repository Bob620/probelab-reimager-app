import React, { Component } from 'react';

import './settings.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';
import settingStore from '../../components/settings/store.js';
import settingActions from '../../components/settings/actions.js';

class Settings extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section id='main' className='settings'>
				<div className='colors'>
					<div className='scale selectable'>
						<p onClick={settingActions.toggleAutoPixelSizeConstant}>Pixel Size Constant: </p>
						{
							settingStore.get('autoPixelSizeConstant') ?
								<input onClick={settingActions.toggleAutoPixelSizeConstant} onChange={settingActions.changeFromAutoPixelSizeConstant} type='text' value='Auto'/> :
								<input type='number' maxLength='10' min='0' max='500' value={settingStore.get('pixelSizeConstant')} onChange={settingActions.changePixelSizeConstant} />
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