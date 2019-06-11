const GenerateUuid = require('../../backend/generateuuid');

module.exports = class {
	constructor(comms) {
		this.data = {
			comms,
			namespaces: {}
		};

		comms.onMessage('canvas', async ({namespace, command, args, uuid}) => {
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
							case 'getOrCreateCanvas':
								const innerSpace = this.data.namespaces[args[0]];
								if (innerSpace)
									data = args[0];
								else
									data = await this.createCanvas(args[1], args[2], args[0]);
								break;
							default:
								if (typeof args === 'object')
									data = await space[command].apply(space, args.filter(arg => arg !== undefined));
								else
									data = await space[command]();
						}
					comms.sendMessage('canvas', {type: 'resolve', uuid, data});
				} catch(err) {
					comms.sendMessage('canvas', {type: 'reject', uuid, data: err});
				}
			else
				comms.sendMessage('canvas', {type: 'reject', uuid, data: {message: 'Namespace does not exist'}});
		});
	}

	registerFont(uri, css) {
		return this.data.Canvas.registerFont(uri, css);
	}

	async createCanvas(width, height, uuid=undefined) {
		if (uuid === undefined)
			uuid = GenerateUuid.v4();
		const space = await this.data.Canvas.createCanvas(width, height);

		space.getContextOverride = contextId => {
			const uuid = GenerateUuid.v4();
			this.data.namespaces[uuid] = space.getContext(contextId);
			return uuid;
		};

		space.toBufferOverride = (type, quality) => {
			if (type === 'raw')
				return fixBGRA(space.toBuffer(type, quality));
			return space.toBuffer(type, quality);
		};

		this.data.namespaces[uuid] = space;
		return uuid;
	}
};