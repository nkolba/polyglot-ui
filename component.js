var Base = require("./class");

module.exports = Base.extend({

	init:function(id,construct){
var compWrapper = Object.create(HTMLElement.prototype);

compWrapper.createdCallback = function() {
	var props = {target:this};
	var attrs = this.attributes;
	for (var i = 0; i < attrs.length; i++){
		props[attrs.item(i).name] = attrs.item(i).value;
	}

	this.__obj = new construct(props);
};

compWrapper.attributeChangedCallback = function(name, oldVal, newVal){
		var update = {};
		update[name] = newVal;
		this.__obj.update(update);
	};

document.registerElement(id, {prototype: compWrapper});
	}

});