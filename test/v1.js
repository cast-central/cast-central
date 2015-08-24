var chromecast = require('../lib/v1/chromecast.js'),
	should = require('should'),
	sinon = require('sinon');

describe('V1', function(){
	// Chromecast
	describe('Chromecast', function(){
		it('#list()');
		it('#connect()');
		it('#status()');
		it('#launch()');
		it('#load()');
		it('#setVolume()');
		it('#setMute()');
		it('#seek()');
		it('#stop()');
		it('#disconnect()');
	});
});
