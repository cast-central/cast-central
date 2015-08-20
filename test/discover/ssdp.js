var ssdp = new require('node-ssdp').Server({
		'location': 'http://127.0.0.1:9000/info',
		'udn': 'tester'
	}),
	server = require('express')(),
	ssdp_discover = require('../../lib/discover/ssdp.js'),
	should = require("should");

describe('Discover', function(){
	before(function(){
		// Set up SSDP
		ssdp.addUSN('upnp:rootdevice');
		ssdp.addUSN('urn:schemas-upnp-org:device:MediaServer:1');
		ssdp.addUSN('urn:schemas-upnp-org:service:ContentDirectory:1');
		ssdp.addUSN('urn:schemas-upnp-org:service:ConnectionManager:1');
		ssdp.on('advertise-alive', function(headers){  });
		ssdp.on('advertise-bye', function(headers){  });
		ssdp.start();

		// Set up more information endpoint
		server.get('/info', function(req, res){
			res.send('9000');
		});
		server.listen();
	});

	describe('#ssdp()', function(){
		it('discovers an ssdp service', function(){
			ssdp_discover('tester', function(results){
				should.exist(results);
				results.should.be.a.Array();
				results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
				result[0].should.be.an.instanceOf(Object);
				results[0].should.have.property('address', '127.0.0.1');
				//results[0].should.have.property('port', 1234); TODO
				//results[0].should.have.property('name', ''); TODO
			});
		});
	});

	after(function(){
		ssdp.stop();
		server.stop();
	});
});
