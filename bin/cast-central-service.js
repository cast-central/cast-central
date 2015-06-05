// CAST-CENTRAL-SERVICE
// --------------------

var cluster     = require('cluster'),
    ipc         = require('node-ipc'),
    debug       = require('debug')('cast-central-service'),
    chromecast  = require('../lib/casts/chromecast.js'),
    castCentral = require('../index.js');

// The core service layer that directly 
// interfaces with cast devices.  
// Communication with this is only through 
// the IPC stack.

raw_workers = [];
workers = [];

ipc.config.silent = true;
ipc.config.socketRoot = '/tmp/';
ipc.config.appspace = 'cast-central.core';

if(cluster.isMaster){
    ipc.config.id = '-master';

    ipc.serve(function(){
        ipc.server.on('message', function(data, socket){
            switch(data.action){
            case 'new':
                debug('creating new resource', data, socket);
                var child = cluster.fork([]);
                raw_workers[child.id] = child;

                child.on('message', function(msg){
                    debug('master received message from worker', msg);
                    if(msg.alive){
                        workers[msg.id] = {
                            id: msg.id,
                            cast: msg.cast
                        };
                    }else{
                        workers[msg.id] = null;
                        raw_workers[msg.id] = null;
                    }
                });

                debug('spawned child id is', child.id);
                ipc.server.emit(socket, 'message', {'id': child.id});
                break;
            case 'delete':
                debug('deleting', data.id);
                workers[data.id] = null;
                raw_workers[data.id].kill();
                raw_workers[data.id] = null;
                ipc.server.emit(socket, 'message', 'done');
                break;
            case 'list':
                debug('listing all resources');
                ipc.server.emit(socket, 'message', workers);
                break;
            default:
                debug('unknown action:', data.action);
                ipc.server.emit(socket, 'message', 'unknown action');
            }
        });
    });

    debug('starting ipc server');
    ipc.server.start();
}else if(cluster.isWorker){
    debug('child-', cluster.worker.id, ' started');
    ipc.config.id = '-child-'+cluster.worker.id;

    ipc.serve(function(){
        ipc.server.on('message', function(data, socket){
            var action = data.action;
            var options = data.options;
            debug('child-', cluster.worker.id, ' processing ', action, '(', options, ')');

            // Always discover all available casting devices
            castCentral.discover(castCentral[options.protocol.toUpperCase()], options.search, function(casts){
                debug(casts);

                // Figure out what action to perform
                if(action === 'list'){
                    ipc.server.emit(socket, 'message', casts);
                    workerExit(cluster.worker);
                }else{
                    // All other actions require a specific cast
                    for(cast in casts){
                        if(casts[cast].name !== options.name){ continue; }
                        cast = casts[cast];

                        // Now Figure out what action to perform
                        switch(action){
                        case 'launch':
                            cast.launch(options.app, function(){
                                console.log(workers);
                                ipc.server.emit(socket, 'message', true);
                            });

                            process.send({
                                alive: true,
                                id: cluster.worker.id,
                                cast: cast.name
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
                }
            });
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
