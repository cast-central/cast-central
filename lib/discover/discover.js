// DISCOVER
// --------

var debug      = require('debug')('discover'),
    MDNS       = require('./mdns.js'),
    SSDP       = require('./ssdp.js'),
    async      = require('async'),
    chromecast = require('../casts/chromecast.js'),
    Other      = require('../casts/roku.js');
require('../utils/unique.js');

// 

function discover(type, search, callback){
    type(search, function(casts){
    	var castObjs = [];

    	async.map(casts.unique(), function(cast, asyncCallback){
    		if(chromecast.is(cast)){
    			castObjs.push(new chromecast.chromecast(cast));
    		}else if(roku.is(cast)){
                castObjs.push(new roku.roku(cast));
            }

    		asyncCallback(null);
    	}, function(err){
    		callback(castObjs);
    	});
    });
}

module.exports = discover;
