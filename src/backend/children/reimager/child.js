const { CanvasRoot, NodeCanvas } = require('thermo-reimager');

const ThermoWatcher = require('../thermowatcher.js');
const Communications = require('../../communications.js');
const Functions = require('./functions.js');

class Child {
	constructor(canvas, comms=process) {
		this.data = {
			watchedDirs: new Map(),
			comms: new Communications(comms),
			canvas
		};

		this.data.comms.on('canvas', this.canvas.bind(this));
		this.data.comms.on('getDir', this.getDir.bind(this));
		this.data.comms.on('getImages', this.getImages.bind(this));
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
		return (await Functions.getDir(uri, this.data.canvas)).map(thermo => thermo.serialize());
	}

	async getImages({uri, uuids={}}) {
		return (await Functions.getImages(uri, this.data.canvas)).map(thermo => {
			const uuid = uuids[thermo.data.files.entry];
			thermo.data.uuid = uuid ? uuid : thermo.data.uuid;
			return thermo.serialize();
		});
	}

	async processImage({uri, uuid, operations, settings}, returnThermo=false) {
		settings = Functions.sanitizeSettings(settings);

		for (let i = 0; i < operations.length; i++) {
			const {command, args} = operations[i];
			if (command === 'addScale')
				operations[i].args[0] = Functions.sanitizePosition(args[0]);
		}

		const tempThermos = await Functions.getImages(uri.split('/').slice(0, -1).join('/') + '/', this.data.canvas);
		if (tempThermos === undefined) throw {code: 0, message: 'No Thermo found'};

		for (const thermo of tempThermos) {
			if (thermo.data.files.entry === uri) {
				thermo.data.uuid = uuid ? uuid : thermo.data.uuid;

				for (const {command, args} of operations)
					await thermo[command](...args, settings);

				if (returnThermo)
					return thermo;

				return {
					data: thermo.serialize(),
					image: await thermo.toUrl(settings)
				};
			}
		}

		throw {code: 0, message: 'No Thermo found'};
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
		const thermo = await this.processImage(
			{
				uri,
				uuid,
				operations: settings.uri.toLowerCase().endsWith('.acq') ? [] : operations, settings
			},
			true
		);
		await thermo.write(Functions.sanitizeSettings(settings));
	}
}

if (require.main === module)
	module.exports = new Child(new CanvasRoot(new NodeCanvas(require('canvas'))));
else
	module.exports = Child.bind(undefined, new CanvasRoot(new NodeCanvas(require('canvas'))));