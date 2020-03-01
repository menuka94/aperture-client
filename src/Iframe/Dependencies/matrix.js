class CorrMatrix {
	constructor(timeDim) {
	    this._timeDim = timeDim
	};
	
	remove(){
		d3.select("#grid").selectAll("*").remove();
		d3.select("#legend").selectAll("*").remove();
	}
	
	select(d, t, x, y, margin){
		var color = d3.rgb(d3.select(t).style("fill"));
		var dxdy = [d.column_x, d.column_y]
		var rule = {name:"corr", dx:dxdy[0], dy:dxdy[1], corr:d.correlation}
		this._timeDim.highlightPolygons(this._timeDim.loadedTime, color, rule)
		d3.select(t).classed("selected", true);

		d3.select(".tip")
			.style("display", "block")
			.html("Correlation: " + d.correlation.toFixed(2));

		var row_pos = y(d.row);
		var col_pos = x(d.column);
		var tip_pos = d3.select(".tip").node().getBoundingClientRect();
		var tip_width = tip_pos.width;
		var tip_height = tip_pos.height;
		var grid_pos = d3.select("#grid").node().getBoundingClientRect();
		var grid_left = grid_pos.left;
		var grid_top = grid_pos.top;
		var map_pos = d3.select("#mapid").node().getBoundingClientRect();

		var left = grid_left + col_pos + margin.left + (x.bandwidth() / 2) - (tip_width / 2);
		var top = grid_top + row_pos + margin.top - tip_height - 5 + map_pos.height/2 - map_pos.top + grid_pos.height/2.2;

		d3.select(".tip")
			.style("left", left + "px")
			.style("top", top + "px");

		d3.select(".x.axis .tick:nth-of-type(" + d.column + ") text").classed("selected", true);
		d3.select(".y.axis .tick:nth-of-type(" + d.row + ") text").classed("selected", true);
		d3.select(".x.axis .tick:nth-of-type(" + d.column + ") line").classed("selected", true);
		d3.select(".y.axis .tick:nth-of-type(" + d.row + ") line").classed("selected", true);
	};
	
	deselect(d, t) {
		var color = d3.rgb(d3.select(t).style("fill"));
		var dxdy = [d.column_x, d.column_y]
		var rule = {name:"corr", dx:dxdy[0], dy:dxdy[1], corr:d.correlation}
		this._timeDim.removeMask(this._timeDim.loadedTime, color, rule)
		d3.select(t).classed("selected", false);
		d3.select(".tip").style("display", "none");
		d3.select(".x.axis .tick:nth-of-type(" + d.column + ") text").classed("selected", false);
		d3.select(".y.axis .tick:nth-of-type(" + d.row + ") text").classed("selected", false);
		d3.select(".x.axis .tick:nth-of-type(" + d.column + ") line").classed("selected", false);
		d3.select(".y.axis .tick:nth-of-type(" + d.row + ") line").classed("selected", false);
		var selectedRects = d3.selectAll("rect.selected").each(function(rect) {;
			d3.select(".x.axis .tick:nth-of-type(" + rect.column + ") text").classed("selected", true);
			d3.select(".y.axis .tick:nth-of-type(" + rect.row + ") text").classed("selected", true);
			d3.select(".x.axis .tick:nth-of-type(" + rect.column + ") line").classed("selected", true);
			d3.select(".y.axis .tick:nth-of-type(" + rect.row + ") line").classed("selected", true);
		})
	};
	
	make(corrnew, feautres) {
		d3.select("body").append("div").attr("class", "tip").style("display", "none");
		var cols = feautres
		var corr = []
		var me = this
		for (var i = 0; i < corrnew.length; i++){
			for (var j = 0; j < corrnew[i].length; j++){
				if (cols[i] === undefined || cols[j] === undefined) continue
				if(i === j){
					corr.push({"column_x":cols[i],"column_y":cols[j],"correlation":1,"row":i,"column":j})
				} else {
					corr.push({"column_x":cols[i],"column_y":cols[j],"correlation":corrnew[i][j],"row":i,"column":j})
				}
			}
		}
		
		var extent = d3.extent(corr.map(function(d){ return d.correlation; }).filter(function(d){ return d !== 1; }));
		
		var vnum = extent[0]
		extent[0] = Math.max(extent[0]*-3,-1)
		extent[1] = Math.min(extent[1]*3,1)
		extent.sort()

		var grid = data2grid.grid(corr);
		var rows = d3.max(grid, function(d){ return d.row; });
		var margin = {top: 30, bottom: 1, left: 90, right: 1};

		var dim = d3.min([window.innerWidth * .22, window.innerHeight * .22]);

		//var width = dim - margin.left - margin.right, height = dim - margin.top - margin.bottom;
		var width = dim, height = dim;
		//var width = 500
		//var height = 500
		
		d3.select("#grid").selectAll("*").remove();
		var svg = d3.select("#grid").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

		var padding = .1;

		var x = d3.scaleBand()
		  .range([0, width])
		  .paddingInner(padding)
		  .domain(d3.range(1, rows + 1));

		var y = d3.scaleBand()
		  .range([0, height])
		  .paddingInner(padding)
		  .domain(d3.range(1, rows + 1));

		var c = chroma.scale(["tomato", "white", "steelblue"])
		  .domain([extent[0], 0, extent[1]]);

		var x_axis = d3.axisTop(y).tickFormat(function(d, i){ return cols[i]; });
		var y_axis = d3.axisLeft(x).tickFormat(function(d, i){ return cols[i]; });

		svg.append("g")
			.attr("class", "x axis")
			.call(x_axis);

		svg.append("g")
			.attr("class", "y axis")
			.call(y_axis);

		svg.selectAll("rect")
			.data(grid, function(d){ return d.column_a + d.column_b; })
			.enter().append("rect")
			.attr("x", function(d){ return x(d.column); })
			.attr("y", function(d){ return y(d.row); })
			.attr("width", x.bandwidth())
			.attr("height", y.bandwidth())
			.style("fill", function(d){ return c(d.correlation); })
			.style("opacity", 1e-6)
			.transition()
			.style("opacity", 1);
		
		svg.selectAll("rect")
		  .on("mouseover", function(d){
			if(!d3.select(this).attr("clicked")){
				me.select(d, this, x, y, margin)
			}
		  })
		  .on("mouseout", function(d){
			if (!d3.select(this).attr("clicked")){
				me.deselect(d, this)
			}
		  })
		  .on("click", function(d){
			if(!d3.select(this).attr("clicked")){
				d3.select(this).attr("clicked", true)
				me.select(d, this, x, y, margin)
			} else {
				d3.select(this).attr("clicked", null)
				me.deselect(d, this)
			}
		  });

		// legend scale
		var legend_top = 15;
		var legend_height = 15;

		d3.select("#legend").selectAll("*").remove();
		var legend_svg = d3.select("#legend").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", legend_height + legend_top)
			.append("g")
			.attr("transform", "translate(" + margin.left + ", " + legend_top + ")");

		var defs = legend_svg.append("defs");

		var gradient = defs.append("linearGradient")
			.attr("id", "linear-gradient");

		var stops = [{offset: 0, color: "tomato", value: extent[0]}, {offset: .5, color: "white", value: 0}, {offset: 1, color: "steelblue", value: extent[1]}];
		  
		gradient.selectAll("stop")
			.data(stops)
			.enter().append("stop")
			.attr("offset", function(d){ return (100 * d.offset) + "%"; })
			.attr("stop-color", function(d){ return d.color; });

		legend_svg.append("rect")
			.attr("width", width)
			.attr("height", legend_height)
			.style("fill", "url(#linear-gradient)");

		legend_svg.selectAll("text")
			.data(stops)
			.enter().append("text")
			.attr("x", function(d){ return width * d.offset; })
			.attr("dy", -3)
			.style("text-anchor", function(d, i){ return i == 0 ? "start" : i == 1 ? "middle" : "end"; })
			.text(function(d, i){ return d.value.toFixed(2) + (i == 2 ? ">" : ""); })
			
	};
};
