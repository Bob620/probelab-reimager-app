const fs = require('fs');

const createWindow = require('./createwindow.js');

const ThermoReimager = require('thermo-reimager');
const { app, ipcMain, dialog } = require('electron');
let window = null;

app.on('ready', async () => {
	if (window === null)
		window = createWindow();

	let thermos;
	const Pointshoot = await ThermoReimager.PointShoot;
	const ExtractedMap = await ThermoReimager.ExtractedMap;

	ipcMain.on('data', async ({sender}, {type, data}) => {
		let thermo;
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
						thermo = thermos[data.name];
					if (thermo.data.image) {
						await thermo.writeImage({uri: path});
						sender.send('debug', 'Image written to file');
					} else {
						sender.send('debug', 'Processing new image');

						thermo = thermos[data.name];
						await thermo.addScaleAndWrite(data.scaleType, {
							scaleSize: data.scaleSize ? data.scaleSize : 0,
							scaleColor: data.scaleColor ? data.scaleColor : ThermoReimager.constants.scale.colors.AUTO,
							belowColor: data.belowColor ? data.belowColor : ThermoReimager.constants.scale.colors.AUTO,
							scaleBarHeight: data.scaleBarHeight ? data.scaleBarHeight : ThermoReimager.constants.scale.AUTOSIZE,
							uri: path
						});

						sender.send('debug', 'Scale made and Image written to file');
					}
				});
				break;
			case 'loadImage':
				sender.send('debug', 'Removing old image');
				if (data.oldName && thermos[data.oldName])
					thermos[data.oldName].data.image = undefined;

				sender.send('debug', 'Processing new image');

				thermo = thermos[data.name];
				await thermo.addScale(data.scaleType, {
					scaleSize: data.scaleSize ? data.scaleSize : 0,
					scaleColor: data.scaleColor ? data.scaleColor : ThermoReimager.constants.scale.colors.AUTO,
					belowColor: data.belowColor ? data.belowColor : ThermoReimager.constants.scale.colors.AUTO,
					scaleBarHeight: data.scaleBarHeight ? data.scaleBarHeight : ThermoReimager.constants.scale.AUTOSIZE
				});

				sender.send('data', {
					type: 'loadedImage',
					data: {
						image: await thermo.data.image.getBase64Async('image/png'),
						name: thermo.data.name
					}
				});
				break;
			case 'processDirectory':
				let dirUri = data.dir.replace(/\\/gmi, '/');
				if (!dirUri.endsWith('/'))
					dirUri = dirUri + '/';

				const directory = fs.readdirSync(dirUri, {withFileTypes: true});

				thermos = directory.flatMap(dir => {
					if (dir.isDirectory()) {
						const files = fs.readdirSync(dirUri + dir.name, {withFileTypes: true});
						return files.filter(file => file.isFile()).map(file => {
							file.uri = dirUri + dir.name + '/' + file.name;
							if (file.name.endsWith(ThermoReimager.constants.pointShoot.fileFormats.ENTRY))
								return new Pointshoot(file);

							if (file.name.endsWith(ThermoReimager.constants.extractedMap.fileFormats.ENTRY))
								return new ExtractedMap(file);
						}).filter(item => item);
					}
				}).filter(i => i).reduce((items, item) => {
					items[item.data.name] = item;
					return items;
				}, {});

				sender.send('data', {
					type: 'updateDirImages',
					data: {
						images: thermos
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