// CAST-CENTRAL-CORE
// -----------------

var cluster     = require('cluster'),
    ipc         = require('node-ipc'),
    castCentral = require('../lib/cast-central.js');

// The core service layer that directly 
// interfaces with cast devices.  
// Communication with this is only through 
// the IPC stack.

ipc.config.silent = true;
ipc.config.socketRoot = '/tmp/';
ipc.config.appspace = 'cast-central.core';

var timeouts = [];

cluster.on('fork', function(worker){
    timeouts[worker.id] = setTimeout(function(){
        console.log('forcing long running process to quite');
        if(!worker.process.killed){
            timeouts[worker.id] = null;
            worker.kill();
        }
    }, 10000);
});

cluster.on('exit', function(worker, code, signal){
    clearTimeout(timeouts[worker.id]);
});

if(cluster.isMaster){
    ipc.config.id = '-master';
    
    ipc.serve(function(){
        ipc.server.on('message', function(data, socket){
            if(data.action === 'new'){
                console.log('creating new resource');
                var child = cluster.fork([]);
                ipc.server.emit(socket, 'message', {'id': child.id});
            }
        });
    });
    
    ipc.server.start();
}else if(cluster.isWorker){
    console.log('child-', cluster.worker.id, ' started');
    ipc.config.id = '-child-'+cluster.worker.id;

    ipc.serve(function(){
        ipc.server.on('message', function(data, socket){
            var action = data.action;
            var options = data.options;
            console.log('child-', cluster.worker.id, ' processing ', action, '(', options, ')');

            castCentral.discover(options, function(casts){
                console.log(casts);

                switch(action){
                case 'list':
                    ipc.server.emit(socket, 'message', casts);
                    break;
                default:
                    ipc.server.emit(socket, 'message', null);
                }

                console.log('child-', cluster.worker.id, 'exiting');
                cluster.worker.kill();
            }); // discover
        }); // on 'message'
    }); // serve

    ipc.server.start();
}
