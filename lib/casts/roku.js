// ROKU
// ----

var debug = require('debug')('casts:roku');

// TODO

function roku(headers){
    this.location = headers.addresses[0];

    this.toString = function(){
        return(
            "<roku:"+
                this.location+
            ">"
        );
    };

    debug('initialized new roku', this.location);
}

function is(cast){
	return false;
}

module.exports.roku = roku;
module.exports.is   = is;
