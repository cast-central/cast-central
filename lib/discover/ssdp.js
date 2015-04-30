// SSDP - Simple Service Discovery Protocol
// ----------------------------------------

// Searches the local network using ssdp waits 
// for a timeout(s) then returns the results 
// and closes the socket.


function ssdp(ip, port, timeout){
	SSDP    = require('node-ssdp').Client;
	dgram   = require('dgram');
    client  = null;
	results = null;
 
	this.search = function(search, cb){
		search  = search || 'ssdp:all';
        results = [];

		client = new SSDP({
			ssdpSig: "cast-central signature",
			ssdpIp: "239.255.255.250",
			ssdpPort: 1900,
			udn: "cast-central udp",
			log: false,
		});

        client.on("response", function(header, code, rinfo) {
            results.push({header: header, code: code, rinfo: rinfo});
        });

		client.search(search);

        setTimeout(function(){
			client.sock.dropMembership("239.255.255.250");
                client.sock.close();
                cb(results);
        }, 2000);
	};
}

function isChromecast(headers){
    return(
        headers['X-USER-AGENT'] === 'redsonic'
    );
}

function isRoku(headers){
    return(false);
}

function detect(params, callback){
    if(isChromecast(params.header)){
        var chromecast = require('../chromecast/chromecast.js');
        chromecast.new_instance(params.header, callback);
    }else if(isRoku(params.header)){
        callback(null, {type: 'roku'});
    }else{
        var other = require('../other/other.js');
        callback(null, new other(params.header));
    }
}

module.exports.ssdp = ssdp;
module.exports.detct = detect;
