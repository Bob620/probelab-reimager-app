const Log = require('./log.js').Log;
const log = new Log();
const logs = {
	main: 			log.createDomain('    main   '),
	update: 		log.createDomain('   update  '),
	window: 		log.createDomain('   window  '),
	updateDir: 		log.createDomain(' updateDir '),
	dirUpdate: 		log.createDomain(' dirUpdate '),
	saveImage: 		log.createDomain(' saveImage '),
	writeImage: 	log.createDomain(' writeImage'),
	loadImage: 		log.createDomain(' loadImage '),
	processDir: 	log.createDomain(' processDir'),
	comms: 			log.createDomain('   wComms  '),
	reimagerComms: 	log.createDomain('   cComms  '),
	riChild: 		log.createDomain('  riChild  ')
};

logs.main.info('Loading Node modules...');
const fs = require('fs');
const path = require('path');

logs.main.info('Loading internal modules...');
const createWindow = require('./createwindow.js');
const ChildSpawn = require('./childspawn.js');
const IPC = require('./ipc.js');
const Communications = require('./communications.js');
const GenerateUuid = require('./generateuuid.js');
const {
	checkAndNotifyUpdate,
	exportImage,
	createOperations,
	createSettingKey
} = require('./util.js');

const [version] = require('../../package.json').version.split('-');
const constants = require('../../constants.json');

const {app, dialog, shell} = require('electron');

logs.main.info('All modules loaded');
logs.main.info(`Running version ${version} on ${process.getSystemVersion()} ${process.arch}`);

logs.main.info('Spawning children...');
const reimager = new ChildSpawn('reimager', {
	commsLog: logs.reimagerComms,
	internalLog: logs.riChild,
	childDomain: '  reimager ',
	childComm:   '  ccComms  '
});
const relayerer = new ChildSpawn('relayerer');
logs.main.info('Children spawned');

const comms = new Communications(undefined, logs.comms);

let activeDir = '';
let imageMap = new Map();

let uuidMap = new Map();
let entryMap = new Map();
let savedMap = new Map();

let window = null;
//app.setAppUserModelId(process.execPath);

app.on('ready', async () => {
	logs.main.info('App ready');
	if (window === null)
		window = createWindow(logs.window);

	// Emitted when the window is closed.
	window.on('closed', function () {
		logs.window.info(`Window closed`);
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		window = null
	});

	window.on('ready-to-show', checkAndNotifyUpdate.bind(undefined, logs, comms));

	logs.main.info('Setting up IPC connection to window...');
	comms.setMessageChannel(new IPC(window));
	logs.main.info('IPC connection to window initialized');

	let recentlyUpdated = new Map();

	setInterval(checkAndNotifyUpdate.bind(undefined, logs, comms), 86400000);

	setInterval(() => {
		if (recentlyUpdated.size > 0) {
			logs.updateDir.info('Updated files found, updating index...');
			Array.from(recentlyUpdated.keys()).map(async uri => {
				try {
					recentlyUpdated.delete(uri);
					const thermo = (await reimager.send('getImages', {uri: uri + '/'}))[0];
					let uuids = [];

					for (const [uuid, therm] of uuidMap)
						if (therm.entryFile === thermo.entryFile)
							uuids.push(uuid);

					await comms.send('updateDirectory', {
						images: uuids.map(uuid => {
							const temp = JSON.parse(JSON.stringify(thermo));
							temp.uuid = uuid;
							temp.imageUuid = uuid;
							uuidMap.set(uuid, temp);
							return temp;
						})
					});
				} catch (err) {
					logs.updateDir.error(err);
				}
			});
			logs.updateDir.info('Updated files');
		}
	}, 1000);

	reimager.on('dirUpdate', async ({filename, uri}) => {
		logs.dirUpdate.info('Processing dir for new layers...');
		try {
			if (filename.endsWith('.tif')) {
				const [dirName, type, element, line] = filename.split('_');

				if (element && element !== 'Grey' && element !== 'RefGrey' && !element.startsWith('Spec') && line && line.length === 1)
					await relayerer.send('relayer', {
						output: `${uri}${dirName}.MAP.EDS/${dirName} ${type} ${element}_${line}.layer`,
						input: uri + filename
					});
				logs.dirUpdate.info('New layers added');
			} else if (!recentlyUpdated.has(uri + filename))
				recentlyUpdated.set(uri + filename, true);
		} catch (err) {
			logs.dirUpdate.error(err);
		}
		logs.dirUpdate.info('No actions taken yet');
	});

	comms.on('exportLog', async () => {
		const path = await dialog.showSaveDialog({
			defaultPath: 'output.log'
		});

		if (!path.canceled) {
			log.info('Hi', 'o/');
			log.export(path.filePath);
		}
	});

	comms.on('canvas', data => {
		reimager.send('canvas', data);
	});

	comms.on('saveImage', async data => {
		logs.saveImage.info('Saving image to uuid map');
		const uuid = GenerateUuid.v4();

		let oldThermo = uuidMap.get(data.uuid);
		oldThermo = oldThermo ? oldThermo : savedMap.get(data.uuid);

		oldThermo = JSON.parse(JSON.stringify(oldThermo));
		oldThermo.uuid = uuid;

		uuidMap.set(uuid, oldThermo);

		logs.saveImage.info('Image saved');
		return {uuid};
	});

	comms.on('removeImage', async data => {
		savedMap.delete(data.imageUuid);
		logs.saveImage.info('Image deleted from uuid map');
	});

	comms.on('writeImages', ({images, settings}) => {
		logs.writeImage.info('Writing images');
		return writeImages(images, settings, '{name}.png');
	});

	comms.on('writeImage', async ({imageUuid, settings}) => {
		logs.writeImage.info('Writing image');
		let image = uuidMap.get(imageUuid);
		image = image ? image : savedMap.get(imageUuid);

		return writeImages([image], settings, image.name + '.png');
	});

	comms.on('loadImage', async data => {
		logs.loadImage.info('Loading image...');
		window.setProgressBar(2);

		logs.loadImage.info('Looking for cached image...');
		const imageKey = createSettingKey(data);
		const testThermo = imageMap.get(imageKey);

		if (!testThermo) {
			logs.loadImage.info('Cached not found, generating image...');
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

			window.setProgressBar(-1);
			logs.loadImage.info('Image cached and loaded');
			return thermo;
		}

		testThermo.imageUuid = testThermo.uuid;
		testThermo.uuid = data.uuid;

		window.setProgressBar(-1);
		logs.loadImage.info('Image loaded from cache');
		return testThermo;
	});

	comms.on('processDirectory', async data => {
		logs.processDir.info('Processing directory...');
		window.setProgressBar(2);

		logs.processDir.info('Sanitizing directory uri...');
		let dirUri = path.resolve(data.dir) + path.sep;

		logs.processDir.info(`'${data.dir}'  ->  '${dirUri}'`);
		logs.processDir.info('Reading directory...');
		try {
			const files = fs.readdirSync(dirUri, {withFileTypes: true});
			const dirNames = files.filter(file => file.isDirectory()).reduce((dirs, file) => {
				dirs[file.name] = fs.readdirSync(`${dirUri}${file.name}`, {withFileTypes: true}).map(file => file.name);
				return dirs;
			}, {});

			logs.processDir.info('Looking for thermo layers...');
			for (const file of files)
				if (file.isFile() && file.name.endsWith('.tif')) {
					const [dirName, type, element, line] = file.name.split('_');

					if (element && element !== 'Grey' && element !== 'RefGrey' && !element.startsWith('Spec') && line && line.length === 1)
						if (dirNames[`${dirName}.MAP.EDS`] && !dirNames[`${dirName}.MAP.EDS`].includes(`${dirName} ${type} ${element}_${line}.layer`))
							await relayerer.send('relayer', {
								output: `${dirUri}${dirName}.MAP.EDS/${dirName} ${type} ${element}_${line}.layer`,
								input: dirUri + file.name
							});
				}
			logs.processDir.info('Thermo layers classified');
		} catch (err) {
			logs.processDir.error(err);
			return {
				error: err.code
			};
		}

		try {
			logs.processDir.info('Unwatching previous directory');
			reimager.send('unwatch', {uri: activeDir});
		} catch(err) {
			logs.processDir.error(err);
		}
		activeDir = dirUri;

		logs.processDir.info('Getting new directory...');
		const thermos = await reimager.send('getDir', {uri: dirUri});

		logs.processDir.info('Sanitizing thermos...');
		for (const thermo of thermos) {
			let uuid = entryMap.get(thermo.entryFile);
			uuid = uuid ? uuid : thermo.uuid;
			thermo.uuid = uuid;
			thermo.imageUuid = uuid;
			entryMap.set(thermo.entryFile, uuid);
			uuidMap.set(uuid, thermo);
		}

		try {
			logs.processDir.info('Watching directory for future updates');
			reimager.send('watchDir', {uri: dirUri});
		} catch(err) {
			logs.processDir.error(err);
		}

		window.setProgressBar(-1);
		logs.processDir.info('Directory processed');
		return {
			thermos
		};
	});
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	logs.window.info('Closing window');
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin')
		app.quit();
});

app.on('activate', () => {
	logs.window.info('Reactivating window');
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (window === null)
		window = createWindow(logs.window);

	// Emitted when the window is closed.
	window.on('closed', function () {
		logs.window.info(`Window closed`);
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		window = null
	});
});

app.on('web-contents-created', (event, contents) => {
	contents.on('new-window', async (event, navigationUrl) => {
		logs.window.info('Opening link in default browser');

		event.preventDefault();
		shell.openExternal(navigationUrl)
	});

	contents.on('will-navigate', (event, navigationUrl) => {
		logs.window.info('Negating window navigation');
		event.preventDefault();
	});
});

function writeImages(images, settings, defaultName) {
	return new Promise(async (resolve, reject) => {
		window.setProgressBar(2);

		try {
			const path = await dialog.showSaveDialog({
				defaultPath: defaultName,
				filters: constants.export.FILTERS
			});

			if (!path.canceled) {
				logs.writeImage.info('Exporting images...');
				const exports = exportImage(images, settings, path.filePath, reimager, {uuidMap, savedMap});

				exports.on('update', ({finished, total}) => {
					window.setProgressBar(finished / total);
					comms.send('exportUpdate', {exported: finished, total, type: 'all'});
				});

				exports.on('finish', total => {
					window.setProgressBar(-1);
					logs.writeImage.info('Image written');
					resolve();
				});
			} else {
				window.setProgressBar(-1);
				logs.writeImage.info('Writing canceled by user');
				resolve();
			}
		} catch (err) {
			window.setProgressBar(-1);
			logs.writeImage.error(err);
			reject(err);
		}
	});
}