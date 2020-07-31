const fs = require('fs');

const generateUuid = require('../src/backend/generateuuid');
const Reimager = require('../src/backend/children/reimager/child.js');

class FakeComm {
	constructor() {
		this.data = {
			one: {
				listeners: new Map()
			},
			two: {
				listeners: new Map()
			}
		}
	}

	get endOne() {
		return {
			send: this.send.bind(this, 'two'),
			on: this.on.bind(this, 'one')
		}
	}

	get endTwo() {
		return {
			send: this.send.bind(this, 'one'),
			on: this.on.bind(this, 'two')
		}
	}

	send(end, message) {
		const listeners = this.data[end].listeners.get('message');
		if (listeners)
			for (const listener of listeners)
				listener(message);
	}

	on(end, event, listener) {
		if (typeof listener === 'function') {
			const listeners = this.data[end].listeners.get(event);
			if (listeners)
				listeners.push(listener);
			else
				this.data[end].listeners.set(event, [listener]);
		}
	}
}

const fakeComm = new FakeComm();

const outsideComm = fakeComm.endTwo;

outsideComm.on('message', ({type, data, uuid}) => {
	console.log(type + '    ' + uuid);
	console.log(data);
	console.log();
});

const reimager = new Reimager(fakeComm.endOne);

outsideComm.send({
	type: 'getDir',
	uuid: 'get',
	data: {
		uri: '../../thermo-reimager/test/data/'
	}
});

try {
	for (const file of fs.readdirSync('./test'))
		fs.unlinkSync('./test/'+file);
	fs.rmdirSync('./test');
} catch(err) {}
fs.mkdirSync('./test');
fs.writeFileSync('./test/test.txt', '1');

outsideComm.send({
	type: 'watchDir',
	uuid: 'watch',
	data: {
		uri: './test'
	}
});

setTimeout(() => {
	fs.writeFileSync('./test/test.txt', '1');
	fs.writeFileSync('./test/test.www', '1');

	setTimeout(() => {
		fs.unlinkSync('./test/test.txt');

		outsideComm.send({
			type: 'unwatchDir',
			uuid: 'unwatch',
			data: {
				uri: './test'
			}
		});

		try {
			for (const file of fs.readdirSync('./test'))
				fs.unlinkSync('./test/' + file);
			fs.rmdirSync('./test');
		} catch (err) {
		}

		outsideComm.send({
			type: 'writeImage',
			uuid: 'write',
			data: {
				uri: '../../thermo-reimager/test/data/1024.PS.EDS/1024.p_s',
				operations: [{
					command: 'addLayer',
					args: [{name: 'base'}]
				},{
					command: 'addPoint',
					args: [100, 100, 'test']
				},{
					command: 'addScale',
					args: [5]
				}],
				settings: {
					uri: 'C:\\Users\\EPMA_Castaing\\Downloads\\SPMM323(2).jpeg',
					activeLayers: [{
						name: 'base'
					}],
					activePoints: [],
					autoBackgroundOpacity: false,
					autoHeight: false,
					autoPixelSizeConstant: true,
					autoPointFontSize: false,
					autoScale: true,
					backgroundOpacity: 70,
					belowColor: 'white',
					pixelSizeConstant: 0,
					pointColor: 'orange',
					pointFontSize: 100,
					pointType: 'round',
					scaleBarHeight: 100,
					scaleBarPosition: 'above',
					scaleColor: 'white',
					scalePosition: 'bc',
					scaleSize: 0
				}
			}
		});

		setTimeout(() => {
			process.exit(1);
		}, 5000);
	}, 10);
}, 10);
