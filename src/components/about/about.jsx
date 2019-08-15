import React, { Component } from 'react';

import './about.scss'

import Person from './person.jsx';
import Package from './package.jsx';
import Acknowledgement from './acknowledgement.jsx';

class About extends Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<section id='main' className='about'>
				<section className='people'>
					<h1>People</h1>
					<Person name='Noah Kraft' contact='kraft270@umn.edu' website='https://bobco.moe' role='Developer'/>
					<Person name='Anette von der Handt'  contact='avdhandt@umn.edu' website='http://avdhandt.umn.edu' role='QA and Management'/>
				</section>
				<section className='packages'>
					<h1>Packages</h1>
					<Package name='Node-Canvas' license='MIT' website='https://github.com/Automattic/node-canvas' copyright={[
						{name: 'LearnBoost, and contributors', year: '2010', contact: 'dev@learnboost.com'},
						{name: 'Automattic, Inc and contributors', year: '2014', contact: 'dev@automattic.com'}]
					}/>
					<Package name='Sharp' license='Apache 2.0' website='https://github.com/lovell/sharp' copyright={[]}/>
					<Package name='Bakadux' license='MIT' website='https://github.com/Bob620/bakadux' copyright={[
						{name: 'Bob620', year: '2018', contact: 'bruder.kraft225@gmail.com'}]
					}/>
					<Package name='Thermo-ReImager' license='MIT' website='https://github.com/Bob620/thermo-reimager' copyright={[
						{name: 'Bob620', year: '2019', contact: 'bruder.kraft225@gmail.com'}]
					}/>
					<Package name='Electron' license='MIT' website='https://electronjs.org' copyright={[
						{name: 'GitHub Inc.', year: '2013-2019', contact: ''}]
					}/>
					<Package name='React'  license='MIT' website='https://reactjs.org/' copyright={[
						{name: 'Facebook, Inc. and its affiliates', year: '', contact: ''}]
					}/>
				</section>
				<section className='license'>
					<Package name='Probelab ReImager' version={require('../../../package.json').version} license={require('../../../package.json').license} website='https://reimager.probelab.net' copyright={[
						{name: require('../../../package.json').author, year: '2019', contact: require('../../../package.json').email}
					]}/>
					<p>Please visit the <a target='_blank' href='https://github.com/Bob620/thermo-reimager-app'>github page</a> for the full license.</p>
				</section>
				<section className='acknowledgements'>
					<h1>Acknowledgements</h1>
					<Acknowledgement text="We gratefully acknowledge Mark Hirschmann's contribution to the creation of Probelab ReImager" name='Marc Hirschmann' location='Department of Earth and Environmental Sciences, Univeristy of Minnesota'/>
					<Acknowledgement text='NSF #1849465'/>
				</section>
				<section className='organizations'>
					<Person name='Probelab' contact='avdhandt@umn.edu' website='http://probelab.net' />
					<p>Thanks to Anette and Probelab at the University of Minnesota for providing use of the Electron Microprobe and other equipment.</p>
				</section>
			</section>
		);
	}
}

module.exports = About;