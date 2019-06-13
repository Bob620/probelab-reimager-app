import React, { Component } from 'react';
import ReactSVG from 'react-svg';

import '../general/common.scss'
import './sidebar.scss'

import history from '../general/history.js';
import generalStore from '../general/store.js';
import generalActions from '../general/actions.js';
import safeboxActions from '../safebox/actions.js';

import MiniPosition from '../miniposition/miniposition.jsx';

class Sidebar extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		let selectedUuid = generalStore.get('selectedUuid');
		const safebox = Array.from(generalStore.get('safebox').values());
		const images = generalStore.get('images');
		const interactable = generalStore.get('interactable');

		return (
			<section id='sidebar'>
				<div className='content'>
					<div className='input'>
						<input onChange={generalActions.setWorkingDirectory} type="file" webkitdirectory="true" />
					</div>
					<ul className='current-dir'>{
						Object.values(images).sort((one, two) => one.data.name < two.data.name ? -1 : 1).map(image =>
							<li className={`${interactable ? 'selectable' : ''} ${image.data.uuid === selectedUuid ? 'selected' : ''}`}
								key={image.data.uuid}
								onClick={image.data.uuid === selectedUuid || !interactable ? () => {} : generalActions.loadImage.bind(undefined, image.data.uuid)}
							>
								<p>{image.data.name}</p>
							</li>
						)
					}</ul>
					<ul className='safebox'>{ safebox.length > 0 &&
						safebox.sort((one, two) => one.uuid < two.uuid ? -1 : 1)
							.map(({ uuid, name, settings }) =>
								<li className={`${interactable ? 'selectable' : ''} ${uuid === selectedUuid ? 'selected' : ''}`}
									key={uuid}
									onClick={uuid === selectedUuid || !interactable ? () => {
									} : safeboxActions.restoreImage.bind(undefined, uuid)}
								>
									<p>{name}</p>
									<MiniPosition pos={settings.scalePosition} />
									<span onClick={interactable ? (e) => safeboxActions.removeImage(e, uuid) : () => {}}><p>X</p></span>
								</li>
							)
					}</ul>
					<div onClick={interactable ? generalActions.writeSavedImages.bind(undefined, undefined) : () => {}}
						 className={'export selectable'}>
						<p>Export Saved Images</p>
					</div>
				</div>
				<div className='expand' draggable='true' onDrag={generalActions.moveSidebar}></div>
			</section>
		);
	}
}

module.exports = Sidebar;