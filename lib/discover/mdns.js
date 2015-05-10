// MDNS
// ----

var debug = require('debug')('mdns'),
    MDNS = require('mdns');
require('../utils/unique.js');

// MDNS, Multicast DNS is the used 
// service discovery protocol for 
// chromecast (googlecast) v2.  This 
// will search for all casting devices 
// on the network that also use mdns.

function mdns(search, callback){
	var browser = MDNS.createBrowser(MDNS.tcp(search));
	var results = [];

    browser.on('serviceUp', function(service){
        debug('serviceUp', service);
        results.push(service);
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
