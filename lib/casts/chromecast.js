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
    this.player   = null;

    // Launch a specific app with params, the callback 
    // is called when the action for the app is complete.
    this.launch   = function(app, params, callback){
        var self = this;

        self.client.connect({host: self.location, port: self.port}, function(){
            client.launch(require('castv2-client')[app], function(err, player){
                var media = {
                    // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                    contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
                    contentType: 'video/mp4',
                    streamType: 'BUFFERED', // or LIVE

                    // Title and cover displayed while buffering
                    metadata: {
                        type: 0,
                        metadataType: 0,
                        title: "Big Buck Bunny", 
                        images: [
                            { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                        ]
                    }        
                };

                player.on('status', function(status){
                    console.log('status broadcast playerState=%s', status.playerState);
                });

                player.load(media, { autoplay: true }, function(err, status){
                    console.log('media loaded playerState=%s', status.playerState);

                    // Seek to 2 minutes after 15 seconds playing.
                    setTimeout(function(){
                        player.seek(2*60, function(err, status){
                            callback();
                        });
                    }, 15000);
                });
            });
        });
    };

    this.setVolume = function(volume){
        // TODO
    };

    this.setMute = function(mute){
        // TODO
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
