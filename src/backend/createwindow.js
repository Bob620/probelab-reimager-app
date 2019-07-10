const {BrowserWindow} = require('electron');

module.exports = () => {
	let window = new BrowserWindow({
		minWidth: 1100,
		minHeight: 800,
		backgroundColor: '#4b6584',
		width: 1100,
		height: 800,
		title: 'Probelab Reimager',
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