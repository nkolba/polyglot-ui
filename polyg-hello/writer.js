var Base = require("../writer.js");

module.exports =  Base.extend({

	routes:function(){

		return {
			"!default":function(model){
				var t = d3.select(model.props("target"));

				var m = t.selectAll(".message").data([model.message()]);

				m.enter()
					.append("div")
					.classed("message",true);

				m.exit().remove();

				m.style("opacity","0")
					.text(function(d){return d;})
					.transition().duration(500)
					.style("opacity","1");
						
			}
		};
	}

});