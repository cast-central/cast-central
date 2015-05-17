// CHROMECAST
// ----------

var debug = require('debug')('casts:chromecast');

// Main chromecast cast type object 
// allowing to interface with the 
// chromecast device.

function chromecast(headers){
    this.location   = headers.addresses[0];
    this.name       = headers.name;
    this.port       = headers.port;
    this.client     = new (require('castv2')).Client();
    this.connection = this.client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
    this.heartbeat  = this.client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
    this.receiver   = this.client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');
    this.requestNum = 0;

    // Launch a specific appId with params, the callback 
    // is called when the action for the app is complete.
    this.launch     = function(appId, params, callback){
        var self = this;

        self.client.connect({host: self.location, port: self.port}, function(){
            self.receiver.on('message', function(data, broadcast) {
                debug(data);
            });

            self.connection.send({type: 'CONNECT'});
            setInterval(function(){
                self.heartbeat.send({type: 'PING'});
            }, 5000);

            self.receiver.send({type: 'LAUNCH', appId: appId, v: "ngElkyQ6Rhs", requestId: self.requestId()});

            //self.receiver.send({type: 'CLOSE'});
            callback();
        });
    };

    this.setVolume = function(volume){
        this.receiver.send({
            "type": "SET_VOLUME",
            "volume": { 
                level: volume
            }
        });
    };

    this.setMute = function(mute){
        this.receiver.send({
            "type": "SET_VOLUME",
            "volume": {
                muted: mute
            }
        });
    };

    this.requestId = function(){
        return this.requestNum++;
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
    return(true);
}

module.exports.chromecast = chromecast;
module.exports.is         = is;
