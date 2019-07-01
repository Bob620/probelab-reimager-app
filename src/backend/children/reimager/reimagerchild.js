const fs = require('fs');

const { PointShoot, ExtractedMap, CanvasRoot, constants, NodeCanvas } = require('thermo-reimager');

const Communications = require('../communications.js');
const generateUUID = require('../../generateuuid.js');
const canvas = new CanvasRoot(new NodeCanvas(require('canvas')));

module.exports = class {
	constructor() {
		this.data = {
			comms: new Communications()
		};

		this.data.comms.on('canvas', ({command, data}) => {

		});

		this.data.comms.on('watchDir', ({uri}) => {

		});

		this.data.comms.on('unwatchDir', ({uri}) => {

		});

		this.data.comms.on('processDir', ({uri}) => {

		});

		this.data.comms.on('processImage', ({uuid, settings}) => {

		});

		this.data.comms.on('writeImage', ({uuid, settings}) => {

		});

		this.data.comms.send('ready');
	}
};
