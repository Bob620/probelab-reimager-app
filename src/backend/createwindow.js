const {BrowserWindow} = require('electron');

module.exports = () => {
	let window = new BrowserWindow({width: 800, height: 800, webPreferences: {nodeIntegration: true}});

	window.loadFile('./assets/index.html');

	// Emitted when the window is closed.
	window.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		window = null
	});

	return window;
};