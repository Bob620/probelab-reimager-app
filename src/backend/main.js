const createWindow = require('./createwindow.js');
const Child = require('./child');

const { app, ipcMain, dialog } = require('electron');
let window = null;

app.on('ready', async () => {
	if (window === null)
		window = createWindow();

	let thermos;
	const child = new Child();

	ipcMain.on('data', async ({sender}, {type, data}) => {
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
						data.uri = path;
						await child.sendMessage('writeImage', data);
						sender.send('debug', 'Image written');

						sender.send('data', {
							type: 'write',
							data: {name: data.name}
						});
					}
				);
				break;
			case 'loadImage':
				sender.send('debug', 'Removing old image');
				if (data.oldName && thermos[data.oldName])
					thermos[data.oldName].data.image = undefined;

				if (child.isWaitingOn('addScale')) {
					sender.send('debug', 'Respawning child');
					child.respawn();
				}

				sender.send('debug', 'Processing new image');

				try {
					const image = await child.sendMessage('addScale', data);

					sender.send('data', {
						type: 'loadedImage',
						data: {
							image,
							name: data.name
						}
					});
				} catch(err) {
					sender.send('debug', err);
				}
				break;
			case 'processDirectory':
				let dirUri = data.dir.replace(/\\/gmi, '/');
				if (!dirUri.endsWith('/'))
					dirUri = dirUri + '/';

				try {
					thermos = await child.sendMessage('processDirectory', {uri: dirUri});

					sender.send('debug', thermos);

					sender.send('data', {
						type: 'updateDirImages',
						data: {
							images: thermos ? thermos : {}
						}
					});
				} catch(err) {
					sender.send('debug', err);
				}
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