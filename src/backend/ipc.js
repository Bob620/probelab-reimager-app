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
			this.data.ipc.on(channel, ({sender}, data) => {
				listener(data, sender ? {send: (type, data=[], uuid) => {
					sender.send('message', {type, data, uuid});
				}} : undefined);
			});
	}

	send(data) {
		return this.data.window.send('message', data);
	}
};