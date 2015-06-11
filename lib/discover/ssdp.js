// SSDP - Simple Service Discovery Protocol
// ----------------------------------------

var debug   = require('debug')('discovery:ssdp'),
    SSDP    = require('node-ssdp').Client,
    dgram   = require('dgram'),
    request = require('request'),
    parse   = require('xml2js').parseString;

// Searches the local network using ssdp waits 
// for a timeout then returns the results 
// and closes the socket.

function ssdp(search, callback){
    var client  = null;
	var results = [];

	client = new SSDP({
		ssdpSig: "cast-central-service",
		ssdpIp: "239.255.255.250",
		ssdpPort: 1900,
		udn: "cast-central-service",
		log: false,
	});

    client.on("response", function(header, code, rinfo) {
        debug('response', header, code, rinfo);
        getInfo(header.LOCATION, function(err, info){
            if(err){
                debug('error getting info on casting device:', err);
            }else{
                results.push(info);
            }
        });
    });

    debug('starting ssdp search for', search);
	client.search(search);

    setTimeout(function(){
        debug('stopping ssdp search for', search, 'with results', results);
		client.sock.dropMembership("239.255.255.250");
        client.sock.close();
        callback(results);
    }, 2000);
}

function getInfo(url, cb){
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200){
            cb(null, error);
        }

        parse(body, function(err, result){
            if(err){ cb(null, err); }

            var urlbase = result.root.URLBase[0];
            var address = urlbase.split('http://')[1].split(':')[0];
            var port = urlbase.split(':')[2];

            cb(null, {
                addresses: [address],
                name: result.root.device[0].friendlyName[0],
                port: port
            });
        });
    });
}

module.exports.ssdp = ssdp;
