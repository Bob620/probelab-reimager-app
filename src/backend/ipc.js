const { ipcMain } = require('electron');

module.exports = class {
	constructor(window, ipc=ipcMain) {
		this.data = {
			window,
			ipc
		}
	}

	on(channel, listener) {
		if (typeof listener === 'function')
			this.data.ipc.on(channel, listener);
	}

	send(data) {
		return this.data.window.send('message', data);
	}

}