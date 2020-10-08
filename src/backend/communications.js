const generateUUID = require('./generateuuid.js');
const {CreateFakeLog, CreateCommLog} = require('./log.js');

module.exports = class {
	constructor(messageChannel = {
		on: () => {
		},
		send: () => {
		}
	}, log = CreateFakeLog()) {
		this.data = {
			messageChannel,
			messageCallbacks: new Map(),
			uuidCallbacks: new Map(),
			log,
			childLog: CreateFakeLog()
		};

		this.setMessageChannel();

		this.on('logger', async ({uuid, domain, comm}) => {
			if (uuid && (domain !== '' || comm !== '')) {
				this.data.childLog = await CreateCommLog(domain, this, uuid);
				this.data.log = await CreateCommLog(comm, this, uuid);
			}
		});
	}

	get log() {
		return this.data.childLog;
	}

	setMessageChannel(messageChannel = this.data.messageChannel) {
		this.data.messageChannel = messageChannel;

		for (const {reject} of this.data.uuidCallbacks.values())
			reject({code: 1, message: 'Message channel changed'});

		this.data.uuidCallbacks = new Map();

		this.data.messageChannel.on('message', async ({type, data, uuid}, sender = undefined) => {
			if (type === 'reject') {
				const callbacks = this.data.uuidCallbacks.get(uuid);
				this.data.uuidCallbacks.delete(uuid);
				if (callbacks)
					for (const callback of callbacks)
						callback.reject(data);
			} else if (type === 'resolve') {
				const callbacks = this.data.uuidCallbacks.get(uuid);
				this.data.uuidCallbacks.delete(uuid);
				if (callbacks)
					for (const callback of callbacks)
						callback.resolve(data);
			} else
				try {
					this.data.log.info(`Received '${type}' (${uuid})`);

					const callbacks = this.data.messageCallbacks.get(type);
					if (callbacks)
						if (sender)
							sender.send('resolve', (await Promise.all(callbacks.map(callback => callback(data)))).flat().filter(i => i), uuid);
						else
							this.send('resolve', (await Promise.all(callbacks.map(callback => callback(data)))).flat().filter(i => i), uuid);
				} catch(err) {
					this.data.log.error(err);

					if (sender)
						sender.send('reject', err.stack, uuid);
					else
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

			this.data.log.info(`Added '${type}' callback`);
		}
	}

	send(type, data = {}, uuid = generateUUID.v4()) {
		if (!type.startsWith(`log-${this.data.childLog.uuid}-`))
			this.data.log.info(`Sending '${type}' (${uuid})`);

		return new Promise((resolve, reject) => {
			if (type !== 'resolve' || type !== 'reject') {
				const callbacks = this.data.uuidCallbacks.get(uuid);
				if (callbacks)
					callbacks.push({
						resolve: data => {
							this.data.log.info(`Received '${type}' (${uuid})`);
							resolve(data);
						}, reject: err => {
							this.data.log.error(err);
							reject(err);
						}
					});
				else
					this.data.uuidCallbacks.set(uuid, [{resolve, reject}]);
			}

			this.data.messageChannel.send({type, data, uuid});
		});
	}
};
