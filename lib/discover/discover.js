// DISCOVER
// --------

var mdns = require('./mdns.js'),
	ssdp = require('./sspd.js');
require('../utils/unique.js');

// Uses the most commonly used service 
// discovery protocols and returns the 
// known castable devices found.  If 
// multiple devices are found to be the 
// same then the highest version one will 
// be returned.

function discover(type, callback){
	var casts = [];
	// ...
}

module.exports = discover;
