const fork = require('child_process').fork;

const Communications = require('./communications.js');

module.exports = class {
	constructor(childName='') {
		if (childName === '') throw {code: 2, message: 'No child name specified'};

		this.data = {
			childName,
			process: undefined,
			comms: new Communications(),
			toRun: [],
			ready: false
		};

		this.respawn();
	}

	isReady() {
		return this.data.ready && this.data.process && this.data.process.connected;
	}

	kill() {
		this.data.ready = false;

		if (this.data.process && this.data.process.connected)
			this.data.process.kill();
	}

	respawn() {
		this.kill();
		this.data.toRun = [];
		this.data.process = fork(`${__dirname}/children/${this.data.childName}/child.js`);
		this.data.comms.setMessageChannel(this.data.process);

		this.data.comms.on('ready', () => {
			this.data.ready = true;

			const toRun = this.data.toRun;
			this.data.toRun = [];

			for (const {resolve, reject, type, data} of toRun) {
				try {
					resolve(this.send(type, data));
				} catch(err) {
					reject(err);
				}
			}

		});

		this.data.comms.on('error', () => {
			this.data.ready = false;
			this.respawn();
		});

		this.data.comms.on('exit', () => {
			this.data.ready = false;
			this.respawn();
		});
	}

	on(type, callback) {
		if (typeof callback === 'function')
			this.data.comms.on(type, callback)
	}

	send(type, data) {
		if (this.isReady())
			return this.data.comms.send(type, data);

		return new Promise((resolve, reject) => {
			this.data.toRun.push({resolve, reject, type, data});
		});
	}
};