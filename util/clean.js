const fs = require('fs/promises');

const data = {
	distClean: {
		build: {
			all: true
		},
		dist: {
			all: true
		},
		bin: {
			all: true
		}
	},
	clean: {
		build: {
			dirs: ['lib', 'include', 'share', 'bin', 'etc']
		},
		bin: {
			files: []
		},
		dist: {
			all: true
		}
	}
};

async function clean(type = 'clean') {
	const dirs = (await fs.readdir('../')).map(e => {
		if (data.clean[e] !== undefined) {
			let dir = JSON.parse(JSON.stringify(data[type][e]));
			dir.name = e;
			return dir;
		}
		return undefined;
	}).filter(e => e !== undefined);

	let filePrefix = __dirname + '../';
	for (const dir of dirs)
		if (dir.all) {
			try {
				console.log(`Deleting ${filePrefix}${dir.name}/*`);
				await fs.rmdir(`${filePrefix}${dir.name}`, {recursive: true});
				await fs.mkdir(`${filePrefix}${dir.name}`);
			} catch(e) {
			}
		} else {
			if (dir.files)
				for (const fileName of dir.files)
					try {
						console.log(`Deleting ${filePrefix}${dir.name}/${fileName}`);
						await fs.unlink(`${filePrefix}${dir.name}/${fileName}`);
					} catch(e) {
					}

			if (dir.dirs)
				for (const dirName of dir.dirs)
					try {
						console.log(`Deleting ${filePrefix}${dir.name}/${dirName}`);
						await fs.rmdir(`${filePrefix}${dir.name}/${dirName}`, {recursive: true});
					} catch(e) {
					}
		}
}

async function init(amount = 'clean') {
	switch(amount.toLowerCase()) {
		case 'clean':
		case 'pre-compile':
		default:
			return await clean('clean');
		case 'distclean':
			return await clean('distClean');
	}
}

// Run the script
init(process.argv[2]);