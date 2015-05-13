// CAST-CENTRAL-CLIENT
// -------------------

var columnify = require('columnify');
var ipc = require('node-ipc');
var debug = require('debug')('cast-central-cli');
var opts = require('optimist')
    .usage(
        'Connect and control the cast-central-service.\n'+
        'Usage: $0 <actions> <options>\n\n'+
        'Actions:\n'+
        '  list\t\t  List all available casts given the protocol and search term to use\n'+
        '  launch\t  Launch an app for a specific cast given the name, search term, and protocol for the cast'
    )
    .alias('p', 'protocol').describe('p', 'Cast discovery protocol to use [mdns, ssdp]').default('p', 'mdns')
    .alias('s', 'search').describe('s', 'Search term to look for cast devices').default('s', 'googlecast')
    .alias('c', 'cast').describe('c', 'Name of cast device to communicate with')
    .alias('i', 'ip').describe('i', 'The IP Address of the cast device')
    .alias('', 'port').describe('port', 'The port of the cast device')
    .alias('a', 'app').describe('a', 'Launch an application on the cast device').default('a', 'CC1AD845')
    .alias('t', 'timeout').describe('t', 'Timeout in seconds to wait for connect').default('t', 10)
    .alias('h', 'help').describe('h', 'Shows this usage');
var argv = opts.argv;

// The main debug interface into the cast-central-service.

if(argv.help){
    opts.showHelp();
    process.exit(0);
}else{
    process.on('uncaughtException', function(err){
        console.log('uncaught exception:', err);
        process.exit(1);
    });

    if(argv._.length > 0){
        for(action in argv._){
            validate(argv._[action], argv);

            sendCommand(argv._[action], {
                protocol: argv.protocol,
                search: argv.search,
                name: argv.cast,
                app: argv.app,
                ip: argv.ip,
                port: argv.port
            }, argv.timeout);
        }
    }else{
        opts.showHelp();
        process.exit(1);
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

function validate(action, args){
    switch(action){
    case 'list':
        return;
    case 'launch':
        return;
    }

    opts.showHelp();
    process.exit(1);
}
