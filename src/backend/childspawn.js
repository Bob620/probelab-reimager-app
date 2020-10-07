const fork = require('child_process').fork;

const CreateFakeLog = require('./log.js').CreateFakeLog;
const Communications = require('./communications.js');

module.exports = class {
	constructor(childName = '', {
		commsLog = CreateFakeLog(),
		internalLog = CreateFakeLog(),
		childDomain = '',
		childComm = ''
	} = {
		commsLog: CreateFakeLog(),
		internalLog: CreateFakeLog(),
		childDomain: '',
		childComm: ''
	}) {
		if (childName === '') throw {code: 2, message: 'No child name specified'};

		this.data = {
			childName,
			process: undefined,
			comms: new Communications(undefined, commsLog),
			toRun: [],
			ready: false,
			log: internalLog,
			childLog: {
				domain: childDomain,
				comm: childComm
			}
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

		this.data.comms.on('ready', async () => {
			await this.send('logger', {
				uuid: this.data.log.uuid,
				domain: this.data.childLog.domain,
				comm: this.data.childLog.comm
			});

			this.data.log.info('Spawned and ready');
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

		this.data.comms.on('error', err => {
			this.data.log.error(err);
			this.data.ready = false;
			this.respawn();
		});

		this.data.comms.on('exit', () => {
			this.data.log.info('Exited, respawning...');
			this.data.ready = false;
			this.respawn();
		});
	}

	on(type, callback) {
		if (typeof callback === 'function')
			this.data.comms.on(type, callback);
	}

	send(type, data) {
		if (this.isReady())
			return this.data.comms.send(type, data);

		return new Promise((resolve, reject) => {
			this.data.toRun.push({resolve, reject, type, data});
		});
	}
};