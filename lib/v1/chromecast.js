// CHROMECAST
// ----------

var debug  = require('debug')('cast-central-service:casts:chromecast:v1'),
    async  = require('async'),
    MDNS   = require('../discover/mdns.js'),
    SSDP   = require('../discover/ssdp.js');
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

// Looks for all the available chromecasts in the network 
// and returns an object of the information required to 
// be able to interface with it.
// 
// Chromecasts (all the newest versions at least) require 
// the use of mDNS (Multicast DNS) for discovering the 
// turned on chromecasts on the network.  SSDP (Simple 
// Service Discovery Protocol) is another way (older versions).
// 
// Params:
//   - protocol (MDNS or SSDP)
//   - search ('googlecast' or 'urn:dial-multiscreen-org:device:dial:1')
// 
// Response:
//   {'chromecasts': [
//       {
//          'name': <name>,
//          'url': <url>,
//          'port': <port>
//       }, ... 
//   ]}
function list(req, res){
    var chromecasts = [];

    var protocol_param = req.query.protocol || 'MDNS';
    var protocol = (protocol_param.toUpperCase() === 'MDNS')? MDNS: SSDP;
    var search = req.query.search || (protocol_param.toUpperCase() === 'MDNS')? 'googlecast': 'urn:dial-multiscreen-org:device:dial:1';

    debug('using protocol', req.query.protocol, 'with search', search);

    // Assumes the search only finds chromecasts
    protocol(search, function(chromecasts){
        debug(chromecasts);
        res.json({'success': true, 'chromecasts': chromecasts});
    });
}

// Given the app name, assuming its already been connected 
// request the current state of the cast and return.
// 
// Params:
//   - name
// 
// Response:
//   {
//       'success': <boolean>,
//       'message': '<message why false>',
//       'status': {}
//   }
function status(req, res){
    var name = req.query.name;

    is_defined({'name': name}, res);

    if(typeof clients[name] !== 'undefined'){
        clients[name].getStatus(function(err, status){
            if(err){
                res.json({'success': false, 'message': 'unable to retreive cast status'});
            }else{
                res.json({'success': true, 'status': status});
            }
        })
    }else{
        res.json({'success': false, 'message': 'connect to cast first'});
    }
}

// Given the address, port and name for the chromecast 
// will connect and set up a seesion with it.
// 
// Params:
//   - name
//   - address
//   - port
// 
// Response:
//   {
//       'success': <boolean>,
//       'message': '<message why false>'
//   }
function connect(req, res){
    var name = req.query.name;
    var address = req.query.address;
    var port = req.query.port;

    is_defined({'name': name, 'address': address, 'port': port}, res);

    if(typeof clients[name] === 'undefined'){
        clients[name] = new client();

        clients[name].connect({host: address, port: port}, function(){
            res.json({'success': true});
        });
    }else{
        res.json({'success': false, 'message': 'already connected to this chromecast'});
    }
}

// Given the cast name and app name for the chromecast, 
// launch will start the chromecast app given.
// 
// Params:
//   - name
//   - app (DefaultMediaReceiver or YouTube)
// 
// Response:
//   {
//      'success': <boolean>,
//      'message': '<message why false>'
//   }
function launch(req, res){
    var name = req.query.name;
    var app = req.query.app;

    is_defined({'name': name, 'app': app}, res);

    if(typeof clients[name] !== 'undefined'){
        if(typeof players[name] === 'undefined'){
            clients[name].launch(apps[app.toUpperCase()], function(err, player){
                players[name] = player;
                res.json({'success': true});
            });
        }else{
            re.json({'success': false, 'message': 'chromecast is already in use, use stop first'});
        }
    }else{
        res.json({'success': false, 'message': 'first connect to this chromecast'});
    }
}

// Assuming an application has been launched on the chromecast 
// this will try to load the media required for it and start it.
// 
// Params:
//   - name
//   - media (App dependent)
//   - params (App dependent)
// 
// Response:
//   {
//      'success': <boolean>,
//      'message': '<message why false>'
//   }
function load(req, res){
    var name = req.query.name;
    var media = req.query.media;
    var params = req.query.params;

    is_defined({'name': name, 'media': media}, res);

    if(typeof players[name] !== 'undefined'){
        debug('loading media on', name);
        players[name].load(media, params || { autoplay: true }, function(err, status){
            debug('media loaded playerState=%s', status.playerState);
            res.json({'success': true});
        });
    }else{
        res.json({'success': false, 'message': 'launch the app first'});
    }
}

// Given the name of a chromecast set the volume 
// on it.
// 
// Params:
//   - name
//   - value
// 
// Response:
//   {
//     'success': <boolean>,
//     'message': '<message why false>'
//   }
function setVolume(req, res){
    var name = req.query.name;
    var volume = req.query.value;

    is_defined({'name': name, 'volume': volume}, res);

    if(typeof clients[name] !== 'undefined'){
        debug('setting volume of', name, 'to', volume);
        clients[name].setVolume({ level: volume }, function(){
            res.json({'success': true});
        });
    }else{
        res.json({'success': false, 'message': 'launch the app first'});
    }
}

// Given the name of a chromecast set the volume 
// mute on or off.
// 
// Params:
//   - name
//   - value (Boolean)
// 
//  Response:
//  {
//    'success': <boolean>,
//    'message': '<message why false>'
//  }
function setMute(req, res){
    var name = req.query.name;
    var mute = req.query.value;

    is_defined({'name': name, 'mute': mute}, res);

    if(typeof clients[name] !== 'undefined'){
        debug('setting mute of', name, 'to', mute);
        clients[name].setVolume({ muted: mute}, function(){
            res.json({'success': true});
        });
    }else{
        res.json({'success': false, 'message': 'launch the app first'});
    }
}

// Given a name of a chromecast will seek the launched/loaded 
// media to a specific spot.
// 
// Params:
//   - name
//   - value
// 
// Response:
//   {
//     'success': <boolean>,
//     'message': '<message of why false>'
//   }
function seek(req, res){
    var name = req.query.name;
    var seek = req.query.value;

    is_defined({'name': name, 'seek': seek}, res);

    if(typeof players[name] !== 'undefined'){
        debug('seeking', name, 'to', amount);
        players[name].seek(amount, function(){
            res.json({'success': true});
        });
    }else{
        res.json({'success': false, 'message': 'launch the app first'});
    }
}

// Given a name of a chromecast stop will disconnect from 
// it and stop what ever media is loaded.
// 
// Params:
//   - name
// 
// Response:
//   {
//     'success': <boolean>,
//     'message': '<message why false>'
//   }
function stop(req, res){
    var name = req.query.name;

    is_defined({'name': name}, res);

    if(typeof players[name] !== 'undefined'){
        debug('stopping', name);
        clients[name].close();

        delete players[name];
        delete clients[name];

        res.json({'success': true});
    }else{
        res.json({'success': false, 'message': 'launch the app first'});
    }
}

// Checks each variable given and if one is not 
// defined then returns the rest response using 
// the res object given.
function is_defined(variables, res){
    for(var variable in variables){
        if(typeof variables[variable] === 'undefined' || variables[variable] === null){
            res.json({'success': false, 'message': 'missing required parameter: ' + variable});
        }
    }
}

module.exports = {
    'list': list,
    'launch': launch,
    'load': load,
    'setVolume': setVolume,
    'setMute': setMute,
    'seek': seek,
    'stop': stop,
    'status': status,
    'connect': connect
};
