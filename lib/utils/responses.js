// RESPONSES
// ---------

var debug = require('debug')('cast-central-service:utils:responses'),
    merge  = require('merge');

// Standard responses that each request_handler 
// must return.

// Given an error message, will normalize and 
// return a json structure for ending the 
// request transmission.
function json_success(object){
	debug('serialized', object, 'to be a success in json');
    return(merge({ 'success': true }, object));
}

// Given an error message, will normalize and 
// return a json structure for ending the 
// request transmission.
function json_error(message){
	debug('serialized', message, 'to be a failure in json');
    return({ 'success': false, 'message': message });
}

module.exports = {
	'error': json_error, 
	'success': json_success
};
