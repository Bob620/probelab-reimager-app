module.exports = class {
	constructor(ipc) {
		this.data = {
			ipc
		}
	}

	on(channel, listener) {
		if (typeof listener === 'function')
			this.data.ipc.on(channel, (sender, data) => {
				listener(data)
			});
	}

	send(data) {
		return this.data.ipc.send('message', data);
	}
};