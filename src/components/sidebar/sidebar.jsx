import React, { Component } from 'react';

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
		const images = Array.from(generalStore.get('images').values());
		const interactable = generalStore.get('interactable');
		const confirmDeleteSaved = generalStore.get('confirmDeleteSaved');

		return (
			<section id='sidebar'>
				<div className='content'>
					<div className='input'>
						<input onChange={generalActions.setWorkingDirectory} type="file" webkitdirectory="true" />
					</div>
					<ul className='current-dir'>{
						images.sort((one, two) => one.name < two.name ? -1 : 1).map(image =>
							<li className={`${interactable ? 'selectable' : ''} ${image.uuid === selectedUuid ? 'selected' : ''}`}
								key={image.uuid}
								onClick={image.uuid === selectedUuid || !interactable ? () => {} : generalActions.loadImage.bind(undefined, image.uuid, false)}
							>
								<p>{image.name}</p>
								<p>{image.image.width}px</p>
							</li>
						)
					}</ul>
					<div className='imageFunctions'>
						<div onClick={safeboxActions.addImage.bind(undefined, generalStore.get('selectedUuid'))}
							 className={'selectable'}>
							<p>Store</p>
						</div>
						<div onClick={safeboxActions.updateImage.bind(undefined, generalStore.get('selectedUuid'))}
							 className={'selectable'}>
							<p>Update</p>
						</div>
						<div onClick={generalActions.writeSelectedImage.bind(undefined, undefined)}
							 className={'selectable'}>
							<p>Export</p>
						</div>
					</div>
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
					<div className='export'>
						<div onClick={interactable ? generalActions.writeSavedImages.bind(undefined, undefined) : () => {}}
							 className='selectable'>
							<p>Export Saved</p>
						</div>
						<div onClick={interactable ? generalActions.writeAllImages : () => {}}
							 className='selectable'>
							<p>Export All</p>
						</div>
						{ confirmDeleteSaved !== -1 ?
							<div onClick={interactable ? generalActions.deleteSaved : () => {}}
								 className='selectable warning'>
								<p>Confirm ({confirmDeleteSaved})</p>
							</div> :
							<div onClick={interactable ? generalActions.confirmDeleteSaved : () => {}}
								 className='selectable'>
								<p>Delete Saved</p>
							</div>
						}
					</div>
				</div>
				<div className='expand' draggable='true' onDrag={generalActions.moveSidebar}></div>
			</section>
		);
	}
}

module.exports = Sidebar;