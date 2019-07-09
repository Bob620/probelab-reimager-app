const createWindow = require('./createwindow.js');
const ChildSpawn = require('./childspawn.js');
const IPC = require('./ipc.js');
const Communications = require('./communications.js');
const GenerateUuid = require('./generateuuid.js');

const { app, dialog } = require('electron');

let window = null;
const reimager = new ChildSpawn('reimager');

let uuidMap = new Map();
let imageMap = new Map();

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
		const uuid = GenerateUuid.v4();

		const oldThermo = uuidMap.get(data.uuid);
		oldThermo.uuid = uuid;

		uuidMap.set(uuid, oldThermo);

		return {uuid};
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
					data.settings[extension] =  {};

					const image = uuidMap.get(data.imageUuid);

					resolve(await reimager.send('writeImage', {
						uri: image.entryFile,
						operations: createOperations(data.settings),
						settings: data.settings
					}));
				});
			} catch(err) {
				reject(err);
			}
		});
	});

	comms.on('loadImage', async data => {
		const imageKey = createSettingKey(data);
		const testThermo = imageMap.get(imageKey);

		if (!testThermo) {
			const image = uuidMap.get(data.imageUuid);
			data.settings.png = {};

			let [thermo] = await reimager.send('processImage', {
				uri: image.entryFile,
				operations: createOperations(data.settings),
				settings: data.settings
			});

			thermo.uuid = data.uuid;

			imageMap.set(imageKey, thermo);

			return thermo;
		}

		testThermo.imageUuid = testThermo.uuid;
		testThermo.uuid = data.uuid;
		return testThermo;
	});

	comms.on('processDirectory', async data => {
		let dirUri = data.dir.replace(/\\/gmi, '/');
		if (!dirUri.endsWith('/'))
			dirUri = dirUri + '/';

		const thermos = await reimager.send('getDir', {uri: dirUri});

		for (const thermo of thermos) {
			thermo.imageUuid = thermo.uuid;
			uuidMap.set(thermo.uuid, thermo);
		}

		return {
			thermos
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

function createOperations(settings) {
	let operations = [];

	for (const layer of settings.activeLayers)
		operations.push({
			command: 'addLayer',
			args: [layer]
		});

	for (const point of settings.activePoints)
		operations.push({
			command: 'addPoint',
			args: [point.x, point.y, point.name]
		});

	operations.push({
		command: 'addScale',
		args: [settings.scalePosition]
	});

	return operations;
}

function createSettingKey(settings) {
	settings = JSON.parse(JSON.stringify(settings));
	delete settings.uuid;
	return JSON.stringify(settings);
}