// OTHER
// -----

// Generic representation of a cast 
// device, usually used when the device 
// is not recognized.

function other(headers){
    this.type = 'other';

    this.toString = function(){
        return("<other>");
    };
}

module.exports = other;

