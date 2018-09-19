var dragrect = d3.behavior.drag()
	.on("drag", function (d,i) {
		var coordinates = d3.mouse(this);
		d.x = coordinates[0];
        d.y = coordinates[1];
		d3.select(this).attr('x', d.x).attr('y', d.y);
	})
	
var dragcirc = d3.behavior.drag()
	.on("drag", function (d,i) {
		var coordinates = d3.mouse(this);
		d.cx = coordinates[0];
        d.cy = coordinates[1];
        d3.select(this).attr('cx', d.cx).attr('cy', d.cy);
	})
	

var colors = ["blue","red","green","orange","yellow","white","purple"];

var rectdata = new Array(Math.round(Math.random()*20));
for (var i = 0; i < rectdata.length; i++){
	rectdata[i] = {x: Math.random()*2000, y: Math.random()*1000, width: Math.random()*300, height: Math.random()*300,
					stroke: colors[Math.floor(Math.random() * colors.length)], fill: colors[Math.floor(Math.random() * colors.length)]};
}

var circdata = new Array(Math.round(Math.random()*20));
for (var i = 0; i < circdata.length; i++){
	circdata[i] = {cx: Math.random()*2000, cy: Math.random()*1000, r: Math.random()*100,
					stroke: colors[Math.floor(Math.random() * colors.length)], fill: colors[Math.floor(Math.random() * colors.length)]};
}


var sampleSVG = d3.select("#viz")
	.append("svg")
	.attr("width", 2000)
	.attr("height", 1500);    

sampleSVG.selectAll("circle").data(circdata).enter().append("circle")
	.style("stroke", function (d) { return d.stroke; })
	.style("fill", function (d) { return d.fill; })
	.attr("r", function (d) { return d.r; })
	.attr('cx', function (d) { return d.cx; })
    .attr('cy', function (d) { return d.cy; })
	.call(dragcirc)
	.on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
	.on("mouseout", function(){d3.select(this).style("fill", function (d) { return d.fill; });});

sampleSVG.selectAll("rect").data(rectdata).enter().append("rect")
	.style("stroke", function (d) { return d.stroke; })
	.style("fill", function (d) { return d.fill; })
	.attr("width", function (d) { return d.width; })
	.attr("height", function (d) { return d.height; })
	.attr('x', function (d) { return d.x; })
    .attr('y', function (d) { return d.y; })
	.call(dragrect)
	.on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
	.on("mouseout", function(){d3.select(this).style("fill", function (d) { return d.fill; });});


