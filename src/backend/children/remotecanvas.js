const EventEmitter = require('events');

const GenerateUuid = require('../generateuuid');

module.exports = class extends EventEmitter {
	constructor(remote) {
		super();

		this.data = {
			remote
		}
	}

	async send(namespace, command, args) {
		try {
			this.emit('resolve', uuid, await this.data.remote.sendMessage('canvas', {namespace, command, args, uuid}));
		} catch(err) {
			this.emit('reject', uuid, err);
		}
	}
};