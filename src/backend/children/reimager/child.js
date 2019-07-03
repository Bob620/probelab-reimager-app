const fs = require('fs');

const { CanvasRoot, NodeCanvas } = require('thermo-reimager');

const ThermoWatcher = require('../thermowatcher.js');
const Communications = require('../communications.js');
const Functions = require('./functions.js');

class Child {
	constructor(canvas, comms=undefined) {
		this.data = {
			watchedDirs: new Map(),
			comms: new Communications(comms),
			canvas
		};

		this.data.comms.on('canvas', this.canvas.bind(this));
		this.data.comms.on('getDir', this.getDir.bind(this));
		this.data.comms.on('processImage', this.processImage.bind(this));
		this.data.comms.on('unwatchDir', this.unwatchDir.bind(this));
		this.data.comms.on('watchDir', this.watchDir.bind(this));
		this.data.comms.on('writeImage', this.writeImage.bind(this));

		canvas.init().then(() => {
			this.data.comms.send('ready');
		});
	}

	async canvas({command, data}) {

	}

	async getDir({uri}) {
		const test = (await Functions.getDir(uri, this.data.canvas));
		return test.map(thermo => thermo.uuidSerialize());
	}

	async processImage({uri, uuid, operations, settings}, returnThermo=false) {
		const splitUri = uri.split('/');
		const watcher = this.data.watchedDirs.get(splitUri.slice(0, -1).join('/'));
		const filename = splitUri[splitUri.length - 1];
		let file = undefined;

		if (watcher)
			file = watcher.get(filename);

		if (file === undefined) {
			file = fs.statSync(uri);
			file.uri = uri;
			file.name = filename;
		}

		const thermo = await Functions.createThermo(file, this.data.canvas, uuid);
		if (thermo === undefined) throw {code: 0, message: 'No Thermo found'};

		for (const {command, args} of operations)
			await thermo[command](...args, settings);

		if (returnThermo)
			return thermo;

		return {
			serial: thermo.uuidSerialize(),
			image: await thermo.toUrl(settings)
		};
	}

	async unwatchDir({uri}) {
		const watcher = this.data.watchedDirs.get(uri);
		if (watcher) {
			watcher.unwatch();
			this.data.watchedDirs.delete(uri);
		}
	}

	async watchDir({uri}) {
		if (!this.data.watchedDirs.has(uri)) {
			const watcher = new ThermoWatcher(uri);

			watcher.on('close', uri => {
				if (this.data.watchedDirs.has(uri))
					this.data.watchedDirs.delete(uri);
			});

			watcher.on('update', this.data.comms.send.bind(this.data.comms, 'dirUpdate'));
			this.data.watchedDirs.set(uri, watcher);
		}
	}

	async writeImage({uri, uuid, operations, settings}) {
		const thermo = await this.processImage({uri, uuid, operations, settings}, true);
		await thermo.write(settings);
	}
}

if (require.main === module)
	module.exports = new Child(new CanvasRoot(new NodeCanvas(require('canvas'))));
else
	module.exports = Child.bind(undefined, new CanvasRoot(new NodeCanvas(require('canvas'))));