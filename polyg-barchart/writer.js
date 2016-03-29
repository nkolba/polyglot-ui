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