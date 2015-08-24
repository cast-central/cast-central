require('../lib/utils/unique.js');
var cors = require('../lib/utils/cors.js'),
	errors = require('../lib/utils/errors.js'),
	logger = require('../lib/utils/logger.js'),
	defined = require('../lib/utils/defined.js'),
	validate_params = require('../lib/utils/validate_params.js'),
	responses = require('../lib/utils/responses.js'),
	handle_interface = require('../lib/utils/handle_interface.js'),
	should = require('should'),
	assert = require('assert'),
	sinon = require('sinon');

// Utils
describe('Utils', function(){
	// Handle Interface
	describe('#handle_interface()', function(){
		it('#handle_request() is called with appropriate arguments and handling', function(done){
			this.timeout(2000);

			var req = {
				'params': {'action': 'action'},
				'query': {},
			};
			var res = {'json': sinon.spy()};
			var intrfc = {
				'name': 'fake',
				'request_handlers': {
					'action': { 'params': {  },
						'handle': function(params, cb){
							params.should.be.instanceOf(Object);
							(typeof cb).should.be.exactly('function');

							cb({  });
						}
					}
				}
			};

			handle_interface(intrfc)(req, res);

			setTimeout(function(){
				res.json.calledOnce.should.be.true;
				res.json.getCall(0).args[0].should.be.instanceOf(Object);

				done();
			}, 500);
		});

		it('returns a function to use for handling http request for the interface given', function(){
			var intrfc = {'name': 'fake', 'request_handlers': {}};

			(typeof handle_interface(intrfc)).should.be.exactly('function');
		});

		it('throws exception if interface doesnt have name property', function(){
			var intrfc = {'request_handlers': {}};
			(function(){
				handle_interface(intrfc);
			}).should.throw('name is a required property in the interface.');
		});

		it('throws exception if interface doesnt have request_handlers property', function(){
			var intrfc = {'name': 'name'};
			(function(){
				handle_interface(intrfc);
			}).should.throw('request_handlers is a required in the interface.');
		});
	});

	// Responses
	describe('Responses', function(){
		it('#json_success() returns json structure with appropriately merged objects', function(){
			var object = {'other': 'value'};
			var response = responses.success(object);

			response.should.be.instanceOf(Object);
			response.should.have.property('other', 'value');
			response.should.have.property('success', true);
		});

		it('#json_error() returns the error message in json format', function(){
			var error_message = 'my error message';
			var response = responses.error(error_message);

			response.should.be.instanceOf(Object);
			response.should.have.property('message', error_message);
			response.should.have.property('success', false);
		});
	});

	// Validate Params
	describe('#validate_params()', function(){
		it('returns null if params are validated', function(){
			var required = {'one': true, 'two': false};
			var params = {'one': 1, 'two': 2};

			assert(validate_params(required, params) === null);
		});

		it('return error message if params are not valid', function(){
			var required = {'one': true, 'two': false};
			var params = {'two': 2};

			validate_params(required, params).should.be.instanceOf(String).and.be.exactly('missing required parameter: one');
		});
	});

	// Defined
	describe('#defined()', function(){
		it('detects whether a variable is defined', function(){
			var object = {};
			defined(object).should.be.instanceOf(Boolean).and.be.exactly(true);
		});

		it('detects whether a variable is not defined', function(){
			var object = null;
			defined(object).should.be.instanceOf(Boolean).and.be.exactly(false);
		});
	});

	// Logger
	describe('#logger()', function(){
		it('logs each request appropriately', function(){
			var req = {method: 'GET', url: '/some/path'};
			var res = null;
			var next = sinon.spy();

			logger(req, res, next);

			next.calledOnce.should.be.exactly(true);
		});
	});

	// Cors
	describe('#cors()', function(){
		it('adds the appropriate headers to http responses', function(){
			var req = sinon.spy();
			var res = { header: sinon.spy() };
			var next = sinon.spy();

			cors(req, res, next);

			req.called.should.exactly(false);

			res.header.getCall(0).args[0].should.be.exactly("Access-Control-Allow-Origin");
			res.header.getCall(0).args[1].should.be.exactly("*");
			res.header.getCall(1).args[0].should.be.exactly("Access-Control-Allow-Headers");
			res.header.getCall(1).args[1].should.be.exactly("Origin, X-Requested-With, Content-Type, Accept");

			next.calledOnce.should.be.exactly(true);
		});
	});

	// Errors
	describe('#errors()', function(){
		it('valid 500 error response', function(){
			var error = null;
			var req = null;
			var json = sinon.spy();
			var res = { status: sinon.stub().withArgs(500).returns({json: json}) };
			var next = sinon.spy();

			errors.error_500(error, req, res, next);

			json.calledOnce.should.be.exactly(true);
			json.getCall(0).args[0].should.have.property('success', false);
			json.getCall(0).args[0].should.have.property('message', '500 error occurrred');

			next.called.should.be.exactly(false);
		});

		it('valid 404 error response', function(){
			var req = null;
			var json = sinon.spy();
			var res = { status: sinon.stub().withArgs(404).returns({json: json}) };
			var next = sinon.spy();

			errors.error_404(req, res, next);

			json.calledOnce.should.be.exactly(true);
			json.getCall(0).args[0].should.have.property('success', false);
			json.getCall(0).args[0].should.have.property('message', '404 not found');

			next.called.should.be.exactly(false);
		});
	});

	// Unique
	describe('#unique()', function(){
		it('should return only unique elements in array', function(){
			var testArr = [{ name: 'test' },{ name: 'test' }];
			var solutionArr = [{ name: 'test' }];

			assert.deepEqual(testArr.unique(), solutionArr);
			assert.deepEqual([1,1,2].unique(), [1,2]);
			assert.deepEqual([].unique(), []);
		});
	});
});
