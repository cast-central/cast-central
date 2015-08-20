require('../../lib/utils/unique.js');
var assert = require('assert');

describe('Array', function(){
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
