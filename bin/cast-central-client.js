// CAST-CENTRAL-CLIENT
// -------------------

var columnify = require('columnify');
var ipc = require('node-ipc');
var debug = require('debug')('cast-central-cli');
var opts = require('optimist')
    .usage('Connect and control the cast-central-core.\nUsage: $0')
    .alias('l', 'list').describe('l', 'List all available castable devices')
    .alias('t', 'timeout').describe('t', 'Timeout in seconds to wait for response').default('t', 10)
    .alias('h', 'help').describe('h', 'Shows this usage');
var argv = opts.argv;

// The main interface into the cast-central-core service 
// allowing external, pluggable, interfaces though this.

if(argv.help){
    opts.showHelp();
    process.exit(0);
}else{
    process.on('uncaughtException', function(err){
        console.log('uncaught exception:', err);
        process.exit(1);
    });

    if(argv.list !== false){
        search = typeof argv.list === 'boolean'? '*': argv.list;
        sendCommand('list', search, argv.timeout);
    }
}

function sendCommand(action, options, timeout){
    ipc.config.silent = true;
    ipc.config.socketRoot = '/tmp/';
    ipc.config.appspace = 'cast-central.';
    ipc.config.id = 'cli';
    ipc.config.retry = 1000;
    ipc.config.maxRetries = timeout;
    debug('ipc.config', ipc.config);

    ipc.connectTo('core-master', function(){
        ipc.of['core-master'].on('connect', function(){
            debug('sending command to create new service resource');
            ipc.of['core-master'].emit('message', {'action': 'new'});
        });

        ipc.of['core-master'].on('message', function(data){
            ipc.config.id = 'cli-'+data.id;
            ipc.config.maxRetries = 20;
            debug('ipc.config', ipc.config);

            var name = 'core-child-'+data.id;
            ipc.connectTo(name, function(){
                setTimeout(function(){
                    debug('core-child', 'time out');
                    process.exit(1);
                }, timeout * 1000);

                ipc.of[name].on('connect', function(){
                    debug('sending command message to cast-central-service', action, options);
                    ipc.of[name].emit('message', {'action': action, 'options': options});
                });

                ipc.of[name].on('message', function(data){
                    print(data);

                    debug('disconnecting core-child from cast-central-service');
                    ipc.disconnect(name);
                    ipc.disconnect('core-master');
                    process.exit(0);
                });
            });
        });
    });
}

function print(results){
    console.log(columnify(sort(results), {
        truncate: true,
        minWidth: 10,
        maxWidth: 40,
        columns: ["name", "location", "port"]
    }));
}

function sort(arr){
    debug('sorting result array', arr);
    return arr.sort(function(l, r){
        l = l.name;
        r = r.name;

        return(l.localeCompare(r) - r.localeCompare(l));
    });
}
