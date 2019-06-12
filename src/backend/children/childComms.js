const EventEmitter = require('events');

module.exports = class extends EventEmitter {
	constructor(remote) {
		super();

		this.data = {
			remote
		};
	}

	onMessage({type, uuid, data}) {
		this.emit(type, uuid, data);
	}

	async send(namespace, command, args, uuid) {
		this.data.remote.send({type: 'canvas', data: {namespace, command, args, uuid}, uuid});
	}
};