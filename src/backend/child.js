const fork = require('child_process').fork;

const generateUUID = require('./generateuuid.js');

class Child {
	constructor() {
		this.data = {
			process: undefined,
			toRun: [],
			waitingList: new Map(),
			ready: false
		};

		this.respawn();
	}

	kill() {
		if (this.data.process && this.data.process.connected)
			this.data.process.kill();
	}

	respawn() {
		this.kill();

		for (const {uuid, reject} of this.data.waitingList.values())
			if (!this.data.toRun.map(({uuid}) => uuid).includes(uuid))
				reject('killed');

		this.data.waitingList = new Map();
		this.data.toRun = [];
		this.data.process = fork('./src/backend/childprocess.js');

		this.data.process.on('message', ({type, data, uuid}) => {
			let task;
			switch (type) {
				case 'resolve':
					task = this.data.waitingList.get(uuid);
					if (task)
						task.resolve(data);
					break;
				case 'reject':
					task = this.data.waitingList.get(uuid);
					if (task)
						task.reject(data);
					break;
				case 'debug':
					break;
				case 'ready':
					this.data.ready = true;
					for (const message of this.data.toRun)
						this.data.process.send(message);
					this.data.toRun = [];
			}
		});

		this.data.process.on('error', () => {
			this.data.ready = false;
		});

		this.data.process.on('exit', () => {
			this.data.ready = false;
		});
	}

	isWaitingOn(type) {
		if (type)
			return Array.from(this.data.waitingList.values()).filter(({waitType}) => type === waitType).length > 0;
		return false;
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

module.exports = Child;