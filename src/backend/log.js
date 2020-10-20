const fs = require('fs');

const generateUuid = require('./generateuuid.js').v4;

class Log {
	constructor() {
		this.data = {
			history: [],
			uuid: generateUuid()
		};
	}

	get uuid() {
		return this.data.uuid
	}

	listenOn(comm) {
		comm.on(`log-${this.data.uuid}-info`, ({domain, message}) => this.info.call(this, domain, message));
		comm.on(`log-${this.data.uuid}-warn`, ({domain, err}) => this.warn.call(this, domain, err));
		comm.on(`log-${this.data.uuid}-error`, ({domain, err}) => this.error.call(this, domain, err));
		comm.on(`log-${this.data.uuid}-serialize`, () => this.serialize.call(this));
		comm.on(`log-${this.data.uuid}-export`, ({uri}) => this.warn.call(this, uri));
	}

	createDomain(domain) {
		return {
			uuid: this.uuid,
			listenOn: this.listenOn.bind(this),
			createDomain: this.createDomain.bind(this),
			info: this.info.bind(this, domain),
			warn: this.warn.bind(this, domain),
			error: this.error.bind(this, domain),
			serialize: this.serialize.bind(this),
			export: this.export.bind(this)
		};
	}

	info(domain, message) {
		this.data.history.push(`${domain} | ${message}`);
		console.info(`${domain} | ${message}`);
	}

	warn(domain, err) {
		this.data.history.push(`${domain} | ${Object.prototype.toString.call(err) === '[object String]' ? err : `${err.code}  -  ${err.message}`}`);
		console.warn(`${domain} | ${Object.prototype.toString.call(err) === '[object String]' ? err : `${err.code}  -  ${err.message}`}`);

		if (err.stack) {
			this.data.history.push(err.stack);
			console.log(err.stack);
		}
	}

	error(domain, err = new Error()) {
		this.data.history.push(`${domain} | ${Object.prototype.toString.call(err) === '[object String]' ? err : `${err.code}  -  ${err.message}`}`);
		console.error(`${domain} | ${Object.prototype.toString.call(err) === '[object String]' ? err : `${err.code}  -  ${err.message}`}`);

		if (err.stack) {
			this.data.history.push(err.stack);
			console.log(err.stack);
		}
	}

	serialize() {
		return this.data.history.join('\n');
	}

	export(uri) {
		fs.writeFileSync(uri, this.serialize());
	}
}

function CreateFakeLog() {
	return {
		uuid: generateUuid(),
		listenOn: () => {},
		createDomain: CreateFakeLog,
		info: () => {
		},
		warn: () => {
		},
		error: () => {
		},
		serialize: () => {
		},
		export: () => {
		}
	};
}

async function CreateCommLog(domain, comm, uuid) {
	return {
		uuid,
		listenOn: (newComm) => {
			if (comm !== newComm) {
				newComm.on(`log-${this.data.uuid}-info`, this.info.bind(this));
				newComm.on(`log-${this.data.uuid}-warn`, this.warn.bind(this));
				newComm.on(`log-${this.data.uuid}-error`, this.error.bind(this));
				newComm.on(`log-${this.data.uuid}-serialize`, this.serialize.bind(this));
				newComm.on(`log-${this.data.uuid}-export`, this.export.bind(this));
			}
		},
		createDomain: CreateCommLog,
		info: async message => {
			await comm.send(`log-${uuid}-info`, {domain, message});
		},
		warn: async err => {
			await comm.send(`log-${uuid}-warn`, {domain, err});
		},
		error: async err => {
			await comm.send(`log-${uuid}-error`, {domain, err});
		},
		serialize: async () => {
			return await comm.send(`log-${uuid}-serialize`);
		},
		export: async uri => {
			await comm.send(`log-${uuid}-export`, {uri});
		}
	};
}

module.exports = {
	Log,
	CreateFakeLog,
	CreateCommLog
};