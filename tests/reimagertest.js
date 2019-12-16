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
	uuid: generateUuid.v4(),
	data: {
		uri: 'C:\\Users\\EPMA_Castaing\\work\\thermo imaging\\2019-08-12_Nolen - Copy'
	}
});

outsideComm.send({
	type: 'getDir',
	uuid: generateUuid.v4(),
	data: {
		uri: 'C:\\Users\\EPMA_Castaing\\work\\thermo imaging\\shapes\\'
	}
});