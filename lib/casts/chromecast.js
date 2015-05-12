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

    this.connect    = function(appId, params, callback){
        var self = this;

        self.client.connect({host: self.location, port: self.port}, function(){
            self.connection.send({type: 'CONNECT'});
            setInterval(function(){
                self.heartbeat.send({type: 'PING'});
            }, 5000);

            self.receiver.send({type: 'LAUNCH', appId: appId, requestId: 1});

            callback();
        });
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
