const fs = require('fs');

const ChildSpawn = require('../src/backend/childspawn.js');
const reimager = new ChildSpawn('reimager');

reimager.on('dirUpdate', ({type, filename, uri}) => {
	console.log(type + '     ' + filename);
	console.log(uri);
	console.log();
});

reimager.on('ready', async () => {
	console.log(await reimager.send('getDir', {
		uri: '../../thermo-reimager/tests/data/'
	}));

	try {
		for (const file of fs.readdirSync('./test'))
			fs.unlinkSync('./test/'+file);
		fs.rmdirSync('./test');
	} catch(err) {}
	fs.mkdirSync('./test');
	fs.writeFileSync('./test/test.txt', '1');

	console.log(await reimager.send('watchDir', {
		uri: './test'
	}));

	setTimeout(() => {
		fs.writeFileSync('./test/test.txt', '1');
		fs.writeFileSync('./test/test.www', '1');

		setTimeout(async () => {
			fs.unlinkSync('./test/test.txt');

			console.log(await reimager.send('unwatchDir', {
				uri: './test'
			}));

			try {
				for (const file of fs.readdirSync('./test'))
					fs.unlinkSync('./test/' + file);
				fs.rmdirSync('./test');
			} catch (err) {
			}

			console.log(await reimager.send('processImage', {
				uri: '../../thermo-reimager/tests/data/1024(1).PS.EDS/1024(1).p_s',
				operations: [{
					command: 'addScale',
					args: []
				},{
					command: 'addPoint',
					args: [100, 100, 'test']
				}],
				settings: {
					png: {}
				}
			}));

			process.exit(0);
		}, 10);
	}, 10);
});
