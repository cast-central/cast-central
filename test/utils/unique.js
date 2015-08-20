require('../../lib/utils/unique.js');
var should = require('should');
var assert = require("assert");

describe('Array', function(){
	describe('#unique()', function(){
		it('should return only unique elements in array', function(){
			var testArr = [{ name: 'test' },{ name: 'test' }];
			var solutionArr = [{ name: 'test' }];

			testArr.unique().should.be.exactly(solutionArr).and.be.a.Array();
			[1,1,2].unique().should.be.exactly([1,2]).and.be.a.Array();
			[].unique().should.be.exactly([]).and.be.a.Array();
		});
	});
});
