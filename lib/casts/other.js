// OTHER
// -----

var debug = require('debug')('casts:other');

// Blank placeholder for the cast where 
// we can't figure out what kind of 
// casting device it is.

function other(location, callback){
    this.location = location;

    this.toString = function(){
        return(
            "<other:"+
                this.location+
            ">"
        );
    };

    debug('initialized new other', this.location);
}

module.exports = other;
