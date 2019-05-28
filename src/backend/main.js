const fs = require('fs');

const createWindow = require('./createwindow.js');

const ThermoReimager = require('thermo-reimager');
const { app, ipcMain, dialog } = require('electron');
let window = null;

app.on('ready', async () => {
	if (window === null)
		window = createWindow();

	let images;
	const Pointshoot = await ThermoReimager.PointShoot;

	ipcMain.on('data', async ({sender}, {type, data}) => {
		let image;
		sender.send('debug', type);
		sender.send('debug', data);
		switch(type) {
			case 'echo':
				sender.send('debug', data.message);
				break;
			case 'writeImage':
				sender.send('debug', 'Starting image write...');
				dialog.showSaveDialog({
						defaultPath: data.name + '.tif',
						filters: [
							{name: 'Images', extensions: ['jpg', 'png', 'tif']}
						]
					},
					async (path) => {
					image = images[data.name];
					if (image.data.image) {
						await image.writeImage({uri: path});
						sender.send('debug', 'Image written to file');
					} else {
						sender.send('debug', 'Processing new image');

						image = images[data.name];
						await image.addScaleAndWrite(data.scaleType, {
							scaleSize: data.scaleSize ? data.scaleSize : 0,
							scaleColor: data.scaleColor ? data.scaleColor : ThermoReimager.constants.scale.colors.AUTO,
							belowColor: data.belowColor ? data.belowColor : ThermoReimager.constants.scale.colors.AUTO,
							uri: path
						});

						sender.send('debug', 'Scale made and Image written to file');
					}
				});
				break;
			case 'loadImage':
				sender.send('debug', 'Removing old image');
				if (data.oldName && images[data.oldName])
					images[data.oldName].data.image = undefined;

				sender.send('debug', 'Processing new image');

				image = images[data.name];
				await image.addScale(data.scaleType, {
					scaleSize: data.scaleSize ? data.scaleSize : 0,
					scaleColor: data.scaleColor ? data.scaleColor : ThermoReimager.constants.scale.colors.AUTO,
					belowColor: data.belowColor ? data.belowColor : ThermoReimager.constants.scale.colors.AUTO
				});

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