// VALIDATE PARAMS
// ---------------

var debug = require('debug')('cast-central-service:utils:validate_params'),
	defined = require('./defined.js');

// Checks each variable given and if one is not 
// defined then returns an error message of which 
// one is incorrect.
function validate_params(action_params, query_params){
	debug('validating', action_params, 'against', query_params);

    for(var param in action_params){
        if(action_params[param] && !defined(query_params[param])){
            return('missing required parameter: '+param);
        }
    }

    return(null);
}

module.exports = validate_params;
