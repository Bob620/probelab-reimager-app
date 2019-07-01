const generateUUID = require('../generateuuid.js');

module.exports = class {
	constructor(messageChannel=process) {
		this.data = {
			messageChannel,
			messageCallbacks: new Map(),
			uuidCallbacks: new Map()
		};

		this.data.messageChannel.on('message', async ({type, data, uuid}) => {
			if (type === 'reject') {
				const callbacks = this.data.uuidCallbacks.get('uuid');
				this.data.uuidCallbacks.delete('uuid');
				if (callbacks)
					for (const callback of callbacks)
						callback.reject(data);
			} else if (type === 'resolve') {
				const callbacks = this.data.uuidCallbacks.get('uuid');
				this.data.uuidCallbacks.delete('uuid');
				if (callbacks)
					for (const callback of callbacks)
						callback.resolve(data);
			} else
				try {
					const callbacks = this.data.messageCallbacks.get(type);
					if (callbacks)
						this.send('resolve', (await Promise.all(callbacks.map(callback => callback(data)))).flat(), uuid);
				} catch(err) {
					this.send('reject', err.stack, uuid);
				}
		});
	}

	on(type, callback) {
		if (typeof callback === 'function') {
			const callbacks = this.data.messageCallbacks.get(type);
			if (callbacks)
				callbacks.push(callback);
			else
				this.data.messageCallbacks.set(type, [callback]);
		}
	}

	send(type, data={}, uuid=generateUUID.v4()) {
		return new Promise((resolve, reject) => {
			const callbacks = this.data.uuidCallbacks.get(uuid);
			if (callbacks)
				callbacks.push({resolve, reject});
			this.data.messageChannel.send('message', {type, data, uuid});
		});
	}
};
