const fork = require('child_process').fork;

const CreateFakeLog = require('./log.js').CreateFakeLog;
const Communications = require('./communications.js');
const FakeComm = require('./fakecomm.js');

class FakeChild {
	constructor(childFile, comms) {
		this.data = {
			child: undefined,
			comms,
			fakeComm: new FakeComm()
		};

		this.data.comms.setMessageChannel(this.data.fakeComm.endTwo);
		this.data.child = new (require(childFile))(this.data.fakeComm.endOne);
	}

	on(event, func) {

	}

	kill() {
		this.data.child = undefined;
	}
}

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

		internalLog.info(`Creating child '${childName}'...`);

		this.data = {
			childName,
			process: undefined,
			comms: new Communications(undefined, commsLog),
			toRun: [],
			ready: false,
			fails: 0,
			log: internalLog,
			commsLog,
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

	respawn(fakeChild = false) {
		if (this.data.process === undefined) {
			this.data.process = '';

			const childFile = `${__dirname}/children/${this.data.childName}/child.js`;

			this.data.log.info(`Attempting to spawn '${childFile}'${fakeChild ? ' as a fake child' : ''}`);

			this.kill();
			this.data.toRun = [];

			if (fakeChild) {
				this.data.process = new FakeChild(childFile, this.data.comms);
			} else {
				this.data.process = fork(childFile);
				this.data.comms.setMessageChannel(this.data.process);
			}

			this.on('ready', async () => {
				await this.data.comms.send('logger', {
					uuid: this.data.log.uuid,
					domain: this.data.childLog.domain,
					comm: this.data.childLog.comm
				});

				this.data.log.listenOn(this.data.comms);

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

			this.data.process.on('error', err => {
				this.data.log.error(err);
				this.data.ready = false;

				this.data.process.kill();
				this.data.comms = new Communications(undefined, this.data.commsLog);

				this.data.process = undefined;
				this.respawn();
			});

			this.data.process.on('exit', (code, signal) => {
				this.data.log.info(`Exited with code ${code !== null ? code : signal}, respawning...`);
				this.data.ready = false;
				this.data.fails++;

				this.data.process.kill();
				this.data.comms = new Communications(undefined, this.data.commsLog);

				this.data.process = undefined;
				if (this.data.fails > 2)
					this.respawn(true);
				else
					this.respawn();
			});
		}
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