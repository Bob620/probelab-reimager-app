import React, { Component } from 'react';

import '../general/common.scss'
import './options.scss'

import OptionsList from './optionslist.jsx';

import constants from '../../../constants.json';

import history from '../general/history.js';
import generalActions from '../general/actions.js'
import settingActions from '../settings/actions.js';
import generalStore from '../general/store.js';
import settingStore from '../settings/store.js';

class Options extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		const currentPos = settingStore.get('scalePosition');
		const interactable = generalStore.get('interactable');
		const optionsList = generalStore.get('optionsList');

		return (
			<section id='options'>
				<div className='expand' draggable='true' onDrag={generalActions.moveOptions} />
				<div className='content'>
					<div className='positions'>
						<div className={`ul ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.UPPERLEFT ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.UPPERLEFT) : () => {}}
						>
							<p>Upper Left</p>
						</div>
						<div className={`ur ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.UPPERRIGHT ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.UPPERRIGHT) : () => {}}
						>
							<p>Upper Right</p>
						</div>
						<div className={`ll ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.LOWERLEFT ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.LOWERLEFT) : () => {}}
						>
							<p>Lower Left</p>
						</div>
						<div className={`lc ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.LOWERCENTER ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.LOWERCENTER) : () => {}}
						>
							<p>Lower Center</p>
						</div>
						<div className={`lr ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.LOWERRIGHT ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.LOWERRIGHT) : () => {}}
						>
							<p>Lower Right</p>
						</div>
						<span className='filler-area'/>
						<span className='filler-left'/>
						<span className='filler-right'/>
						<div className={`bl ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.BELOWLEFT ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.BELOWLEFT) : () => {}}
						>
							<p>Below Left</p>
						</div>
						<div className={`bc ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.BELOWCENTER ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.BELOWCENTER) : () => {}}
						>
							<p>Below Center</p>
						</div>
						<div className={`br ${interactable ? 'selectable' : ''} ${currentPos === constants.settings.scalePositions.BELOWRIGHT ? 'selected' : ''}`}
							 onClick={interactable ? settingActions.setScalePosition.bind(undefined, constants.settings.scalePositions.BELOWRIGHT) : () => {}}
						>
							<p>Below Right</p>
						</div>
					</div>
					<div className='toggleables'>
						<div>
							<div className='colorOptions'>
								<p>Font Color</p>
								<select value={settingStore.get('scaleColor')} onChange={settingActions.changeScaleColor}>
									<option value={constants.settings.colors.AUTO}>Auto</option>
									<option value={constants.settings.colors.WHITE}>White</option>
									<option value={constants.settings.colors.BLACK}>Black</option>
								</select>
							</div>
							<div className='colorOptions'>
								<p>Background Color</p>
								<select value={settingStore.get('belowColor')} onChange={settingActions.changeBelowColor}>
									<option value={constants.settings.colors.AUTO}>Auto</option>
									<option value={constants.settings.colors.WHITE}>White</option>
									<option value={constants.settings.colors.BLACK}>Black</option>
								</select>
							</div>
							<div className='colorOptions'>
								<p>Point Color</p>
								<select value={settingStore.get('pointColor')} onChange={settingActions.changePointColor}>
									<option value={constants.settings.colors.RED}>Red</option>
									<option value={constants.settings.colors.ORANGE}>Orange</option>
									<option value={constants.settings.colors.WHITE}>White</option>
									<option value={constants.settings.colors.BLACK}>Black</option>
								</select>
							</div>
							<div className='colorOptions'>
								<p>Point Marker</p>
								<select value={settingStore.get('pointType')} onChange={settingActions.changePointType}>
									<option value={constants.settings.pointTypes.THERMOLIKE}>Thermo-Like</option>
									<option value={constants.settings.pointTypes.THERMOROUND}>Thermo-Round</option>
									<option value={constants.settings.pointTypes.CIRCLE}>Circle</option>
									<option value={constants.settings.pointTypes.CROSS}>Cross</option>
								</select>
							</div>
							<ToggleableScale min='0' max='100' maxLength='3' valueName='pointFontSize' autoName='autoPointFontSize' text='Point Font Size: '
											 toggleAuto={settingActions.toggleAutoPointFontSize}
											 changeFromAuto={settingActions.changeFromAutoPointFontSize}
											 onChange={settingActions.changePointFontSize}
							/>
						</div>
						<div>
							<div className='colorOptions'>
								<p>Scale Bar</p>
								<select value={settingStore.get('scaleBarPosition')} onChange={e => settingActions.changeBarPosition(undefined, e)}>
									<option value={constants.settings.scaleBarPositions.ABOVE}>Above</option>
									<option value={constants.settings.scaleBarPositions.BELOW}>Below</option>
								</select>
							</div>
							<ToggleableScale min='0' max='10000000' maxLength='8' valueName='scaleSize' autoName='autoScale' text='Scale(µm): '
											 toggleAuto={settingActions.toggleAutoScale}
											 changeFromAuto={settingActions.changeFromAutoScale}
											 onChange={settingActions.changeScaleSize}
							/>
							<ToggleableScale min='0' max='100' maxLength='3' valueName='scaleBarHeight' autoName='autoHeight' text='Scale Bar Height(%): '
											 toggleAuto={settingActions.toggleAutoScaleHeight}
											 changeFromAuto={settingActions.changeFromAutoHeight}
											 onChange={settingActions.changeScaleBarHeight}
							/>
							<ToggleableScale min='0' max='100' maxLength='3' valueName='backgroundOpacity' autoName='autoBackgroundOpacity' text='Background Opacity: '
											 toggleAuto={settingActions.toggleAutoBackgroundOpacity}
											 changeFromAuto={settingActions.changeFromAutoBackgroundOpacity}
											 onChange={settingActions.changeBackgroundOpacity}
							/>
						</div>
					</div>
					<div className='list-switcher'>
						<div className={`selectable ${optionsList === constants.optionsLists.POINTS ? 'selected' : ''}`}
							 onClick={() => {generalActions.changeOptionsList(constants.optionsLists.POINTS)}}>
							<p>Points</p>
						</div>
						<div className={`selectable ${optionsList === constants.optionsLists.LAYERS ? 'selected' : ''}`}
							 onClick={() => {generalActions.changeOptionsList(constants.optionsLists.LAYERS)}}>
							<p>Maps</p>
						</div>
					</div>
					<OptionsList />
				</div>
			</section>
		);
	}
}

class ToggleableScale extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const isAuto = settingStore.get(this.props.autoName);

		return <div className='scale selectable'>
			<p onClick={() => this.props.toggleAuto()}>{this.props.text}</p>
			{
				<input onClick={(event) => {if (isAuto) {
					this.props.toggleAuto();
					event.persist();
					setTimeout(() => event.target.select(), 10)
				}}}
					   onChange={isAuto ? this.props.changeFromAuto : this.props.onChange}
					   type={isAuto ? 'text' : 'number'}
					   value={isAuto ? 'Auto' : settingStore.get(this.props.valueName)}
					   maxLength={this.props.maxLength} min={this.props.min} max={this.props.max}
				/>
			}
		</div>
	}
}

module.exports = Options;