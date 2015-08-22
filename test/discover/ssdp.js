var ssdp = new (require('node-ssdp')).Server({
		'location': 'http://127.0.0.1:9000/info',
		'udn': 'tester'
	}),
	server = require('express')(),
	ssdp_discover = require('../../lib/discover/ssdp.js'),
	should = require("should");

describe('Discover', function(){
	before(function(){
		ssdp.start();

		// Set up more information endpoint
		server.get('/info', function(req, res){
			res.send("<root>"+
                            "<URLBase>"+
                                "http://127.0.0.1:1234"+
                            "</URLBase>"+
                            "<device>"+
                                "<friendlyName>"+
                                    "tester"+
                                "</friendlyName>"+
                            "</device>"+
                        "</root>");
		});

		server.listen(9000, '127.0.0.1');
	});

	describe('#ssdp()', function(){
		it('discovers a ssdp service', function(done){
                        this.timeout(5000);

			ssdp_discover('tester', function(results){
				should.exist(results);
				results.should.be.a.Array();
				results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
				results[0].should.be.an.instanceOf(Object);
				results[0].should.have.property('address', '127.0.0.1');
				results[0].should.have.property('port', 1234);
				results[0].should.have.property('name', 'tester');

				done();
			});
		});
	});

	after(function(){
		ssdp.stop();
	});
});

