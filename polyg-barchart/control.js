var Base = require("../polyglot");
var Model = require("./model");
var Writer = require("./writer");

module.exports = Base.extend({

	model:Model,

	writer:Writer,

	init:function(config){

		this._super(config);

	}

});