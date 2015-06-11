// CHROMECAST
// ----------

var debug = require('debug')('casts:chromecast');

// Main chromecast cast type object 
// allowing to interface with the 
// chromecast device.

function chromecast(headers){
    this.location  = headers.addresses[0];
    this.name      = headers.name;
    this.port      = headers.port;
    this.connected = false;
    this.client    = new (require('castv2-client')).Client();
    this.apps      = {
        DefaultMediaReceiver: require('castv2-client').DefaultMediaReceiver,
        Youtube: require('castv2-youtube').Youtube
    };
    this.player = null;

    // Launch a specific app with params, the callback 
    // is called when the action for the app is complete.
    this.launch = function(app, callback){
        this.client.connect({host: this.location, port: this.port}, (function(){
            this.connected = true;

            this.client.launch(this.apps[app], (function(err, player){
                this.player = player;
                callback();
            }).bind(this));
        }).bind(this));
    };

    this.load = function(media, params, cb){
        if(this.connected){
            debug('loading media on', this.name);
            this.player.load(media, params || { autoplay: true }, function(err, status){
                debug('media loaded playerState=%s', status.playerState);
                cb(err);
            });
        }else{ cb(false); }
    };

    this.setVolume = function(volume, cb){
        if(this.connected){
            debug('setting volume of', this.name, 'to', volume);
            this.client.setVolume({ level: volume }, cb);
        }else{ cb(false); }
    };

    this.setMute = function(mute, cb){
        if(this.connected){
            debug('setting mute of', this.name, 'to', mute);
            this.client.setVolume({ muted: mute}, cb);
        }else{ cb(false); }
    };

    this.seek = function(amount, cb){
        if(this.connected){
            debug('seeking', this.name, 'to', amount);
            this.player.seek(amount, cb);
        }else{ cb(false); }
    };

    this.stop = function(cb){
        if(this.connected){
            debug('stopping', this.name);
            this.player.stop(cb);
            this.connected = false;
        }else{ cb(false); }
    };

    this.toString = function(){
        return(
            "<chromecast:"+
                this.name+":"+
                this.location+":"+
                this.port+
            ">"
        );
    };

    debug('initialized new chromecast', this.location, this.name);
}

function is(headers){
    debug('detecting if cast is chromecast');

    // SSDP
    

    // MDNS
    return(true); // TODO
}

module.exports.chromecast = chromecast;
module.exports.is         = is;
