// V1
// --

var request = require('request');
var parseString = require('xml2js').parseString;

// Version One of the chromecast casting 
// device.  Uses ssdp for discovery and 
// dial for controlling the device.

function V1(params, callback){
    request(params.LOCATION, function(err, result, body){
        if(err){ callback(err, null); }

        parseString(body, function(err, result){
            callback(err, {
                specVersion:  result.root.specVersion[0].major[0] + "." + result.root.specVersion[0].minor[0],
                location:     result.root.URLBase[0],
                deviceType:   result.root.device[0].deviceType[0],
                name:         result.root.device[0].friendlyName[0],
                manufacturer: result.root.device[0].manufacturer[0],
                modelName:    result.root.device[0].modelName,
                udn:          result.root.device[0].UDN[0],
                services:     serviceList(result.root.device[0].serviceList)
            });
        });
    });
}

function serviceList(sl){
    var arr = [];

    for(var i = 0; i < sl.length; i++){
        arr.push({
            type:        sl[i].service[0].serviceType[0],
            id:          sl[i].service[0].serviceId[0],
            controlURL:  sl[i].service[0].controlURL[0],
            eventSubURL: sl[i].service[0].eventSubURL[0],
            scpdurl:     sl[i].service[0].SCPDURL[0]
        });
    }

    return arr;
}

module.exports = V1;
