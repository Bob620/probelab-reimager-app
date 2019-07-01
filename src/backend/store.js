const fs = require('fs');
const fsPromise = require('fs').promises;

const { DateTime } = require('luxon');

const envPaths = require('env-paths');

module.exports = class {
	constructor(name) {
		const paths = envPaths(name);

		this.data = {
			name,
			paths,
			config: new Config(paths.config)
		}
	}

	get name() {
		return this.data.name;
	}

	get config() {
		return this.data.config;
	}
};

class Store {
	constructor(path, filename) {
		path = path.replace(/\\/gmi, '/');

		this.data = {
			path: path.endsWith('/') ? path : path + '/',
			filename,
			entries: [],
			store: {}
		}
	}

	get path() {
		return this.data.path;
	}

	get filename() {
		return this.data.filename;
	}

	async readEntries() {
		return (await fsPromise.readFile(this.data.path + this.data.filename, {encoding: 'utf8'}))
			.split('\n')
			.slice(0, -1)
			.map(line => new Entry(JSON.parse(line)));

	}

	updateStore(entries, existingStore={}) {
		return this.data.store = entries.reduce((store, {key, data}) => store[key] = {data}, existingStore);
	}

	addEntry(command, key, data) {
		this.data.entries.push(new Entry(command, key, data));
	}

	writeEntries() {
		return fsPromise.appendFile(this.data.path + this.data.filename, this.data.entries.join('\n')+'\n');
	}

	compressEntries() {

	}
}

class Entry {
	constructor(command, key, data, timestamp=DateTime.local()) {
		if (typeof command === 'object')
			this.data = {
				command: command.command,
				key: command.key,
				data: command.data,
				timestamp: DateTime.fromMillis(command.timestamp, {zone: 'utc'})
			};
		else if (typeof command === 'string')
			this.data = {
				command,
				key,
				data,
				timestamp
			};
		else
			throw 'Incorrect params for new Entry';
	}

	get command() {
		return '' + this.data.command;
	}

	get key() {
		return '' + this.data.key;
	}

	get data() {
		return JSON.parse(JSON.stringify(this.data.data));
	}

	get timestamp() {
		return this.data.timestamp;
	}

	serialize() {
		return {
			command: this.command,
			key: this.key,
			data: this.data,
			timestamp: this.timestamp.toUTC().toMillis()
		}
	}
}

class Config extends Store {
	constructor(path) {
		super(path, 'reimager.constructor');
	}

	get defaults() {

	}

	get deviceConstants() {

	}

	addDeviceConstant(constant, startDate, endDate) {

	}

	removeDeviceConstant(uuid) {

	}
}