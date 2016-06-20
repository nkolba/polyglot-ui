(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//define([],function(){
  /* Simple JavaScript Inheritance
   * By John Resig http://ejohn.org/
   * MIT Licensed.
   */
  // Inspired by base2 and Prototype

    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    var Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };

    module.exports = Class;

 //});
},{}],2:[function(require,module,exports){
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
},{"./class":1}],3:[function(require,module,exports){
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

},{"./class":1}],4:[function(require,module,exports){
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
},{"../polyglot":8,"./model":6,"./writer":7}],5:[function(require,module,exports){
var polygChart = require("./control");
var wrapper = require("../component");

new wrapper("polyg-barchart",polygChart);

},{"../component":2,"./control":4}],6:[function(require,module,exports){
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
},{"../model.js":3}],7:[function(require,module,exports){
var Base = require("../writer.js");

module.exports =  Base.extend({



	routes:function(){
		var margin,
		width,
		height;

		return {
			"!default":function(model){
				var t = d3.select(model.target());

				margin = model.margins();//{top: 20, right: 20, bottom: 30, left: 40},
			    width = model.width() - (margin.left - margin.right);
			    height = model.height() - (margin.top - margin.bottom);

			   	var svg = d3.select(model.target()).selectAll("svg").data(["default"]);

			   	svg.enter().append("svg");

			   	svg.exit().remove();
			   	
			   	svg
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				return svg;

			},

			"data":function(model,svg){
				var x = model.x(),
			    y = model.y();


				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
				    .ticks(10, "%");

				var data = model.data();
				//d3.tsv("data.tsv", type, function(error, data) {
				 // if (error) throw error;

				  x.domain(data.map(function(d) { return d.letter; }));
				  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

				  var xGroup = svg.selectAll(".x.axis").data([data]);

				  xGroup.enter()
				  	.append("g")
				  	.classed("x",true)
				  	.classed("axis",true);

				 xGroup.exit().remove();

				 xGroup.attr("transform", "translate(" + 0 + "," + height + ")")
				      .call(xAxis);

 				var yGroup = svg.selectAll(".y.axis").data([{label:"Frequency"}]);

				  yGroup.enter()
				  	.append("g")
				  	.classed("y",true)
				  	.classed("axis",true);

				 yGroup.exit().remove();

				 yGroup
				 .attr("transform", "translate(" + margin.left + ",0)")
				      .call(yAxis);
				
				 
				 var yLabel = yGroup.selectAll("text.label").data(function(d){return [d];});
				 yLabel.enter()
					   .append("text")
					   .classed("label");

				yLabel.exit().remove();

				yLabel 
				      .attr("transform", "rotate(-90)")
				      .attr("y", 6)
				      .attr("dy", ".71em")
				      .style("text-anchor", "end")
				      .text(function(d){return d.label;});

				var barGs = svg.selectAll("g.bar").data(data);

					barGs.enter().append("g").classed("bar",true).attr("id",function(d){return d.letter;});

				 var bars = barGs.selectAll("rect.bar").data(function(d){return [d];});
				      

				 bars
				    .enter().append("rect").attr("class",function(d){return " bar " + 	d.letter;});

				  bars.exit().remove();


				  data.forEach(function(item){
				  	
				  	var bg = svg.selectAll("#" + item.letter);
				  	 bg
				  	 .transition()
				  	 .duration(750)
				  	 .attr("transform","translate(" + x(item.letter) + "," + 0 + ")");

				  	var bar = bg.selectAll("rect").data([item]);
				  	bar
				      .attr("width", x.rangeBand())
				      .attr("y", function(d) { return y(d.frequency); })
				      .attr("class",function(d){return "bar " + 	d.letter;})
				      //.transition()
				      //.duration(1000)
				  	//	.attr("x", function(d) { return x(d.letter); })
				  		 .attr("height", function(d) { return height - y(d.frequency); });

				  });
				 				

			}
		};
	}

});
},{"../writer.js":9}],8:[function(require,module,exports){
/******************* 
	polyglot
	base class for handling UI Components
	supports webcomponent interface to the DOM and/or pure code/isomorphic mode
	supports pluggable writers and data models - can use any other library for rendering and/or modeling logic
	main interfaces:
		widget: encapsulates business/behavior logic for the component
		model: data and properties model used by the component
		writer: writes the object to DOM, CSV, or other, may support partial writes (for dynamic DOM updating)
		component: webcomponent binding	

*******************/
/* 

	need to make properties more structured in order to support proper routing off of property changes
	(and better support type/etc)
	so:

	props:{
		"prop":{type:String,
			value:"foo",
			route:"bar" //this determines route to use if property changes
			}
	}

*/

var Base = require("./class");


	//utility function for mixing objects
	function mix(base, mx){
			function copy(o){
				var _r = {}
				Object.keys(o).forEach(function(k){
					_r[k] = o[k];});
				return _r;
			}
			function _mix(b,m){
				Object.keys(m).forEach(function(k){
					b[k] = m[k] ? m[k] : b[k];
				});
				return b;
			}
			//shim
			return _mix(copy(base),mx);

		}
	//parse route for special syntax into a structure w/path and query
	//i.e. rows?id=12  or data?set=my 
	/*function resolveRoute(route){
		if (! route){
			return null;
		}
		var r = {};
		r.path = route.indexOf("?") > 0 ? route.substr(0,route.indexOf("?")) : route;
		if (route !== r.path){
			var q = route.substr(route.indexOf("?")+1),
				nv = q.split("=");
				//oly support single pair for now...
				r.query = {};
				r.query[nv[0]] = nv[1];
		}
		return r;

	}*/
	function keys(obj){
		var r = [];
		for (var k in obj){
			r.push(k);
		}
		return r;
	}


	function diffModels(oldM, newM){
		var diffs = [],
			enters = [],
			exits = [],
			updates = [];
		//compare properties of models, compile list of differences
		var newProps = newM.props(),
			oldProps = oldM.props(),
 			newKeys = keys(newProps),
			oldKeys = keys(oldProps);
		
		//properties added in new...
		newKeys.forEach(function(k){
			if (oldKeys.indexOf(k) <0){
				enters.push(k);
			}
		});

		//properties deleted in new...
		oldKeys.forEach(function(k){
			if (newKeys.indexOf(k) <0){
				exits.push(k);
			}
		});

		//properties changes...
		for (var i = 0; i < newKeys.length; i++){
			var k = newKeys[i];
			if (oldProps[k] && oldProps[k] !== newProps[k]){
				updates.push(k);
			}
		}
		diffs = diffs.concat(enters,exits,updates);
		if (diffs.length === 0){
			diffs = ["!default"];
		}
		console.log(diffs.join(","))
		return diffs;
	}


	//compare models and determine route to take
	function resolveRoute(poly, oldM, newM){
		//if there isn't a previous model
		if (!oldM ){
			return ["!default"];
		}

		//or, find differences
		var diffs = diffModels(oldM, newM);
		var r = [];
		var propKeys = Object.keys(poly.props());
		debugger;
		diffs.forEach(function(d){
			/*if (propKeys.indexOf(d) > -1){
				r.push(d);
			}*/
			propKeys.forEach(function(k){
				if (k === d){
					r.push(d);
				}
				else if (poly.props(k).route && poly.props(k).route === d){
					r.push(d);	
				}
			});

			/*if (poly.props(d)){
				var prop = poly.props(d);
				if (prop.route){
					r.push(prop.route)
				}
				else {
					r.push(d);
				}
			}*/
		});

		return  r;

	}

	function getPropsFromDom(node){
		var r = null;
		if (node && node.attributes){
			r = {};

			var atr = node.attributes;
			for (var i = 0; i < atr.length; i++){
				r[atr[i].name] = atr[i].value;
			}
			r.target = node;
		}
		return r || node;
	}

    //create a getter/setter function
	function getSet(obj, internal, val, mod){

			if (val){
				if (typeof val === "object"){
					if (typeof mod !== "undefined"){
						obj[internal] = mix(obj[internal],val);
					}
					else {
						obj[internal] = val;
					}
				} else if (typeof val === "string") {
					if (typeof mod !== "undefined"){
						obj[internal][val] = mod;	
					}
					else {
						return obj[internal][val];
					}
					
				}
			}
			return obj[internal];
			
		}

	module.exports = Base.extend({
		//private values
		__prp:null,

		//init
		init:function(config){
			if (config){

				this.__prp = mix({
					

				},config);
			}
			this.update();
		},

		/*
			pass the update object to the reader to generate a model
			pass model to writer (with optional route) to generate UI/output  
		*/
		update:function(obj){
			var self = this,
				model,
				w;



			//mix updated values with props
			if (obj){
				this.__prp = mix(this.__prp,obj);
			}

			if (this.writer){
			 	w = new this.writer();
			}
			
			if (this.model){
				model = new this.model(self.props());
			}
				
		
			if (w && model){
				r = resolveRoute(this, this.lastModel, model);

				w.write(model, r).then(function(data){
				//to do: dynamically generate route depending on model change			
				self.onWrite.call(self);
										
			},function(){
				
					var route = "_error";
					w.write(data,route).then(function(args){
						if (self.onError){
							self.onError.call(this);
						}
					});
				});
			}

			//keep reference to the last model
			this.lastModel = model;

			return self;
		},
	

		//get/set props
		//over: [Bool] overwrite properties with p arg (otherwise, a mixin is performed)
		//args: "get value" =  single string arg
		//		"set value" = string arg, plus second arg
		//		"mixin value" = single obj arg
		//		"set values" = obj arg, true arg for overwrite
		props:function(val, mod){
			//return getSet(this, "__prp", val, mod);
			if (!val && !mod){
				return this.__prp;
			}
			if (val && typeof(mod) === "undefined") {
				return this.__prp[val].value;
			}
			else {
				this.__prp[val].value = mod;
			}
		},


		
		/* dictionary of events emitted by app
		
		events:function(val, mod){
			return getSet(this, "__evt", val, mod);
		},*/


		onWrite:function(){
			if (this.props().onWrite){
				this.props().onWrite.call(this);
			}

		}
	});


},{"./class":1}],9:[function(require,module,exports){
/* writer base class */
var Base = require("./class");

	module.exports = Base.extend({

		init:function(ctx){
			this.context = ctx;
		},

		routes:function(){
				return {
				"!default":function(model){
					//default rendering (pre-render)
					//returns the 'default' element reference which is passed into all other routes, this should be a ref to the top-level dom node for the UI component
				}
			};

		},

	/*	props:function(val,mod){
			return this.context.props(val,mod);
		},*/

		write:function(model,route){
			var self = this,
				r = route;

				if (r.indexOf("!error") > -1){
					return new Promise(function(resolve,reject){
						self.routes()["!error"].call(self);
					});
				}

				//store a ref to the model in the writer class
				this.model = model;
				
				return new Promise(function(resolve,reject){
					try {
						var routes = self.routes(),
							target = routes["!default"](model);


						if (r){
							r.forEach(function(rt){
								if (routes[rt]){
									routes[rt](model,target);
								}
							});
						}
						else {
							Object.keys(routes).filter(function(k){return k.substr(0,1) !== "!";}).forEach(function(k){
								routes[k](model,target);
							});
						}
					}
					catch(er){
						console.log(er);
					}
					
				resolve();
			
			});
		}	
	});

},{"./class":1}]},{},[5]);
