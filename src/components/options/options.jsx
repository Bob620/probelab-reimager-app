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
		const selectedUuid = generalStore.get('selectedUuid');
		const currentPos = settingStore.get('scalePosition');
		const interactable = generalStore.get('interactable');
		let image = generalStore.get('images')[selectedUuid];
		image = image === undefined ? generalStore.get('safebox').get(selectedUuid) : image;
		const activePoints = settingStore.get('activePoints');

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
					<div className='toggleables'>
						<div>
							<div className='colorOptions'>
								<p>Font Color</p>
								<select value={settingStore.get('scaleColor')} onChange={settingActions.changeScaleColor}>
									<option value='auto'>Auto</option>
									<option value='white'>White</option>
									<option value='black'>Black</option>
								</select>
							</div>
							<div className='colorOptions'>
								<p>Background Color</p>
								<select value={settingStore.get('belowColor')} onChange={settingActions.changeBelowColor}>
									<option value='auto'>Auto</option>
									<option value='white'>White</option>
									<option value='black'>Black</option>
								</select>
							</div>
							<div className='colorOptions'>
								<p>Point Color</p>
								<select value={settingStore.get('pointColor')} onChange={settingActions.changePointColor}>
									<option value='red'>Red</option>
									<option value='orange'>Orange</option>
									<option value='white'>White</option>
									<option value='black'>Black</option>
								</select>
							</div>
							<div className='colorOptions'>
								<p>Point Marker</p>
								<select value={settingStore.get('pointType')} onChange={settingActions.changePointType}>
									<option value='thermo'>Thermo-Like</option>
									<option value='thermoCircle'>Thermo-Round</option>
									<option value='circle'>Circle</option>
									<option value='cross'>Cross</option>
								</select>
							</div>
							<ToggleableScale min='0' max='100' maxLength='3' valueName='backgroundOpacity' autoName='autoBackgroundOpacity' text='Background Opacity: '
											 toggleAuto={settingActions.toggleAutoBackgroundOpacity}
											 changeFromAuto={settingActions.changeFromAutoBackgroundOpacity}
											 onChange={settingActions.changeBackgroundOpacity}
							/>
						</div>
						<div>
							<div onClick={() => settingActions.toggleBarLocation()} className='scale selectable'>
								<p>Scale Bar: </p>
								{
									settingStore.get('scaleBarTop') ?
										<p>Above</p> : <p>Below</p>
								}
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
							<ToggleableScale min='0' max='100' maxLength='3' valueName='pointFontSize' autoName='autoPointFontSize' text='Point Font Size: '
											 toggleAuto={settingActions.toggleAutoPointFontSize}
											 changeFromAuto={settingActions.changeFromAutoPointFontSize}
											 onChange={settingActions.changePointFontSize}
							/>
						</div>
					</div>
					<div className='points'>
						<ul>
							{
								image && image.points && Object.values(image.points).map(point =>
									<li key={point.name}
										className={activePoints.includes(point.name) ? 'div-selected' : ''}
										onClick={activePoints.includes(point.name) ? settingActions.removePoint.bind(undefined, point.name) :
											settingActions.addPoint.bind(undefined, point.name)} >
										<div><div /></div>
										<p>{point.name}</p>
									</li>)
							}
						</ul>
					</div>
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