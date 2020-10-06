const fs = require('fs');

class Log {
	constructor() {
		this.data = {
			history: []
		};
	}

	createDomain(domain) {
		return {
			createDomain: this.createDomain.bind(this),
			info: this.info.bind(this, domain),
			warn: this.warn.bind(this, domain),
			error: this.error.bind(this, domain),
			serialize: this.serialize.bind(this),
			export: this.export.bind(this)
		}
	}

	info(domain, message) {
		this.data.history.push(`${domain} | ${message}`);
	}

	warn(domain, err) {
		this.data.history.push(`${domain} | ${err.code}  -  ${err.message}`);
		if (err.stack)
			this.data.history.push(err.stack);
	}

	error(domain, err = new Error()) {
		this.data.history.push(`${domain} | ${err.code}  -  ${err.message}`);
		if (err.stack)
			this.data.history.push(err.stack);
	}

	serialize() {
		return this.data.history.join('\n');
	}

	export() {
		fs.writeFileSync('./output.log', this.serialize());
	}
}

module.exports = Log;