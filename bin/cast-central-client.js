// CAST-CENTRAL-CLIENT
// -------------------

var columnify = require('columnify');
var ipc = require('node-ipc');
var debug = require('debug')('cast-central-cli');
var opts = require('optimist')
    .usage(
        'Connect and control the cast-central-service.\n'+
        'Usage: $0 <subset> <options>\n\n'+
        'Subset:\n'+
        '  resource\tControls what processes run within the cast-central-service\n'+
        '  cast\t\tSends commands for controlling casting devices'
    )
    // Resource Options
    .alias('l', 'list').describe('l', 'Lists all currently running resources or casts available')
    .alias('n', 'new').describe('n', 'Starts a new resource (shouldn\'t be used)')
    .alias('d', 'delete').describe('d', 'Forcefully stops and deletes a resource')
    .alias('i', 'id').describe('i', 'Used when forcefully stopping a resource')
    // Cast Options
    .alias('p', 'protocol').describe('p', 'Cast discovery protocol to use [mdns, ssdp]').default('p', 'mdns')
    .alias('s', 'search').describe('s', 'Search term to look for cast devices').default('s', 'googlecast')
    .alias('c', 'cast').describe('c', 'Name of cast device to communicate with')
    .alias('a', 'app').describe('a', 'Launch an application on the cast device [DefaultMediaReceiver, Youtube]')
    .alias('m', 'media').describe('m', 'Media to load onto launched application')
    .alias('', 'load').describe('load', 'Load media to the currently launched application')
    .alias('', 'launch').describe('launch', 'Launch an application the casting device')
    .alias('v', 'volume').describe('v', 'Set the volume of the casting device').default('v', -1)
    .alias('', 'mute').describe('mute', 'Mute the casting device [true, false]').default('mute', '')
    .alias('t', 'timeout').describe('t', 'Timeout in seconds to wait for connect [> 0]').default('t', 10)
    .alias('', 'seek').describe('seek', 'Seek the media currently being casted').default('seek', 0)
    .alias('h', 'help').describe('h', 'Shows this usage');
var argv = opts.argv;

// The main debug interface into the cast-central-service.

if(argv.help){
    opts.showHelp();
    process.exit(0);
}else{
    process.on('uncaughtException', function(err){
        debug('uncaught exception:', err);
        process.exit(1);
    });

    if(argv._.length === 1){
        var t = argv.timeout;

        switch(argv._[0]){
        case 'resource':
            if(argv.list){
                sendResourceCommand('list', {}, t);
            }else if(argv.new){
                sendResourceCommand('new', {}, t);
            }else if(argv.delete){
                sendResourceCommand('delete', {
                    id: argv.id || -1
                }, t);
            }else{
                console.log('Incorrect options [list, new, delete -i <id>]');
                opts.showHelp();
                process.exit(1);
            }

            break;
        case 'cast':
            if(argv.list){
                sendCastCommand('list', {
                    protocol: argv.protocol,
                    search: argv.search,
                    name: argv.cast
                }, t);
            }else if(argv.launch){
                sendCastCommand('launch', {
                    protocol: argv.protocol,
                    search: argv.search,
                    name: argv.cast,
                    app: argv.app
                }, t);
            }else if(argv.load){
                sendCastCommand('load', {
                    protocol: argv.protocol,
                    search: argv.search,
                    name: argv.cast,
                    media: argv.media
                }, t);
            }else if(argv.seek > 0){
                sendCastCommand('seek', {
                    protocol: argv.protocol,
                    search: argv.search,
                    name: argv.cast,
                    amount: argv.seek
                }, t);
            }else if(argv.mute !== ''){
                sendCastCommand('mute', {
                    protocol: argv.protocol,
                    search: argv.search,
                    name: argv.cast,
                    mute: argv.mute === 'true'
                }, t);
            }else if(argv.volume !== -1){
                sendCastCommand('volume', {
                    protocol: argv.protocol,
                    search: argv.search,
                    name: argv.cast,
                    volume: argv.volume
                }, t);
            }else{
                console.log('Incorrect options [list, launch, load, seek, mute, volume]');
                opts.showHelp();
                process.exit(1);
            }

            break;
        default:
            opts.showHelp();
            process.exit(1);
        }
    }else{
        opts.showHelp();
        process.exit(1);
    }
}

function sendCastCommand(action, options, timeout){
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
