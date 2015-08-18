#! /usr/bin/env node

// CAST-CENTRAL-SERVICE
// --------------------

var app         = require('express')(),
    logger      = require('../lib/utils/logger.js'),
    errors      = require('../lib/utils/errors.js'),
    cors        = require('../lib/utils/cors.js'),
    debug       = require('debug')('cast-central-service'),
    chromecast  = require('../lib/v1/chromecast.js'),
    roku        = require('../lib/v1/roku.js'),
    other       = require('../lib/v1/other.js');
    //castCentral = require('../index.js');

// The core service layer that directly 
// interfaces with cast devices.  
// Communication with this is made through 
// restful calls.
//
// RESTFul endpoints:
//   /<version>/<cast type>/connect
//   /<version>/<cast type>/disconnect
//   /<version>/<cast type>/list
//   /<version>/<cast type>/launch
//   /<version>/<cast type>/load
//   /<version>/<cast type>/stop
//   /<version>/<cast type>/seek
//   /<version>/<cast type>/setMute
//   /<version>/<cast type>/setVolume
//   /<version>/<cast type>/status

// First route will log everything
app.all('*', logger);

// Set the access allow cross origin headres
app.use(cors);

// Overrides the error handler
app.use(errors.error_500);

// Chromecast
app.get('/v1/chromecast/:action?', chromecast.handle_request);

// Roku
// TODO

// Other
// TODO

// Last route will handle if the route has 
// not been found
app.all('*', errors.error_404);

// Start the service
app.listen(process.argv[2] || '8000');
