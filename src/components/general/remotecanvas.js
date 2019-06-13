require('babel-core/register');
require('babel-polyfill');

const GenerateUuid = require('../../backend/generateuuid');

module.exports = class {
	constructor(comms, store) {
		this.data = {
			Canvas: undefined,
			comms,
			store,
			width: 0,
			namespaces: {root: this}
		};

		comms.onMessage('canvas', async ({namespace, command, args, uuid}) => {
			if (this.data.Canvas === undefined)
				this.data.Canvas = document.getElementById('image-canvas');
			const space = this.data.namespaces[namespace];
			if (space)
				try {
					let data;
					if (command.startsWith('SET'))
						space[command.slice(3)] = args;
					else if (command.startsWith('GET'))
						data = await space[command.slice(3)];
					else
						switch(command) {
							case 'getContext':
								data = await space.getContextOverride(...args);
								break;
							case 'getBuffer':
								data = await space.toBufferOverride(...args);
								break;
							case 'drawImage':
								this.data.store.data.set('interactable', false);
								const backupUuid = uuid;
								uuid = '';
								const image = new Image();
								image.addEventListener('load', async () => {
									try {
										args = args.filter(arg => arg !== null && arg !== undefined);
										args[0] = image;
										data = await space.drawImage(...args);
										await comms.sendMessage('canvas', {type: 'resolve', uuid: backupUuid, data});
										await this.data.store.data.set('interactable', true);
									} catch(err) {
										await comms.sendMessage('canvas', {type: 'reject', uuid: backupUuid, data: err});
										await this.data.store.data.set('interactable', true);
									}
								});
								image.src = args[0];
								break;
							case 'getOrCreateCanvas':
								const innerSpace = this.data.namespaces[args[0]];
								if (innerSpace)
									data = args[0];
								else
									data = await this.createCanvas(args[1], args[2], args[0]);
								break;
							default:
								if (typeof args === 'object')
									data = await space[command].apply(space, args.filter(arg => arg !== null && arg !== undefined));
								else
									data = await space[command]();

								if (command === 'measureText')
									data = {width: data.width};
								break;
						}
					comms.sendMessage('canvas', {type: 'resolve', uuid, data});
				} catch(err) {
					comms.sendMessage('canvas', {type: 'reject', uuid, data: err});
				}
			else
				comms.sendMessage('canvas', {type: 'reject', uuid, data: {message: 'Namespace does not exist'}});
		});

		comms.sendMessage('canvas', {type: 'init'});
	}

	registerFont(data, css) {
		return new Promise(async (resolve, reject) => {
			try {
				const font = new FontFace(css.family, Uint8Array.from(atob(data), c => c.charCodeAt(0)));
				await font.load();
				document.fonts.add(font);
				resolve();
			} catch(err) {
				reject(err);
			}
		});
	}

	async createCanvas(width, height, uuid=undefined) {
		if (uuid === undefined)
			uuid = GenerateUuid.v4();

		this.data.Canvas.width = width;
		this.data.Canvas.height = height;

		const space = await this.data.Canvas;

		space.getContextOverride = contextId => {
			const uuid = GenerateUuid.v4();
			this.data.namespaces[uuid] = space.getContext(contextId);
			return uuid;
		};

		space.toBufferOverride = (type, quality) => {
			return {type: 'image/png', data: space.toDataURL('image/png')};
		};

		this.data.namespaces[uuid] = space;
		return uuid;
	}
};