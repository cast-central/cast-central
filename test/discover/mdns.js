var mdns = require('mdns'),
	mdns_discover = require('../../lib/discover/mdns.js'),
	should = require("should"),
	os = require("os");

describe('Discover', function(){
	describe('#mdns()', function(){
		var ad;

		before(function(){
			ad = mdns.createAdvertisement(
				mdns.tcp('tester'),
				1234,
				{
					name: 'tester',
					//interfaceIndex: 'docker0'
				}
			);
			ad.start();
		});

		it('discovers an mdns service', function(done){
			this.timeout(5000);

			mdns_discover('tester', function(results){
				should.exist(results);
				results.should.be.a.Array();
				results.should.be.an.instanceOf(Array).and.have.lengthOf(1);
				results[0].should.be.an.instanceOf(Object);
				//results[0].should.have.property('address', '172.17.42.1');
				results[0].should.have.property('port', 1234);
				results[0].should.have.property('name', 'tester');

				done();
			});
		});

		after(function(){
			ad.stop();
		});
	});
});
