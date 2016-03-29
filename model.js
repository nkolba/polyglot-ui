var Base = require("./class");

	module.exports = Base.extend({
	
		init:function(props){
			this._props = props;
			//this.data = this.props("data");
		},

		props:function(name){
			return name ? this._props[name] : this._props;
		}
	});
