// CHROMECAST
// ----------

var debug  = require('debug')('cast-central-service:casts:chromecast:v1'),
    async  = require('async'),
    merge  = require('merge'),
    MDNS   = require('../discover/mdns.js'),
    SSDP   = require('../discover/ssdp.js'),
    client = require('castv2-client').Client;

// Main chromecast cast type object 
// allowing to interface with the 
// chromecast device.

var apps = {
    DEFAULTMEDIARECEIVER: require('castv2-client').DefaultMediaReceiver,
    YOUTUBE: require('castv2-youtube').Youtube
};
var clients = {};
var players = {};
var request_handlers = {
    // Looks for all the available chromecasts in the network 
    // and returns an object of the information required to 
    // be able to interface with it.
    // 
    // Chromecasts (all the newest versions at least) require 
    // the use of mDNS (Multicast DNS) for discovering the 
    // turned on chromecasts on the network.  SSDP (Simple 
    // Service Discovery Protocol) is another way (older versions).
    'list': { 'params': { 'protocol': false, 'search': false },
        'handle': function(params, cb){
            var chromecasts = [];

            var protocol_param = params.protocol || 'MDNS';
            var protocol = (protocol_param.toUpperCase() === 'MDNS')? MDNS: SSDP;
            var search = params.search || (protocol_param.toUpperCase() === 'MDNS')? 'googlecast': 'urn:dial-multiscreen-org:device:dial:1';

            debug('using protocol', params.protocol, 'with search', search);

            // Assumes the search only finds chromecasts
            protocol(search, function(chromecasts){ cb({'chromecast': chromecasts}); });
        }
    },

    // Given the address, port and name for the chromecast 
    // will connect and set up a seesion with it.
    'connect': {
        'params': { 'name': true, 'address': true, 'port': true },
        'handle': function(params, cb){
            var name = params.name;
            var address = params.address;
            var port = params.port;

            if(!defined(clients[name])){
                clients[name] = new client();
                clients[name].connect({host: address, port: port}, cb);
            }else{
                cb(null, 'already connected to this chromecast');
            }
        }
    },

    // Given the app name, assuming its already been connected 
    // request the current state of the cast and return.
    'status': {
        'params': { 'name': true },
        'handle': function(params, cb){
            var name = params.name;

            if(defined(clients[name])){
                clients[name].getStatus(function(err, status){
                    if(err){
                        cb(null, 'unable to retreive cast status, error: '+err);
                    }else{
                        cb({'status': status});
                    }
                });
            }else{
                cb(null, 'connect to cast first');
            }
        }
    },

    // Given the cast name and app name for the chromecast, 
    // launch will start the chromecast app given.
    'launch': {
        'params': { 'name': true, 'app': true },
        'handle': function(params, cb){
            var name = params.name;
            var app = params.app;

            if(defined(clients[name])){
                if(!defined(players[name])){
                    clients[name].launch(apps[app.toUpperCase()], function(err, player){
                        players[name] = player;
                        cb();
                    });
                }else{
                    cb(null, 'chromecast is already in use, use stop first');
                }
            }else{
                cb(null, 'first connect to this chromecast');
            }
        }
    },

    // Assuming an application has been launched on the chromecast 
    // this will try to load the media required for it and start it.
    'load': { 'params': { 'name': true, 'app': true, 'params': false },
        'handle': function(params, cb){
            var name = params.name;
            var media = params.media;
            params = params.params;

            if(defined(players[name])){
                debug('loading media on', name);
                players[name].load(media, params || { autoplay: true }, function(err, status){
                    debug('media loaded playerState=%s', status.playerState);
                    cb(status, err);
                });
            }else{
                cb(null, 'launch the app first');
            }
        }
    },

    // Given the name of a chromecast set the volume 
    // on it.
    'setVolume': { 'params': { 'name': true, 'value': true },
        'handle': function(params, cb){
            var name = params.name;
            var volume = params.value;

            if(defined(clients[name])){
                debug('setting volume of', name, 'to', volume);
                clients[name].setVolume({ level: volume }, cb);
            }else{
                cb(null, 'launch the app first');
            }
        }
    },

    // Given the name of a chromecast set the volume 
    // mute on or off.
    'setMute': { 'params': { 'name': true, 'value': true },
        'handle': function(params, cb){
            var name = params.name;
            var mute = params.value;

            if(defined(clients[name])){
                debug('setting mute of', name, 'to', mute);
                clients[name].setVolume({ muted: mute}, cb);
            }else{
                cb(null, 'launch the app first');
            }
        }
    },

    // Given a name of a chromecast will seek the launched/loaded 
    // media to a specific spot.
    'seek': { 'params': { 'name': true, 'value': true },
        'handle': function(params, cb){
            var name = params.name;
            var seek = params.value;

            if(defined(players[name])){
                debug('seeking', name, 'to', amount);
                players[name].seek(amount, cb);
            }else{
                cb(null, 'launch the app first');
            }
        }
    },

    // Given a name of a chromecast stop the loaded media.
    'stop': { 'params': { 'name': true },
        'handle': function(params, cb){
            var name = params.name;

            if(defined(players[name])){
                debug('stopping', name);

                players[name].stop();
                delete players[name];

                cb();
            }else{
                cb(null, 'launch an app first');
            }
        }
    },

    // Given a name of a chromecast disconnect the 
    // client from it.
    'disconnect': { 'params': { 'name': true },
        'handle': function(params, cb){
            var name = params.name;

            if(!defined(players[name])){
                debug('disconnecting', name);

                clients[name].close();
                delete clients[name];

                cb();
            }else{
                cb(null, 'stop the app first');
            }
        }
    }
};

// Handles all requests validates the query 
// parameters given and calls the approprate 
// function for the action.
function handle_request(req, res){
    var action = req.params.action,
        error_message = validate_params(action, req.query);

    if(defined(error_message)){
        res.json(json_error(error_message));
    }else{
        request_handlers[action].handle(req.query, function(response, error){
            if(defined(error)){
                res.json(json_error(error));
            }else{
                res.json(json_success(response));
            }
        });
    }
}

// Checks each variable given and if one is not 
// defined then returns an error message of which 
// one is incorrect.
function validate_params(action, query_params){
    var action_params = request_handlers[action].params;

    for(var param in action_params){
        if(action_params[param] && !defined(query_params[param])){
            return('missing required parameter: '+param);
        }
    }

    return(null);
}

// Returns if a particular variable is 
// defined or null.
function defined(variable){
    return(
        typeof variable !== 'undefined' && 
        variable !== null
    );
}

// Given an error message, will normalize and 
// return a json structure for ending the 
// request transmission.
function json_success(object){
    return(merge({ 'success': true }, object));
}

// Given an error message, will normalize and 
// return a json structure for ending the 
// request transmission.
function json_error(message){
    return({ 'success': false, 'message': message });
}

module.exports = {
    'handle_request': handle_request
};
