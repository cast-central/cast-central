// MDNS
// ----

var debug = require('debug')('cast-central-service:discover:mdns'),
    MDNS = require('mdns');
require('../utils/unique.js');

// MDNS, Multicast DNS is the used 
// service discovery protocol for 
// chromecast (googlecast) v2.  This 
// will search for all casting devices 
// on the network that also use mdns.

function mdns(search, callback){
	var browser = MDNS.createBrowser(
            MDNS.tcp(search), {
                'resolverSequence': [
                    MDNS.rst.DNSServiceResolve(),
                    MDNS.rst.getaddrinfo({'families': [4]})
                ]
            }
        );
	var results = [];

    browser.on('serviceUp', function(service){
        results.push({
            address: service.addresses[0],
            name: service.name,
            port: service.port
        });
    });

    debug('starting mdns search for', search);
    browser.start();

    setTimeout(function(){
        debug('stopping mdns search', search, 'with results', results);
        browser.stop();
        callback(results.unique());
    }, 2000);
}

module.exports = mdns;
