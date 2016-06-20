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
