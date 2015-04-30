// CHROMECAST
// ----------

// Main chromecast cast type object 
// allowing to interface with the 
// chromecast dongle for version one 
// for version two.

function base_instance(){
    this.name     = "";
    this.location = "";
    this.toString = function(){
        return(
            "<chromecast:"+
                this.name+":"+
                this.location+
            ">"
        );
    };
}

function new_instance(version, params, callback){
    version(params, function(err, result){
        callback(err, utils.inherit(result, base_instance));
    });
}

module.exports.new_instance = new_instance;
