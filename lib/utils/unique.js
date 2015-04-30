// UNIQUE
// ------

// Adds the unique method ot an Array 
// of objects.  Assumes a 'toString' 
// method exists for each object.

Array.prototype.unique = function(){
	var u = {},
		a = [];

	for(var i = 0, l = this.length; i < l; ++i){
		if(u.hasOwnProperty(this[i].toString())) {
			continue;
		}

		a.push(this[i]);
		u[this[i].toString()] = 1;
	}

	return a;
};
