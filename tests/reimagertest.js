const fs = require('fs');

const generateUuid = require('../src/backend/generateuuid');
const Reimager = require('../src/backend/children/reimager/child.js');
const FakeComm = require('../src/backend/fakecomm.js');

const fakeComm = new FakeComm();

const outsideComm = fakeComm.endTwo;
const expectedUuid = generateUuid.v4();

outsideComm.on('message', ({type, data, uuid}) => {
	console.log(type + '    ' + uuid);
	console.log(data);
	console.log();

	if (uuid === expectedUuid && type === 'resolve') {
		outsideComm.send({
			type: 'processImage',
			uuid: generateUuid.v4(),
			data: {
				"uri": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10).csi",
				"operations": [
					{
						"command": "addLayer",
						"args": [
							{
								"element": "base",
								"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10).siref",
								"name": "base",
								"opacity": 0.5,
								"uuid": "62749fa5-e841-4b45-aea8-db7eb6da6d82"
							}
						]
					},
					{
						"command": "addLayer",
						"args": [
							{
								"color": {
									"B": 0,
									"G": 255,
									"R": 255,
									"RGBA": "rgba(255, 255, 0, 1)",
									"name": "yellow",
									"opacity": 1
								},
								"element": "si spec02",
								"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10) Spec02 Si.simcs",
								"name": "si spec02",
								"opacity": 0.5,
								"uuid": "f579a39f-8d30-4d67-a54e-861df269c616"
							}
						]
					},
					{
						"command": "addScale",
						"args": [
							"lc"
						]
					}
				],
				"settings": {
					"activeLayers": [
						{
							"element": "base",
							"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10).siref",
							"name": "base",
							"opacity": 0.5,
							"uuid": "62749fa5-e841-4b45-aea8-db7eb6da6d82"
						},
						{
							"color": {
								"B": 0,
								"G": 255,
								"R": 255,
								"RGBA": "rgba(255, 255, 0, 1)",
								"name": "yellow",
								"opacity": 1
							},
							"element": "si spec02",
							"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10) Spec02 Si.simcs",
							"name": "si spec02",
							"opacity": 0.5,
							"uuid": "f579a39f-8d30-4d67-a54e-861df269c616"
						}
					],
					"activePoints": [],
					"autoBackgroundOpacity": true,
					"autoHeight": true,
					"autoPixelSizeConstant": true,
					"autoPointFontSize": true,
					"autoScale": true,
					"backgroundOpacity": 0,
					"belowColor": "auto",
					"layerColors": {
						"si spec02": {
							"B": 0,
							"G": 255,
							"R": 255,
							"RGBA": "rgba(255, 255, 0, 1)",
							"name": "yellow",
							"opacity": 1
						}
					},
					"layerOpacity": 0.5,
					"layerOrder": [
						"si spec02",
						"k spec03",
						"c spec04",
						"al spec01",
						"base",
						"solid"
					],
					"layers": [
						{
							"element": "si spec02",
							"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10) Spec02 Si.simcs",
							"name": "si spec02",
							"uuid": "f579a39f-8d30-4d67-a54e-861df269c616"
						},
						{
							"element": "k spec03",
							"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10) Spec03 K.simcs",
							"name": "k spec03",
							"uuid": "b7bc16f6-b76b-4df9-beda-e920b97c0a4d"
						},
						{
							"element": "c spec04",
							"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10) Spec04 C.simcs",
							"name": "c spec04",
							"uuid": "a1347484-379c-4f92-ad64-b517ce6a0ee5"
						},
						{
							"element": "al spec01",
							"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10) Spec01 Al.simcs",
							"name": "al spec01",
							"uuid": "a709cd9a-2a2f-45e2-8fde-e63363078b26"
						},
						{
							"element": "base",
							"file": "C:/Users/EPMA_Castaing/work/thermo imaging/2018-01-15_ToyEDS/Toy(10).MAP.EDS/Toy(10).siref",
							"name": "base",
							"uuid": "62749fa5-e841-4b45-aea8-db7eb6da6d82"
						},
						{
							"element": "solid",
							"file": "",
							"name": "solid",
							"uuid": "fa5a56d2-f541-40ac-9609-7e45a70e7c5c"
						}
					],
					"pixelSizeConstant": "116.73",
					"pointColor": "red",
					"pointFontSize": 0,
					"pointType": "thermo",
					"scaleBarHeight": 0,
					"scaleBarPosition": "above",
					"scaleColor": "auto",
					"scalePosition": "lc",
					"scaleSize": 0,
					"selectAllPoints": false,
					"png": {}
				}
			}
		});
	}
});

const reimager = new Reimager(fakeComm.endOne);

outsideComm.send({
	type: 'getDir',
	uuid: expectedUuid,
	data: {
		uri: 'C:\\Users\\EPMA_Castaing\\work\\thermo imaging\\2018-01-15_ToyEDS'
	}
});

/*
outsideComm.send({
	type: 'getDir',
	expectedUuid: generateUuid.v4(),
	data: {
		uri: 'C:\\Users\\EPMA_Castaing\\work\\thermo imaging\\shapes\\'
	}
});
*/