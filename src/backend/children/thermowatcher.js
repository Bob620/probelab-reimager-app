const fs = require('fs');

const tempFolder = '~temp';

module.exports = class {
	constructor(uri) {
		uri = uri.endsWith('/') ? uri : uri + '/';

		this.data = {
			uri,
			tempUri: uri + tempFolder + '/',
			listeners: new Map(),
			mainWatch: fs.watch(uri, {
				persistent: false
			}, this.watchMainHandle.bind(this)),
			tempWatch: this.tryWatchTemp(),
			mainWatching: true,
			tempWatching: false,
			mainFiles: new Files(uri),
			tempFiles: new Files(uri)
		};

		fs.readdir(this.data.uri, {withFileTypes: true}, (err, files) => {
			if (err) throw err;

			for (const file of files) {
				file.uri = this.data.uri + file.name;
				this.data.mainFiles.toggleFile(file.name, file);
			}
		});

		fs.readdir(this.data.tempUri, {withFileTypes: true}, (err, files) => {
			if (files)
				for (const file of files) {
					file.uri = this.data.uri + file.name;
					this.data.mainFiles.toggleFile(file.name, file);
				}
		});
	}

	on(event, listener) {
		const listeners = this.data.listeners.get(event);
		if (listeners)
			listeners.push(listener);
		else
			this.data.listeners.set(event, [listener]);
	}

	emit(event, data) {
		const listeners = this.data.listeners.get(event);
		for (const listener of listeners)
			listener(data);
	}

	get(filename) {
		let file = this.data.tempFiles.get(filename);
		if (file === undefined)
			file = this.data.mainFiles.get(filename);
		return file;
	}

	tryWatchTemp() {
		try {
			if (!this.data.tempWatching) {
				this.data.tempWatch = fs.watch(this.data.tempUri, {
					persistent: false
				}, this.watchTempHandle.bind(this));
				this.data.tempWatching = true;
				return this.data.tempWatch;
			}
		} catch(err) {
			return undefined;
		}
	}

	watchMainHandle(eventType, filename) {
		if (eventType === 'close') {
			this.data.mainFiles.clear();
			this.data.mainWatching = false;
		} else if (filename === tempFolder)
			this.tryWatchTemp();
		else {
			const added = this.data.mainFiles.toggleFile(filename);
			if (added)
				fs.statSync(this.data.uri + filename);
			this.emit('update', {
				type: added ? 'added' : 'removed',
				filename,
				uri: this.data.uri
			});
		}
	}

	watchTempHandle(eventType, filename) {
		if (eventType === 'close') {
			this.data.tempFiles.clear();
			this.data.tempWatching = false;
		} else {
			const added = this.data.tempFiles.toggleFile(filename);
			if (added)
	 			fs.statSync(this.data.tempUri + filename);

			this.emit('update', {
				type: added ? 'added' : 'removed',
				filename,
				uri: this.data.tempUri
			});
		}
	}

	unwatch() {
		if (this.data.mainWatching)
			this.data.mainWatch.close();
		if (this.data.tempWatching)
			this.data.tempWatch.close();

		this.emit('close', this.data.uri);
	}
};

class Files {
	constructor(uri) {
		this.data = {
			uri,
			files: new Map()
		}
	}

	clear() {
		this.data.files = new Map();
	}

	toggleFile(filename, stat=undefined) {
		if (this.data.files.has(filename)) {
			this.data.files.delete(filename);
			return false;
		}

		try {
			this.data.files.set(filename, stat ? stat : fs.statSync(this.data.uri + filename));
		} catch(err) {
			return false;
		}
		return true;
	}

	has(filename) {
		return this.data.files.has(filename);
	}

	get(filename) {
		return this.data.files.get(filename);
	}

	getFiles() {
		return Array.from(this.data.files);
	}
}