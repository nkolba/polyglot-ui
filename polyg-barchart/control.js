var Base = require("../polyglot");
var Model = require("./model");
var Writer = require("./writer");

module.exports = Base.extend({

	model:Model,

	writer:Writer,

	init:function(){

		this._super({
			data:{value:null,type:Object},
			height:{value:"300", type:Number},
			width:{value:"500", type:Number},
			"key":{type:String,
				value:"",
				route:"data"}

		});

	}

});