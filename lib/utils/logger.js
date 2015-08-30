// LOGGER
// ------

var debug = require('debug')('cast-central-service:restful-logger-handler');

// Acts as a middleware to ensure that 
// each request made to the cast-central-service 
// is logged.

module.exports = function(req, res, next){
    debug('processing request', req.method, req.url);
    next();
};
