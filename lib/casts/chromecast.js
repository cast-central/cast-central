// CHROMECAST
// ----------

var debug = require('debug')('casts:chromecast');

// Main chromecast cast type object 
// allowing to interface with the 
// chromecast device.

function chromecast(headers){
    this.location = headers.addresses[0];
    this.name     = headers.name;
    this.client   = new require('castv2').Client();
    this.connect  = function(actions, params, callback){
        this.client.connect(this.location, function(){
            var connection = this.client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
            var hearbeat   = this.client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
            var receiver   = this.client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

            connection.send({type: 'CONNECT'});
            setInterval(function(){
                heartbeat.send({type: 'PING'});
            }, 5000);

            // TODO: Do the action and send params if needed.
            receiver.send({ type: 'LAUNCH', appId: 'YouTube', requestId: 1 });

            callback();
        });
    };

    this.toString = function(){
        return(
            "<chromecast:"+
                this.name+":"+
                this.location+
            ">"
        );
    };

    debug('initialized new chromecast', this.location, this.name);
}

function is(headers){
    debug('detecting is cast is chromecast');
    return(true);
}

module.exports.chromecast = chromecast;
module.exports.is         = is;
