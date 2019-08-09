const crypto = require('crypto');
//const uuidv1 = require('uuid/v1');

// https://stackoverflow.com/a/26915856/4254650
//function parseV1() {
//	const int_time = this.get_time_int( uuid_str ) - 122192928000000000,
//		    int_millisec = Math.floor( int_time / 10000 );
//	return new Date( int_millisec );
//}

const generateUuids = {
	//toLexical: uuid => {
	//	return uuid.substr(14, 5) + uuid.substr(9, 5) + uuid.substr(0, 9) + uuid.substr(19);
	//},
	//toRegular: ulid => {
	//	return ulid.substr(10, 9) + ulid.substr(5, 5) + ulid.substr(0, 5) + ulid.substr(19);
	//},
	//v1Lexical: (options) => {
	//	return generateUuids.toLexical(generateUuids.v1(options));
	//},
	//v1: uuidv1,
	v4: () => {
		// https://gist.github.com/jed/982883
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
	}
};

module.exports = generateUuids;