const fs = require('fs');

const createWindow = require('./createwindow.js');

const ThermoReimager = require('thermo-reimager');
const { app, ipcMain } = require('electron');
let window = null;

app.on('ready', async () => {
	if (window === null)
		window = createWindow();

	let images;
	const Pointshoot = await ThermoReimager.PointShoot;

	ipcMain.on('data', async ({sender}, {type, data}) => {
		sender.send('debug', type);
		sender.send('debug', data);
		switch(type) {
			case 'echo':
				sender.send('debug', data.message);
				break;
			case 'loadImage':
				if (data.oldName)
					images[data.oldName].data.image = undefined;

				sender.send('debug', 'screw me1');

				const image = images[data.name];
				await image.addScale(data.scaleType);

				sender.send('debug', 'screw me');

				sender.send('data', {
					type: 'loadedImage',
					data: {
						image: await image.data.image.getBase64Async('image/png'),
						name: image.data.name
					}
				});
				break;
			case 'processDirectory':
				let dirUri = data.dir.replace(/\\/gmi, '/');
				if (!dirUri.endsWith('/'))
					dirUri = dirUri + '/';

				const directory = fs.readdirSync(dirUri, {withFileTypes: true});

				images = directory.flatMap(dir => {
					if (dir.isDirectory()) {
						const files = fs.readdirSync(dirUri + dir.name, {withFileTypes: true});
						return files.filter(file => file.isFile() && file.name.endsWith(ThermoReimager.constants.pointShoot.fileFormats.ENTRY)).map(entryFile => {
							entryFile.uri = dirUri + dir.name + '/' + entryFile.name;
							return new Pointshoot(entryFile);
						});
					}
				}).filter(i => i).reduce((images, ps) => {
					images[ps.data.name] = ps;
					return images;
				}, {});

				sender.send('data', {
					type: 'updateDirImages',
					data: {
						images
					}
				});
				break;
		}
	});
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (window === null)
		window = createWindow();
});