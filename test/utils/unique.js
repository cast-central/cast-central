require('../../lib/utils/unique.js');
var assert = require("assert");

describe('Array', function(){
	describe('#unique()', function(){
		it('should return only unique elements in array', function(){
			var testArr = [{ name: 'test' },{ name: 'test' }];
			var solutionArr = [{ name: 'test' }];

			assert.deepEqual(solutionArr, testArr.unique());
			assert.deepEqual([1,2], [1,1,2].unique());
		});
	});
});
 