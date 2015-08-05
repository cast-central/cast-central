// ERRORS
// ------

var debug = require('debug')('cast-central-service:restful-error-handler');

// Acts as a middleware to ensure that 
// each request made to the cast-central-service 
// is logged.

module.exports.error_500 = function(err, req, res, next){
    debug('error');
    res.status(500).json({'success': false, 'message': '500 error occurrred'});
};

module.exports.error_404 = function(req, res, next){
    debug('404 not found');
    res.status(404).json({'success': false, 'message': '404 not found'});
};
