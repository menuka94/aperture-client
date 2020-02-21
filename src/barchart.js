class BarChart {
	constructor(timeDim) {
	    this._timeDim = timeDim
	};
	
	clear() {
		d3.select("#barchart").selectAll("*").remove();
	}
	
	select(t, d, me, dataset, dataLabels, feature, color) {
		var d1 = dataLabels[dataset.indexOf(d)-1]
		var d2 = dataLabels[dataset.indexOf(d)]
		if(d2 === undefined){ d2 = Number.MAX_SAFE_INTEGER }
		var rule = {name:"dist", d1:d1, d2:d2, feature:feature}
		me._timeDim.highlightPolygons(me._timeDim.loadedTime, color, rule)
		d3.select(t).attr("fill", "#FDBC0A")
	}
	
	deselect(t, d, me, dataset, dataLabels, feature, color) {
		var d1 = dataLabels[dataset.indexOf(d)-1]
		var d2 = dataLabels[dataset.indexOf(d)]
		if(d2 === undefined){ d2 = Number.MAX_SAFE_INTEGER }
		var rule = {name:"dist", d1:d1, d2:d2, feature:feature}
		me._timeDim.removeMask(me._timeDim.loadedTime, color, rule)
		d3.select(t).attr("fill", d3.rgb(color))
	}
	
	make(dataset, dataLabels, feature, color, unit) {
		// Visualization attributes
		//-----------
		var w = 650;
		var h = 150;
		var barPadding = 1;

		// Scales
		//-----------

		var xScale = d3.scaleOrdinal(d3.range(dataset.length), [0, w]);

		var yScale = d3.scaleLinear([0, d3.max(dataset)], [0, h]);

		// SVG
		//-----------
		var svg = d3.select("#barchart")
		  .append("svg")
		  .attr("width", w)
		  .attr("height", h+35);
		  
		var title = svg.append("text")
			.text(feature+" ("+unit+")")
			.attr("text-anchor", "middle")
			.attr("x", function(d, i) {
				return w/2;
			})
			.attr("y", function(d) {
				return h - 135;
			})
			.attr("font-family", "Helvetica")
		    .attr("font-size", "18px")

		// Bars
		//-----------
		
		var me = this
		var bars = svg.selectAll('rect')
		  .data(dataset)
		  .enter()
		  .append('rect')
		  .attr('x', function(d, i) {
			return xScale(i);
		  })
		  .attr('y', function(d) {
			return h - yScale(d) + 20;
		  })
		  .attr('width', xScale.bandwidth())
			.attr('height', function(d) {
			return yScale(d);
		  })
		  .attr('fill', function(d) {
			return d3.rgb(color);
		  })
			.on('mouseover', function(d) {
				if(!d3.select(this).attr("clicked")){
					me.select(this, d, me, dataset, dataLabels, feature, color)
				}
		  })
			.on('mouseout', function(d) {
				//Remove the tooltip
				if(!d3.select(this).attr("clicked")){
					me.deselect(this, d, me, dataset, dataLabels, feature, color)
				}
			})
			.on("click", function(d){
				if(!d3.select(this).attr("clicked")){
					d3.select(this).attr("clicked", true)
					me.select(this, d, me, dataset, dataLabels, feature, color)
				} else {
					d3.select(this).attr("clicked", null)
					me.deselect(this, d, me, dataset, dataLabels, feature, color)
				}
		  });

		// Labels
		//-----------
		
		var labels = svg.selectAll("text")
		  .data(dataset)
		  .enter()
		  .append("text")
			.style("pointer-events", "none")
		  .text(function(d) {
			return d;
		  })
		  .attr("text-anchor", "middle")
			.attr("x", function(d, i) {
			return xScale(i) + xScale.bandwidth() / 2;
			})
			.attr("y", function(d) {
			return h - yScale(d) + 34;
			})
		  .attr("font-family", "sans-serif")
		  .attr("font-size", "11px")
		  .attr("fill", "white")
		  
		var dlabels = svg.selectAll("dataLabels")
		  .data(dataLabels)
		  .enter()
		  .append("text")
			.style("pointer-events", "none")
		  .text(function(d) {
			return Math.round(d);
		  })
		  .attr("text-anchor", "middle")
			.attr("x", function(d, i) {
			return xScale(i) + xScale.bandwidth() / 2;
			})
			.attr("y", function(d) {
			return h + 35;
			})
		  .attr("font-family", "sans-serif")
		  .attr("font-size", "11px")
		  .attr("fill", "black")
	};
};
