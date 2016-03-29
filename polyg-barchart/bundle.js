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

	init:function(config){

		this._super(config);

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
		return this.props("target") || document.body;
	},

	width:function(){
		return this.props("width") || 960;
	},

	height : function(){
		return this.props("height") || 500;
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
		var d = this.props("data") ?  JSON.parse(this.props("data")) : [];
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

		return {
			"!default":function(model){
				var t = d3.select(model.props("target"));

				var margin = model.margins(),//{top: 20, right: 20, bottom: 30, left: 40},
			    width = model.width() - (margin.left - margin.right),
			    height = model.height() - (margin.top - margin.bottom),
			    x = model.x(),
			    y = model.y();

			/*	var x = d3.scale.ordinal()
				    .rangeRoundBands([margin.left, width], .1);

				var y = d3.scale.linear()
				    .range([height, 0]);*/

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
				    .ticks(10, "%");

				var svg = d3.select(model.target()).selectAll("svg").data([model.data()]);

				svg.enter().append("svg");

				svg.exit().remove();

				svg
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
				 
				//});

				function type(d) {
				  d.frequency = +d.frequency;
				  return d;
				}					
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
	function resolveRoute(route){
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
				this.__prp = mix({},config);
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


			//r = resolveRoute(route);

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
				
				w.write(model).then(function(data){
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

			return self;
		},
	

		//get/set props
		//over: [Bool] overwrite properties with p arg (otherwise, a mixin is performed)
		//args: "get value" =  single string arg
		//		"set value" = string arg, plus second arg
		//		"mixin value" = single obj arg
		//		"set values" = obj arg, true arg for overwrite
		props:function(val, mod){
			return getSet(this, "__prp", val, mod);
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

				if (route === "!error"){
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
							routes[r.path](model,target,r.query);
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
