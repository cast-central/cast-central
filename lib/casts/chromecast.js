// CHROMECAST
// ----------

var debug = require('debug')('casts:chromecast');

// Main chromecast cast type object 
// allowing to interface with the 
// chromecast device.

function chromecast(headers){
    this.location = headers.addresses[0];
    this.name     = headers.name;
    this.port     = headers.port;
    this.client   = new (require('castv2-client')).Client();
    this.apps     = {
        DefaultMediaReceiver: require('castv2-client').DefaultMediaReceiver,
        Youtube: require('castv2-youtube').Youtube
    };
    this.player = null;

    // Launch a specific app with params, the callback 
    // is called when the action for the app is complete.
    this.launch = function(app, callback){
        var self = this;

        self.client.connect({host: self.location, port: self.port}, function(){
            self.client.launch(self.apps[app], function(err, player){
                self.setPlayer(player);
                callback();

                self.player.on('status', function(status){
                    debug('status broadcast playerState=%s', status.playerState);
                });
            });
        });
    };

    this.load = function(media, params, cb){
        debug('loading media on', this.name);
        this.player.load(media, params || { autoplay: true }, function(err, status){
            debug('media loaded playerState=%s', status.playerState);
            cb(err);
        });
    };

    this.setVolume = function(volume, cb){
        debug('setting volume of', this.name, 'to', volume);
        this.client.setVolume({ level: volume }, cb);
    };

    this.setMute = function(mute, cb){
        debug('setting mute of', this.name, 'to', mute);
        this.client.setVolume({ muted: mute}, cb);
    };

    this.seek = function(amount, cb){
        debug('seeking', this.name, 'to', amount);
        this.player.seek(amount, cb);
    };

    this.stop = function(cb){
        debug('stopping', this.name);
        this.player.stop(cb);
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

    this.setPlayer = function(player){
        this.player = player;
    };

    debug('initialized new chromecast', this.location, this.name);
}

function is(headers){
    debug('detecting if cast is chromecast');
    return(true);
}

module.exports.chromecast = chromecast;
module.exports.is         = is;
