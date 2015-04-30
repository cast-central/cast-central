// MDNS
// -----

// MDNS, Multicast DNS is the used 
// service discovery protocol for 
// chromecast (googlecast) v2.  This 
// will search for all casting devices 
// on the network that also use mdns.

function mdns(){
	MDNS     = require('mdns');
	services = mdns.browseThemAll();
	results = null;
 
	this.search = function(cb){
       	results = [];

        services.on('serviceUp', function(service){
            results.push(service);
        });

        services.start();

        setTimeout(function(){
            services.stop();
            cb(results);
        }, 2000);
	};
}

module.exports = mdns;
