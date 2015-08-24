// HANDLE REQUEST
// --------------

var debug = require('debug')('cast-central-service:utils:handle_request'),
	defined = require('./defined.js'),
	validate_params = require('./validate_params.js'),
	responses = require('./responses.js');

// Given an interface which has a 'request_handlers' 
// list of request handlers and the interface name.
function handle_interface(interface){
	if(!defined(interface.name)){ throw new Error('name is a required property in the interface.'); }
	if(!defined(interface.request_handlers)){ throw new Error('request_handlers is a required in the interface.'); }

	debug('registerring interface', interface.name);
	var request_handlers = interface.request_handlers;

	// Handles all requests validates the query 
	// parameters given and calls the approprate 
	// function for the action.
	return(function handle_request(req, res){
	    var action = req.params.action,
	        error_message = validate_params(request_handlers[action].params, req.query);

	    if(defined(error_message)){
	        res.json(responses.error(error_message));
	    }else{
	        request_handlers[action].handle(req.query, function(response, error){
	            if(defined(error)){
	                res.json(responses.error(error));
	            }else{
	                res.json(responses.success(response));
	            }
	        });
	    }
	});
}

module.exports = handle_interface;
