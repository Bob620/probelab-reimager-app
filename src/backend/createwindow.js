const { BrowserWindow, app, Menu, shell } = require('electron');

const isMac = process.platform === 'darwin';

const template = [
	// { role: 'appMenu' }
	...(isMac ? [{
		label: app.getName(),
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideothers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	}] : []),
	// { role: 'fileMenu' }
	{
		label: 'File',
		submenu: [
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	},
	// { role: 'editMenu' }
/*	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			...(isMac ? [
				{ role: 'pasteAndMatchStyle' },
				{ role: 'delete' },
				{ role: 'selectAll' },
				{ type: 'separator' },
				{
					label: 'Speech',
					submenu: [
						{ role: 'startspeaking' },
						{ role: 'stopspeaking' }
					]
				}
			] : [
				{ role: 'delete' },
				{ type: 'separator' },
				{ role: 'selectAll' }
			])
		]
	},
*/
	// { role: 'viewMenu' }
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forcereload' },
			{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	},

	// { role: 'windowMenu' }
	{
		label: 'Window',
		submenu: [
			{ role: 'minimize' },
			{ role: 'zoom' },
			...(isMac ? [
				{ type: 'separator' },
				{ role: 'front' },
				{ type: 'separator' },
				{ role: 'window' }
			] : [
				{ role: 'close' }
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

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

module.exports = () => {
	let window = new BrowserWindow({
		minWidth: 1100,
		minHeight: 800,
		backgroundColor: '#4b6584',
		width: 1100,
		height: 800,
		title: 'Probelab ReImager',
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: false
		},
		show: false,
	});

	window.loadFile('./assets/index.html');

	window.once('ready-to-show', () => {
		window.show();
	});

	// Emitted when the window is closed.
	window.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		window = null
	});

	return window;
};