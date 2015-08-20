var mdns = require('mdns'),
	mdns_discover = require('../../lib/discover/mdns.js'),
	should = require("should");

describe('Discover', function(){
	before(function(){
		var ad = mdns.createAdvertisement(mdns.tcp('tester'), 1234);
		ad.start();
	});

	describe('#mdns()', function(done){
		it('discovers an mdns service', function(){
			mdns_discover('tester', function(results){
				should.exist(results);
				results.should.be.a.Array();
				results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
				result[0].should.be.an.instanceOf(Object);
				results[0].should.have.property('address', '127.0.0.1');
				results[0].should.have.property('port', 1234);
				results[0].should.have.property('name', '');

				done();
			});
		});
	});
});
