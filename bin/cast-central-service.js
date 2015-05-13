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

            switch(action){
            case 'list':
                castCentral.discover(castCentral[options.protocol.toUpperCase()], options.search, function(casts){
                    debug(casts);
                    ipc.server.emit(socket, 'message', casts);
                    workerExit();
                });

                break;
            case 'launch':
                // TODO: Detect what type of cast to initialize
                if(!options.ip){
                    castCentral.discover(castCentral[options.protocol.toUpperCase()], options.search, function(casts){
                        debug(casts);
                        for(cast in casts){
                            if(casts[cast].name === options.name){
                                casts[cast].connect(options.app, {}, function(){
                                    workerExit();
                                });
                            }
                        }
                    });
                }else{
                    (new chromecast.chromecast({
                        addresses: [options.ip],
                        port: options.port || 8009,
                        name: options.name

                    })).connect(options.app, {}, function(){
                        workerExit();
                    });
                }

                break;
            default:
                ipc.server.emit(socket, 'message', null);
                workerExit();
            }
        }); // on 'message'
    }); // serve

    ipc.server.start();
}

function workerExit(){
    debug('child-', cluster.worker.id, 'exiting');
    cluster.worker.kill();
}
