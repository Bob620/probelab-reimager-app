const fork = require('child_process').fork;

const generateUUID = require('./generateuuid.js');

module.exports = class ReimagerChild {
	constructor() {
		this.data = {
			process: undefined,
			onMessage: new Map(),
			toRun: [],
			waitingList: new Map(),
			ready: false,
			comms: undefined
		};

		this.respawn();
	}

	kill() {
		if (this.data.process && this.data.process.connected)
			this.data.process.kill();
	}

	respawn() {
		this.kill();

		console.log('Killed');

		for (const {uuid, reject} of this.data.waitingList.values())
			if (!this.data.toRun.map(({uuid}) => uuid).includes(uuid))
				reject('killed');

		this.data.waitingList = new Map();
		this.data.toRun = [];
		this.data.process = fork(`${__dirname}/children/reimagerchildprocess.js`);

		this.data.process.on('message', ({type, data, uuid}) => {
			let task;
			switch (type) {
				case 'canvas':
					if (this.data.canvasCB)
						this.data.canvasCB(data);
					break;
				case 'resolve':
					task = this.data.waitingList.get(uuid);
					if (task) {
						task.resolve(data);
						this.data.waitingList.delete(uuid);
					}
					break;
				case 'reject':
					task = this.data.waitingList.get(uuid);
					if (task) {
						task.reject(data);
						this.data.waitingList.delete(uuid);
					}
					break;
				case 'debug':
					if (this.data.comms)
						this.data.comms.sendMessage('debug', data);
					break;
				case 'ready':
					this.data.ready = true;
					for (const message of this.data.toRun)
						this.data.process.send(message);
					this.data.toRun = [];
					break;
				default:
					const messageHandle = this.data.onMessage.get(type);
					if (messageHandle)
						messageHandle(data);
					break;
			}
		});

		this.data.process.on('error', () => {
			this.data.ready = false;
		});

		this.data.process.on('exit', () => {
			this.data.ready = false;
		});
	}

	set comms(comms) {
		this.data.comms = comms;
	}

	onCanvas(cb) {
		this.data.canvasCB = cb;
	}

	isWaitingOn(type) {
		if (type)
			return Array.from(this.data.waitingList.values()).filter(({waitType}) => type === waitType).length > 0;
		return false;
	}

	onMessage(type, cb) {
		if (typeof cb === 'function')
			this.data.onMessage.set(type, cb);
	}

	sendMessage(type, data) {
		return new Promise((resolve, reject) => {
			const uuid = generateUUID.v4();
			this.data.waitingList.set(uuid, {resolve, reject, uuid, type});

			if (this.data.ready)
				this.data.process.send({type, data, uuid});
			else
				this.data.toRun.push({type, data, uuid});
		});
	}

}