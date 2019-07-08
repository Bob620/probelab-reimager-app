const createWindow = require('./createwindow.js');
const ChildSpawn = require('./childspawn.js');
const IPC = require('./ipc.js');
const Communications = require('./communications.js');

const { app, dialog } = require('electron');

let window = null;
const reimager = new ChildSpawn('reimager');

let uuidMap = {};

app.on('ready', async () => {
	if (window === null)
		window = createWindow();

	const comms = new Communications(new IPC(window));

	reimager.on('dirUpdate', async () => {

	});

	comms.on('canvas', data => {
		reimager.send('canvas', data);
	});

	comms.on('saveImage', async data => {

	});

	comms.on('removeImage', async data => {

	});

	comms.on('writeImage', data => {
		return new Promise((resolve, reject) => {
			try {
				dialog.showSaveDialog({
						defaultPath: data.name + '.tif',
						filters: [
							{
								name: 'Images',
								extensions: ['jpg', 'png', 'tif']
							}
						]
					},
					async path => {
						let extension = path.split('.').pop();
						extension = extension === 'tif' ? 'tiff' : (extension === 'jpg' ? 'jpeg' : extension);

						resolve(await reimager.send('writeImage', {
							uri: '',
							operations: [
								{
									command: 'addScale',
									args: []
								},{
									command: 'addPoint',
									args: []
								}
							],
							settings: {
								[extension]: {},
								uri: path
							}
						}));
					}
				);
			} catch(err) {
				reject(err);
			}
		});
	});

	comms.on('loadImage', async data => {
		const image = uuidMap[data.uuid];

		let operations = [];

		operations.push({
			command: 'addLayer',
			args: [{name: 'base'}]
		});

		for (const point of data.points)
			operations.push({
				command: 'addPoint',
				args: [point.x, point.y, point.name]
			});

		operations.push({
			command: 'addScale',
			args: [data.scaleType]
		});

		data.settings.png = {};

		let [thermo] = await reimager.send('processImage', {
			uri: image.entryFile,
			operations,
			settings: data.settings
		});

		thermo.uuid = data.uuid;
		return thermo;
	});

	comms.on('processDirectory', async data => {
		let dirUri = data.dir.replace(/\\/gmi, '/');
		if (!dirUri.endsWith('/'))
			dirUri = dirUri + '/';

		const images = await reimager.send('getDir', {uri: dirUri});

		uuidMap = images.reduce((images, image) => {
			images[image.uuid] = image;
			return images;
		}, {});

		return {
			images
		};
	});
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin')
		app.quit();
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (window === null)
		window = createWindow();
});