const createWindow = require('./createwindow.js');
const ChildSpawn = require('./childspawn.js');
const IPC = require('./ipc.js');
const Communications = require('./communications.js');
const GenerateUuid = require('./generateuuid.js');

const { app, dialog, shell } = require('electron');

let window = null;
const reimager = new ChildSpawn('reimager');

let imageMap = new Map();

let uuidMap = new Map();
let savedMap = new Map();

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

		let oldThermo = uuidMap.get(data.uuid);
		oldThermo = oldThermo ? oldThermo : savedMap.get(data.uuid);

		oldThermo = JSON.parse(JSON.stringify(oldThermo));
		oldThermo.uuid = uuid;

		uuidMap.set(uuid, oldThermo);

		return {uuid};
	});

	comms.on('removeImage', async data => {
		savedMap.delete(data.imageUuid);
	});

	comms.on('writeImage', data => {
		return new Promise((resolve, reject) => {
			let image = uuidMap.get(data.imageUuid);
			image = image ? image : savedMap.get(data.imageUuid);
			try {
				dialog.showSaveDialog({
					defaultPath: image.name + '.tif',
					filters: [
						{
							name: 'Images',
							extensions: ['tif', 'jpg', 'png', 'webp']
						},
						{
							name: 'TIFF',
							extensions: ['tif']
						},
						{
							name: 'JPEG',
							extensions: ['jpg']
						},
						{
							name: 'PNG',
							extensions: ['png']
						},
						{
							name: 'WebP',
							extensions: ['webp']
						}

					]
				},
				async path => {
					if (path) {
						let extension = path.split('.').pop();
						extension = extension === 'tif' ? 'tiff' : (extension === 'jpg' ? 'jpeg' : extension);
						data.settings[extension] = {};
						data.settings.uri = path;

						resolve(await reimager.send('writeImage', {
							uri: image.entryFile,
							operations: createOperations(data.settings),
							settings: data.settings
						}));
					} else
						resolve();
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
			let image = uuidMap.get(data.imageUuid);
			image = image ? image : savedMap.get(data.imageUuid);

			data.settings.png = {};

			let [thermo] = await reimager.send('processImage', {
				uri: image.entryFile,
				operations: createOperations(data.settings),
				settings: data.settings
			});

			thermo.uuid = data.uuid;

			const imageKeys = Array.from(imageMap.keys()).reverse();
			while (imageMap.size >= 10)
				imageMap.delete(imageKeys.pop());

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

app.on('web-contents-created', (event, contents) => {
	contents.on('new-window', async (event, navigationUrl) => {
		// In this example, we'll ask the operating system
		// to open this event's url in the default browser.
		event.preventDefault();
		await shell.openExternal(navigationUrl)
	});

	contents.on('will-navigate', (event, navigationUrl) => {
		event.preventDefault();
	});
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