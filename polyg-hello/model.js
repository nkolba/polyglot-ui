var Base = require("../model.js");

module.exports = Base.extend({

	init:function(props){
		this._props = props;
	},

	message: function(){
		return this._props  && this._props.message ?  this._props.message : "hello default";
	}

});