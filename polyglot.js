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

