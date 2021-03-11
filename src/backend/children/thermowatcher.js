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
			tempWatching: false
		};
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
			this.data.mainWatching = false;
		} else if (filename === tempFolder)
			this.tryWatchTemp();
		else if (!filename.endsWith('.ldb'))
			this.emit('update', {
				filename,
				uri: this.data.uri
			});
	}

	watchTempHandle(eventType, filename) {
		if (eventType === 'close') {
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