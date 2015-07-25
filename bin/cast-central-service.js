#! /usr/bin/env nodejs

// CAST-CENTRAL-SERVICE
// --------------------

var app         = require('express')(),
    logger      = require('../lib/utils/logger.js'),
    errors       = require('../lib/utils/errors.js'),
    debug       = require('debug')('cast-central-service'),
    chromecast  = require('../lib/casts/chromecast.js'),
    roku        = require('../lib/casts/roku.js'),
    other       = require('../lib/casts/other.js');
    //castCentral = require('../index.js');

// The core service layer that directly 
// interfaces with cast devices.  
// Communication with this is made through 
// restful calls.
//
// RESTFul endpoints:
//   /<version>/<cast type>/list
//   /<version>/<cast type>/launch
//   /<version>/<cast type>/load
//   /<version>/<cast type>/stop
//   /<version>/<cast type>/seek
//   /<version>/<cast type>/mute
//   /<version>/<cast type>/volume

// First route will log everything
app.all('*', logger);

// Overrides the error handler
app.use(errors.error_500);

// Chromecast
app.get('/v1/chromecast/launch', chromecast.launch);
app.get('/v1/chromecast/load', chromecast.load);
app.get('/v1/chromecast/setVolume', chromecast.setVolume);
app.get('/v1/chromecast/setMute', chromecast.setMute);
app.get('/v1/chromecast/seek', chromecast.seek);
app.get('/v1/chromecast/stop', chromecast.stop);

// Roku
// TODO

// Other
// TODO

// Last route will handle if the route has 
// not been found
app.all('*', errors.error_404);

// Start the service
app.listen(process.argv[2] || '8000');

/*
raw_workers = {};
workers = {};

ipc.config.silent = true;
ipc.config.socketRoot = '/tmp/';
ipc.config.appspace = 'cast-central.core';

if(cluster.isMaster){
    
}else if(cluster.isWorker){
    debug('child-', cluster.worker.id, ' started');
    ipc.config.id = '-child-'+cluster.worker.id;
    var cast = null;

    ipc.serve(function(){
        ipc.server.on('message', function(data, socket){
            var action = data.action;
            var options = data.options;
            debug('child-', cluster.worker.id, 'processing', action, '(', options, ')');

            if(cast === null){
                castCentral.discover(castCentral[options.protocol.toUpperCase()], options.search, function(casts){
                    debug(casts);
                    if(action === 'list'){
                        ipc.server.emit(socket, 'message', casts);
                        return;
                    }else{
                        // All other actions require a specific cast
                        for(c in casts){
                            if(casts[c].name !== options.name){ continue; }
                            cast = casts[c];

                            process.send({
                                alive: true,
                                id: cluster.worker.id,
                                cast: cast.name
                            });

                            break;
                        }

                        processAction(cast, action, options, socket);
                    }
                });
            }else{
                processAction(cast, action, options, socket);
            }
        }); // on 'message'
    }); // serve

    ipc.server.start();
}

function workerExit(worker){
    debug('child-', worker.id, 'exiting');
    process.send({
        alive: false,
        id: worker.id
    });
    worker.kill();
}

function jsonWorkers(workers){
    var jsons = [];

    for(worker in workers){
        jsons.push(workers[worker].id);
    }

    return jsons;
}

function processAction(cast, action, options, socket){
    // Figure out what action to perform
    switch(action){
    case 'launch':
        cast.launch(options.app, function(){
            ipc.server.emit(socket, 'message', true);
        });
        break;
    case 'load':
        cast.load(options.media, null, function(err){
            ipc.server.emit(socket, 'message', err || true);
        });
        break;
    case 'stop':
        cast.stop(function(){
            ipc.server.emit(socket, 'message', true);
            workerExit(cluster.worker);
        });
        break;
    case 'seek':
        cast.seek(options.amount, function(){
            ipc.server.emit(socket, 'message', true);
        });
        break;
    case 'mute':
        cast.setMute(options.mute, function(){
            ipc.server.emit(socket, 'message', true);
        });
        break;
    case 'volume':
        cast.setVolume(options.volume, function(){
            ipc.server.emit(socket, 'message', true);
        });
        break;
    default:
        ipc.server.emit(socket, 'message', 'invalid action');
    }
}
*/
