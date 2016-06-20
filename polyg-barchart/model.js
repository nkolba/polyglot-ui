var Base = require("../model.js");

	function sort(d, key, order){
			return d.sort(function(a,b){
				if (a[key] > b[key]){
					return -1;
				}
				if (a[key] < b[key]){
					return 1
				}
				return 0;
			});
		}


module.exports = Base.extend({


	target:function(){
		return this.props("target") ? this.props("target").value :  document.body;
	},

	width:function(){
		return this.props("width") ? Number.parseInt(this.props("width").value) : 960;
	},

	height : function(){
		return this.props("height") ? Number.parseInt(this.props("height").value) : 500;
	},

	x : function(){ 
		return  d3.scale.ordinal()
				    .rangeRoundBands([this.margins().left, this.width()], .1);
	},

	y: function(){
		return d3.scale.linear()
				    .range([this.height() - (this.margins().top - this.margins().bottom), 0]);
	},

	margins : function(){
		return {top: 20, right: 20, bottom: 30, left: 40};
	},

	data: function(){
		var d = this.props("data") ?  this.props("data").value : [];
		var k = this.props("key");
		if (k){
			return sort(d,k);
		}
		else {
			return d;
		}
	}

});