const createWindow = require('./createwindow.js');
const ReimagerChild = require('./reimagerchild');
const Communications = require('./communications');

const { app, dialog } = require('electron');

let window = null;
const comms = new Communications();
const child = new ReimagerChild();

app.on('ready', async () => {
	if (window === null)
		window = createWindow();

	comms.onMessage('saveImage', data =>
		child.sendMessage('save', data)
	);

	comms.onMessage('removeImage', async data => {
		child.sendMessage('remove', data);
	});

	comms.onMessage('writeImage', data => {
		return new Promise((resolve, reject) => {
			try {
				dialog.showSaveDialog({
						defaultPath: data.name + '.tif',
						filters: [
							{name: 'Images', extensions: ['jpg', 'png', 'tif']}
						]
					},
					async path => {
						data.uri = path;
						await child.sendMessage('writeImage', data);

						resolve({uuid: data.uuid});
					}
				);
			} catch(err) {
				reject(err);
			}
		});
	});

	comms.onMessage('loadImage', async data => {
		if (child.isWaitingOn('addScale'))
			child.respawn();

		return {
			image: await child.sendMessage('addScale', data),
			uuid: data.uuid
		};
	});

	comms.onMessage('processDirectory', async data => {
		let dirUri = data.dir.replace(/\\/gmi, '/');
		if (!dirUri.endsWith('/'))
			dirUri = dirUri + '/';

		return { images: await child.sendMessage('processDirectory', {uri: dirUri}) };
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