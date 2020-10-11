const {BrowserWindow, app, Menu, shell} = require('electron');

const isMac = process.platform === 'darwin';
const isDev = require('../../package.json').version.includes('dev');

const template = [
	(isMac ? {
		label: app.getName(),
		submenu: [
			{role: 'about'},
			{type: 'separator'},
			{role: 'services'},
			{type: 'separator'},
			{role: 'hide'},
			{role: 'hideothers'},
			{role: 'unhide'},
			{type: 'separator'},
			{role: 'quit'}
		]
	} : {}),
	{
		label: 'File',
		submenu: [
			isMac ? {role: 'close'} : {role: 'quit'}
		]
	},
	(isDev ? {
		label: 'View',
		submenu: [
			{role: 'reload'},
			{role: 'forcereload'},
			{role: 'toggledevtools'},
			{type: 'separator'},
			{role: 'resetzoom'},
			{role: 'zoomin'},
			{role: 'zoomout'},
			{type: 'separator'},
			{role: 'togglefullscreen'}
		]
	} : {}),
	{
		label: 'Window',
		submenu: [
			{role: 'minimize'},
			...(isMac ? [
				{type: 'separator'},
				{role: 'front'},
				{type: 'separator'},
				{role: 'window'}
			] : [
				{role: 'close'}
			])
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Settings',
				click: (menuItem, browserWindow, e) => {
					browserWindow.send('message', {type: 'navigate', data: {page: 'settings'}, uuid: ''});
				}
			},
			{
				label: 'About',
				click: (menuItem, browserWindow, e) => {
					browserWindow.send('message', {type: 'navigate', data: {page: 'about'}, uuid: ''});
				}
			},
			{
				label: 'Probelab Website',
				click: (menuItem, browserWindow, e) => {
					shell.openExternal('http://probelab.net');
				}
			},
			{
				label: 'Reimager Website',
				click: (menuItem, browserWindow, e) => {
					shell.openExternal('http://reimager.probelab.net');
				}
			}
		]
	}
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template.filter(e => e.label || e.role)));

module.exports = log => {
	log.info('Creating window...');
	if (isDev)
		log.info('Window running in Dev mode');

	let window = new BrowserWindow({
		minWidth: 0,  // 1060, down from 1100
		minHeight: 0, // 680, down from 800
		backgroundColor: '#4b6584',
		width: 1100,
		height: 800,
		title: `Probelab ReImager${isDev ? ' Dev' : ''}`,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: false
		},
		show: false
	});

	window.loadFile('./assets/index.html');

	window.once('ready-to-show', () => {
		log.info(`Window ready to show`);
		window.show();
	});

	log.info(`Window created`);
	return window;
};