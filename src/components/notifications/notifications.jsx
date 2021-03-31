import React, { Component } from 'react';

import './notifications.scss'

import generalStore from '../../components/general/store.js';
import generalActions from '../../components/general/actions.js';

class Notifications extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section className='notifications'>
				<ul>
					{generalStore.get('notifications').map(({type, description, link, title, linkAlt}, key) => {
						switch(type) {
							default:
							case 'info':
								return (
									<li key={key}>
										<h2>{title}</h2>
										<p>{description}</p>
									</li>);
							case 'update':
								return (
									<li key={key}>
										<h2>{title}</h2>
										<p>{description}</p>
										<a href={link} target='_blank'>{linkAlt}</a>
									</li>);
						}
					})}
				</ul>
			</section>
		);
	}
}

module.exports = Notifications;