#! /usr/bin/env nodejs

// CAST-CENTRAL-CLIENT
// -------------------

var debug      = require('debug')('cast-central-cli'),
    http       = require('http'),
    opts       = require('optimist')
        .usage(
            'Connect and control the cast-central-service.\n'+
            'Usage: $0 {list|launch|load|setVolume|setMute|seek|stop} <options>'
        )
        .describe('host', 'The hostname/ip of the cast-central-service').default('host', 'localhost').demand('host')
        .describe('port', 'The port of the cast-central-service').default('port', '8000').demand('port')
        .alias('p', 'protocol').describe('p', 'Cast discovery protocol to use [mdns, ssdp]')
        .alias('s', 'search').describe('s', 'Search term to look for cast devices')
        .alias('n', 'name').describe('n', 'Name of cast device to communicate with')
        .alias('a', 'app').describe('a', 'Launch an application on the cast device [DefaultMediaReceiver, Youtube]')
        .alias('m', 'media').describe('m', 'Media to load onto launched application')
        .describe('params', 'Extra parameters to send for the load action')
        .alias('v', 'value').describe('v', 'Value for seek, mute, or volume')
        .describe('version', 'The version of the cast-central-service').default('version', 'v1').demand('version')
        .describe('type', 'The type of cast to perform action on, available is chromecast').default('type', 'chromecast').demand('type')
        .alias('t', 'timeout').describe('t', 'Amount of seconds to wait until give up').default('t', 10)
        .alias('h', 'help').describe('h', 'Shows this usage'),
    argv = opts.argv;

// Command line client for sending requests to the 
// cast-central-service over RESTFul calls.

if(argv.help){
    opts.showHelp();
    process.exit(0);
}else{
    if(argv._.length === 1){
        var action = argv._[0];
        var options = {
            'protocol': argv.protocol,
            'search': argv.search,
            'name': argv.name,
            'app': argv.app,
            'media': argv.media,
            'params': argv.params,
            'value': argv.value
        };

        var serialized = serialize(options);
        process_command(argv.host, argv.port, argv.version, argv.type, action, serialized, argv.timeout);
    }else{
        opts.showHelp();
        process.exit(1);
    }
}

// Sends a GET request to the host/port 
// given then returns then prints the 
// response.
function process_command(host, port, version, type, action, options, timeout){
    debug('processing command', host, port, options, timeout);

    http.get({
        host: host,
        port: port,
        path: '/'+version+'/'+type+'/'+action+options
    }, function(res){
        var body = '';

        res.setTimeout(timeout * 1000, function(){
            console.log('cast-central-service communication timed out after', timeout, 'seconds');
            process.exit(1);
        });

        res.on('data', function(chunk){
            debug('cast-central-service chunk received');
            body += chunk;
        });

        res.on('end', function(){
            debug('cast-central-service communication ended');
            debug('body:', body);

            print(JSON.parse(body));
        });
    }).end();
}

// Prints JSON in 'pretty' form to stdout.
function print(msg){
    console.log(JSON.stringify(msg, null, 4));
    process.exit(0);
}

// Serializes a hashed object into query 
// fields for GET requests.
function serialize(options){
    var current = 0;
    var length = options.length;
    var serialized = "";

    for(var key in options){
        if(typeof options[key] !== 'undefined' && options[key] !== null){
            if(current === 0){ // First
                serialized += "?";
            }else if(current !== length){ // Not last
                serialized += "&";
            }
            serialized += key+"="+options[key];
        }
        current++;
    }

    debug('serialized', options, 'to', serialized);
    return(serialized);
}
