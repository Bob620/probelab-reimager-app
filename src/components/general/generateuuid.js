const crypto = require('crypto');

// https://stackoverflow.com/a/26915856/4254650
//function parseV1() {
//	const int_time = this.get_time_int( uuid_str ) - 122192928000000000,
//		    int_millisec = Math.floor( int_time / 10000 );
//	return new Date( int_millisec );
//}

module.exports = {
	v4: () => {
		// https://gist.github.com/jed/982883
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
	}
};