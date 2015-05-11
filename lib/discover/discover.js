// DISCOVER
// --------

var debug = require('debug')('discover'),
    MDNS  = require('./mdns.js'),
    SSDP  = require('./ssdp.js');
require('../utils/unique.js');

// 

function discover(type, search, callback){
    type(search, callback);
}

module.exports = discover;
