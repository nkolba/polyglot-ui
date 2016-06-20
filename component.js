var Base = require("./class");

module.exports = Base.extend({

	init:function(id,construct){
var compWrapper = Object.create(HTMLElement.prototype);

compWrapper.createdCallback = function() {
	var props = {target:this};
	var attrs = this.attributes;
	for (var i = 0; i < attrs.length; i++){
		var v = attrs.item(i).value;
		props[attrs.item(i).name] = {value:v};
	}

	this.__obj = new construct(props);
};

compWrapper.attributeChangedCallback = function(name, oldVal, newVal){

		var update = {};
		//hack!
		if (name === "data"){
			newVal = JSON.parse(newVal);
		}
		update[name] = {value:newVal};
		this.__obj.update(update);
	};

document.registerElement(id, {prototype: compWrapper});
	}

});