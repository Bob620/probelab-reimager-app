const path = require('path');

const {CanvasRoot, NodeCanvas} = require('probelab-reimager');

const ThermoWatcher = require('../thermowatcher.js');
const Communications = require('../../communications.js');
const Functions = require('./functions.js');

class Child {
	constructor(canvas, comms = process) {
		this.data = {
			watchedDirs: new Map(),
			comms: new Communications(comms),
			canvas,
			cacheDir: '',
			imageCache: new Map()
		};

		this.data.comms.on('canvas', this.canvas.bind(this));
		this.data.comms.on('getDir', this.getDir.bind(this));
		this.data.comms.on('getImages', this.getImages.bind(this));
		this.data.comms.on('processImage', this.processImage.bind(this));
		this.data.comms.on('unwatchDir', this.unwatchDir.bind(this));
		this.data.comms.on('watchDir', this.watchDir.bind(this));
		this.data.comms.on('writeImage', this.writeImage.bind(this));

		canvas.init().then(async () => {
			await this.data.comms.send('ready');
			this.data.log = this.data.comms.log;
		});
	}

	async canvas({command, data}) {

	}

	async getDir({uri}) {
		this.data.log.info('Getting directory...');
		this.data.imageCache = await Functions.getDir(uri, this.data.canvas, this.data.log);
		this.data.cacheDir = path.resolve(uri);

		const thermos = this.data.imageCache.map(thermo => thermo.serialize());

		this.data.log.info(`Returning ${thermos.length} thermos from directory`);
		return thermos;
	}

	async getImages({uri, uuids = {}}) {
		this.data.log.info('Getting images...');
		if (uri !== this.data.cacheDir)
			await this.getDir({uri});

		return this.data.imageCache.map(thermo => {
			const uuid = uuids[thermo.data.files.entry];
			thermo.data.uuid = uuid ? uuid : thermo.data.uuid;
			return thermo.serialize();
		});
	}

	async processImage({uri, uuid, operations, settings}, returnThermo = false) {
		this.data.log.info(`Processing image (${uuid})  ${uri}`);
		this.data.log.info(`operations: ${operations.map(e => e.command).join(', ')}`);

		settings = Functions.sanitizeSettings(settings);

		for (let i = 0; i < operations.length; i++) {
			const {command, args} = operations[i];
			if (command === 'addScale')
				operations[i].args[0] = Functions.sanitizePosition(args[0]);
		}

		const uriDir = path.dirname(uri);
		if (uriDir !== this.data.cacheDir && path.dirname(uriDir) !== this.data.cacheDir)
			await this.getDir({uri: uriDir});

		const tempThermos = this.data.imageCache;
		if (tempThermos === undefined) {
			this.data.log.info(`Unable to find Thermo`);
			throw {code: 0, message: 'No Thermo found'};
		}

		this.data.log.info(`${tempThermos.length} Thermos found`);
		for (const thermo of tempThermos) {
			if (thermo.data.files.entry === uri) {
				thermo.data.uuid = uuid ? uuid : thermo.data.uuid;

				for (const {command, args} of operations) {
					this.data.log.info(`Running ${command}(${args.join(', ')})`);
					try {
						await thermo[command](...args, settings);
					} catch(err) {
						this.data.log.error(err);
						console.log(err);
						throw {code: 0, message: 'RIP'};
					}
				}

				if (returnThermo)
					return thermo;

				this.data.log.info(`Serializing thermo for transport...`);
				return {
					data: thermo.serialize(),
					image: await thermo.toUrl(settings)
				};
			}
		}

		this.data.log.info(`Unable to find Thermo matching`);
		throw {code: 0, message: 'No Thermo found'};
	}

	async unwatchDir({uri}) {
		this.data.log.info('Unwatching directory');
		const watcher = this.data.watchedDirs.get(uri);
		if (watcher) {
			watcher.unwatch();
			this.data.watchedDirs.delete(uri);
		}
	}

	async watchDir({uri}) {
		if (!this.data.watchedDirs.has(uri)) {
			this.data.log.info('Watching directory');
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
		this.data.log.info('Processing image...');
		const thermo = await this.processImage(
			{
				uri,
				uuid,
				operations: settings.uri.toLowerCase().endsWith('.acq') ? [] : operations, settings
			},
			true
		);

		this.data.log.info('Writing image...');
		await thermo.write(Functions.sanitizeSettings(settings));
		this.data.log.info('Image written');
	}
}

if (require.main === module)
	module.exports = new Child(new CanvasRoot(new NodeCanvas(require('canvas'))));
else
	module.exports = Child.bind(undefined, new CanvasRoot(new NodeCanvas(require('canvas'))));