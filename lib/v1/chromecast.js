// CHROMECAST
// ----------

var debug = require('debug')('cast-central-service:casts:chromecast:v1');

// Main chromecast cast type object 
// allowing to interface with the 
// chromecast device.

var location  = headers.addresses[0];
var name      = headers.name;
var port      = headers.port;
var connected = false;
var client    = new (require('castv2-client')).Client();
var apps      = {
    DefaultMediaReceiver: require('castv2-client').DefaultMediaReceiver,
    Youtube: require('castv2-youtube').Youtube
};
var player = null;

// Launch a specific app with params, the callback 
// is called when the action for the app is complete.
function launch(req, res){
    /*client.connect({host: location, port: port}, (function(){
        connected = true;

        client.launch(apps[app], (function(err, player){
            player = player;
            callback();
        }).bind();
    }).bind();*/

    res.send('TODO');
}

function load(req, res){
    /*if(connected){
        debug('loading media on', name);
        player.load(media, params || { autoplay: true }, function(err, status){
            debug('media loaded playerState=%s', status.playerState);
            cb(err);
        });
    }else{ cb(false); }*/

    res.send('TODO');
}

function setVolume(req, res){
    /*if(connected){
        debug('setting volume of', name, 'to', volume);
        client.setVolume({ level: volume }, cb);
    }else{ cb(false); }*/

    res.send('TODO');
}

function setMute(req, res){
    /*if(connected){
        debug('setting mute of', name, 'to', mute);
        client.setVolume({ muted: mute}, cb);
    }else{ cb(false); }*/

    res.send('TODO');
}

function seek(req, res){
    /*if(connected){
        debug('seeking', name, 'to', amount);
        player.seek(amount, cb);
    }else{ cb(false); }*/

    res.send('TODO');
}

function stop(req, res){
    /*if(connected){
        debug('stopping', name);
        player.stop(cb);
        connected = false;
    }else{ cb(false); }*/

    res.send('TODO');
}

module.exports = {
    'launch': launch,
    'load': load,
    'setVolume': setVolume,
    'setMute': setMute,
    'seek': seek,
    'stop': stop
};
