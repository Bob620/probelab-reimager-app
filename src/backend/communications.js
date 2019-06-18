const generateUuid = require('./generateuuid.js');
const { ipcMain } = require('electron');

const ipcChannel = 'data';

module.exports = class {
	constructor(window) {
		this.data = {
			ipc: ipcMain,
			window,
			awaiting: new Map(),
			onMessage: new Map()
		};

		this.data.ipc.on(ipcChannel, async ({sender}, {type, data, uuid}) => {
			const waiting = this.data.awaiting.get(uuid);
			const onMessage = this.data.onMessage.get(type);
			if (waiting)
				if (type === 'resolve')
					waiting.resolve(data);
				else
					waiting.reject(data);
			else if (onMessage) {
				try {
					sender.send(ipcChannel, {
						uuid,
						type: 'resolve',
						data: await onMessage(data),
					});
				} catch(err) {
					sender.send(ipcChannel, {
						uuid,
						type: 'reject',
						data: err``,
					});
				}
			}
		});
	}

	onMessage(type, func) {
		if (typeof func === 'function')
			this.data.onMessage.set(type, func);
		return this;
	}

	sendMessage(type, data, willReturn=true) {
		const uuid = generateUuid.v4();
		if (willReturn)
			return new Promise((resolve, reject) => {
				this.data.awaiting.set(uuid, {resolve, reject, type});
				this.data.window.send(ipcChannel, {type, data, uuid});
			});
		else
			this.data.window.send(ipcChannel, {type, data, uuid});
	}
};
