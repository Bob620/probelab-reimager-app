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

		this.data.comms.on('canvas', this.canvas);
		this.data.comms.on('watchDir', this.watchDir);
		this.data.comms.on('unwatchDir', this.unwatchDir);
		this.data.comms.on('getDir', this.getDir);
		this.data.comms.on('processImage', this.processImage);
		this.data.comms.on('writeImage', this.writeImage);

		this.data.comms.send('ready');
	}

	async canvas({command, data}) {

	}

	async getDir({uri}) {
		return (await Functions.getDir(uri, this.data.canvas)).map(thermo => thermo.uuidSerialize());
	}

	async processImage({uri, uuid, operations, settings}, returnThermo=false) {
		const splitUri = uri.split('/');
		const watcher = this.data.watchedDirs.get(splitUri.slice(0, -1).join('/'));
		let file = undefined;

		if (watcher)
			file = watcher.get(splitUri[splitUri.length - 1]);

		if (file === undefined) {
			file = fs.statSync(uri);
			file.uri = uri;
		}

		const thermo = await Functions.createThermo(file, this.data.canvas, uuid);
		if (thermo === undefined) throw {code: 0, message: 'No Thermo found'};

		for (const operation of operations)
			await thermo[operation](settings);

		if (returnThermo)
			return thermo;

		return {
			serial: thermo.uuidSerialize(),
			image: await thermo.toUrl()
		};
	}

	async writeImage({uri, uuid, operations, settings}) {
		const thermo = await this.processImage({uri, uuid, operations, settings}, true);
		await thermo.write(settings);
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

	async unwatchDir({uri}) {
		const watcher = this.data.watchedDirs.get(uri);
		if (watcher) {
			watcher.unwatch();
			this.data.watchedDirs.delete(uri);
		}
	}
}

if (require.main === module)
	module.exports = new Child(new CanvasRoot(new NodeCanvas(require('canvas'))));
else
	module.exports = Child.bind(undefined, new CanvasRoot(new NodeCanvas(require('canvas'))));