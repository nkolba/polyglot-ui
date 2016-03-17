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

