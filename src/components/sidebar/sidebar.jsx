import React, { Component } from 'react';

import '../general/common.scss'
import './sidebar.scss'

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
		const safeboxUuids = generalStore.get('safebox');
		const safebox = Array.from(generalStore.get('safebox').values());
		const images = Array.from(generalStore.get('images').values());
		const interactable = generalStore.get('interactable');
		const confirmDeleteSaved = generalStore.get('confirmDeleteSaved');
		const storeExport = generalStore.get('storeExport');
		const allExport = generalStore.get('allExport');
		const loadingDir = generalStore.get('loadingDir');
		const selectedUuids = generalStore.get('selectedUuids');
		const easyExport = generalStore.get('easyExport');

		return (
			<section id='sidebar'>
				<div className='content'>
					<div className='input'>
						<input onChange={generalActions.setWorkingDirectory} type="file" webkitdirectory="true" />
					</div>
					<ul className='current-dir'>{loadingDir ?
						<div>
							<div className='loading' />
						</div> :
						images.sort((one, two) => one.name < two.name ? -1 : 1).map(image =>
							<li className={`${interactable ? 'selectable' : ''} ${selectedUuids.has(image.uuid) ? 'selected' : ''}`}
								key={image.uuid}
								onClick={!interactable ? () => {} : e => {
									generalActions.loadImage(image.uuid, false, e.shiftKey, e.ctrlKey);
								}}
							>
								<p>{image.name}</p>
								<p>{image.image.width}px</p>
							</li>
						)
					}</ul>
					{selectedUuids.size <= 1 ? ( safeboxUuids.has(selectedUuid) ?
						<div className='imageFunctions'>
							<div onClick={safeboxActions.addImage.bind(undefined, selectedUuid)}
								 className={'selectable'}>
								<p>Store</p>
							</div>
							<div onClick={safeboxActions.updateImage.bind(undefined, selectedUuid)}
								 className={'selectable'}>
								<p>Update</p>
							</div>
							<div onClick={generalActions.writeSelectedImage.bind(undefined, undefined)}
								 className={'selectable'}>
								<p>Export</p>
							</div>
						</div> :
						<div className='imageFunctions'>
							<div onClick={safeboxActions.addImage.bind(undefined, selectedUuid)}
								 className={'selectable'}>
								<p>Store</p>
							</div>
							<div onClick={generalActions.writeSelectedImage.bind(undefined, undefined)}
								 className={'selectable'}>
								<p>Export</p>
							</div>
						</div>
					) :
					<div className='imageFunctions'>
						<div onClick={safeboxActions.addImages.bind(undefined, selectedUuids)}
							 className={'selectable'}>
							<p>Store Selected</p>
						</div>
						<div onClick={generalActions.writeSelectedImages.bind(undefined, undefined, undefined)}
							 className={'selectable'}>
							<p>Export Selected</p>
						</div>
						<div onClick={generalActions.toggleEasyExport.bind(undefined)}
							 className={`easyExport selectable ${easyExport ? 'enabled' : 'disabled'}`}>
							<p>Easy</p>
						</div>
					</div>
					}
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
						<div onClick={interactable && storeExport.done ? generalActions.writeSavedImages.bind(undefined, undefined) : () => {}}
							 className='selectable'>
							{storeExport.done ? <p>Export Saved</p> : <p>{storeExport.exported}/{storeExport.total}</p>}
						</div>
						<div onClick={interactable && allExport.done ? generalActions.writeAllImages.bind(undefined, undefined) : () => {}}
							 className='selectable'>
							{allExport.done ? <p>Export All</p> : <p>{allExport.exported}/{allExport.total}</p>}
						</div>
						{ confirmDeleteSaved !== -1 ?
							<div onClick={interactable ? generalActions.deleteSaved : () => {}}
								 className='selectable warning'>
								<p>Confirm? ({confirmDeleteSaved})</p>
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