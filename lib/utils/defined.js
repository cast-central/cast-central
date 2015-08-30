// DEFINED
// -------

var debug = require('debug')('cast-central-service:utils:defined');

// Returns boolean if a particular variable 
// is defined or null.

function defined(variable){
    return(
        typeof variable !== 'undefined' && 
        variable !== null
    );
}

module.exports = defined;
