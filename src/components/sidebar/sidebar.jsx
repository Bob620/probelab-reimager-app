import React, { Component } from 'react';

import '../general/common.scss'
import './sidebar.scss'

import history from '../../components/general/history.js';
import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';
import safeboxActions from '../../components/safebox/actions.js';

class Sidebar extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		let selectedUuid = generalStore.get('selectedUuid');
		const safebox = Array.from(generalStore.get('safebox').values());
		const images = generalStore.get('images');

		return (
			<section id='sidebar'>
				<div className='input'>
					<input onChange={generalActions.setWorkingDirectory} type="file" webkitdirectory="true" />
				</div>
				<ul>{
					Object.values(images).sort((one, two) => one.data.name < two.data.name ? -1 : 1).map(image =>
						<li className={'selectable ' + (image.data.uuid === selectedUuid ? 'selected' : '')}
							key={image.data.uuid}
							onClick={image.data.uuid === selectedUuid ? () => {} : generalActions.loadImage.bind(undefined, image.data.uuid)}
						>
							<p>{image.data.name}</p>
							<span><p></p></span>
						</li>
					)
				}</ul>
				<ul>{ safebox.length > 0 &&
					safebox.sort((one, two) => one.name < two.name ? -1 : 1)
						.map(({ uuid, name }) =>
							<li className={'selectable ' + (uuid === selectedUuid ? 'selected' : '')}
								key={uuid}
								onClick={uuid === selectedUuid ? () => {
								} : safeboxActions.restoreImage.bind(undefined, uuid)}
							>
								<p>{name}</p>
								<span onClick={(e) => safeboxActions.removeImage(e, uuid)}><p>X</p></span>
							</li>
						)
				}</ul>
				<div onClick={generalActions.writeSavedImages.bind(undefined, undefined)}
					 className={'export selectable'}>
					<p>Export Saved Images</p>
				</div>
			</section>
		);
	}
}

module.exports = Sidebar;