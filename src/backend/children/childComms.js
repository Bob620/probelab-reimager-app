const EventEmitter = require('events');

module.exports = class extends EventEmitter {
	constructor(remote) {
		super();

		this.data = {
			remote
		};

		remote.on('canvas', ({type, uuid, data}) => {
			this.emit(type, uuid, data);
		});
	}

	async send(namespace, command, args, uuid) {
		this.data.remote.send('canvas', {namespace, command, args, uuid});
	}
};