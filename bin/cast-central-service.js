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

ipc.config.silent = true;
ipc.config.socketRoot = '/tmp/';
ipc.config.appspace = 'cast-central.core';

var timeouts = [];

cluster.on('fork', function(worker){
    debug('generated new worker', worker.id, 'set absolute timeout')
    timeouts[worker.id] = setTimeout(function(){
        debug('forcing long running process to quite');
        if(!worker.process.killed){
            timeouts[worker.id] = null;
            worker.kill();
        }
    }, 1000000);
});

cluster.on('exit', function(worker, code, signal){
    debug('clearing worker', worker.id, 'timeout hook since it exitted with code', code, 'and signal', signal);
    clearTimeout(timeouts[worker.id]);
});

if(cluster.isMaster){
    ipc.config.id = '-master';
    
    ipc.serve(function(){
        ipc.server.on('message', function(data, socket){
            if(data.action === 'new'){
                debug('creating new resource', data, socket);
                var child = cluster.fork([]);
                debug('spawned child id is', child);
                ipc.server.emit(socket, 'message', {'id': child.id});
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
                    workerExit();
                }else{
                    // All other actions require a specific cast
                    for(cast in casts){
                        if(casts[cast].name !== options.name){ continue; }
                        cast = casts[cast];

                        // Now Figure out what action to perform
                        switch(action){
                        case 'launch':
                            cast.launch(options.app, options.params, function(){
                                // app with params is complete
                                ipc.server.emit(socket, 'message', 'done');
                                workerExit();
                            });
                            break;
                        default:
                            ipc.server.emit(socket, 'message', 'invalid action');
                            workerExit();
                        }
                    }
                }
            });
        }); // on 'message'
    }); // serve

    ipc.server.start();
}

function workerExit(){
    debug('child-', cluster.worker.id, 'exiting');
    cluster.worker.kill();
}
