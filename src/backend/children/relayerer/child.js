const sharp = require('sharp');

const Communications = require('../../communications.js');

class Child {
	constructor(comms=process) {
		this.data = {
			comms: new Communications(comms),
		};

		this.data.comms.on('canvas', this.canvas.bind(this));
		this.data.comms.on('relayer', this.relayer.bind(this));

		this.data.comms.send('ready');
	}

	async canvas({command, data}) {

	}

	async relayer({input, output}) {
		if (input && output) {
			await (sharp(input).greyscale().toColourspace('b-w').tiff({
				quality: 100,
				compression: 'lzw'
			}).toFile(output));
		} else
			throw {message: 'Provide an input and output'};
	}
}

if (require.main === module)
	module.exports = new Child();
else
	module.exports = Child.bind(undefined);