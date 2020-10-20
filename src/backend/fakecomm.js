module.exports = class FakeComm {
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