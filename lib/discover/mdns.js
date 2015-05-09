// MDNS
// -----

var MDNS = require('mdns');
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
        results.push(service);
    });

    browser.start();

    setTimeout(function(){
        browser.stop();
        callback(results.unique());
    }, 2000);
}

module.exports = mdns;
