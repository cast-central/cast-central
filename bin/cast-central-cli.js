// CAST-CENTRAL-CLI
// ----------------

var columnify = require('columnify');
var ipc = require('node-ipc');
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
        search = typeof argv.list === 'boolean'? 'ssdp:all': argv.list;
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

    ipc.connectTo('core-master', function(){
        ipc.of['core-master'].on('connect', function(){
            ipc.of['core-master'].emit('message', {'action': 'new'});
        });

        ipc.of['core-master'].on('message', function(data){
            ipc.config.id = 'cli-'+data.id;
            ipc.config.maxRetries = 20;

            var name = 'core-child-'+data.id;
            ipc.connectTo(name, function(){
                setTimeout(function(){
                    process.exit(1);
                }, timeout * 1000);

                ipc.of[name].on('connect', function(){
                    connected = true;
                    ipc.of[name].emit('message', {'action': action, 'options': options});
                });

                ipc.of[name].on('message', function(data){
                    print(data);
 
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
        columns: ["type", "name"]
    }));
}

function sort(arr){
    return arr.sort(function(l, r){
        l = l.type;
        r = r.type;

        return(l.localeCompare(r) - r.localeCompare(l));
    });
}

