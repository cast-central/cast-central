// CORS
// ----

var debug = require('debug')('cast-central-service:cors');

// Sets the appropriate headers for cross 
// origin requests.

module.exports = function(req, res, next){
    debug('setting cors header');
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
};
