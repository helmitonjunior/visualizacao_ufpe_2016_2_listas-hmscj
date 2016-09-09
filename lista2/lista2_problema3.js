//Width and height
var margin = {top: 10, right: 20, bottom: 10, left: 20};
var width = 900 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var limitx = 50;
var limity = 50;




function renderDataset(){
    //Dividing the domain space will act as a "zoom-in" when rendering
    //because we are shortening our visual scope. Same to svg canvas size.
    var xScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d[0]; })/4])
        .range([34, width]);
    // Scale limit 34 = 24 (axis) + 10 (circle radius) 
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d[1]; })/4])
	.range([height-34,0]);

	var xAxisScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d[0]; })/4])
        .range([0, width]);
    //Clean scaling, exclusive to scatterplot axis
    var yAxisScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d[1]; })/4])
	.range([height,0]);

    //
    var rScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d[1]; })])
	.range([5,8]);

    //
    var cScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d[1]; })])
	.range(["gray","red"]);
    
    
    //
    var xAxis = d3.axisBottom(xAxisScale).ticks(6);		  
    var xAxisGroup = d3.select("#xAxis")
	.transition()
	.call(xAxis);

    //
    var yAxis = d3.axisLeft(yAxisScale).ticks(6);		  
    var yAxisGroup = d3.select("#yAxis").transition().call(yAxis);		    		  	

    //
    var circleSelection = svg.select("#circles").selectAll("circle")
	.data(dataset);

    //Remove circles that are not needed
    circleSelection
	.exit()
	.attr("fill","rgba(255, 255, 255, 0)")
	.remove();
    
    //Create circles
    //Drawning smaller circles with visible intern area 
    //eases visualization and depolutes the chart.
    //A even better option is to set the circles as some what
    //translucid, so it's clustering can be naturally seen as
    //its colors grows stronger on our scatterchart.
    circleSelection
	.enter()
	.append("circle")
	.attr("cx", function(d) {
	    return xScale(d[0]);
	})
	.attr("cy", function(d) {
	    return yScale(d[1]);
	})
	.attr("r", function(d) {
	    return 7;
	})
	.attr("fill", function(d){
	    return "rgba(0,0,225,0.1)";
	});


    //
    circleSelection
        //.transition()
	// .delay(function(d,i){return 100*i;})
	// .duration(1000)
	.attr("cx", function(d) {
	    return xScale(d[0]);
	})
	.attr("cy", function(d) {
	    return yScale(d[1]);
	})
	.attr("r", function(d) {
	    return 7;
	})
	.attr("fill", function(d){
	    return "rgba(0,0,225,0.1)";
	});
    
}


function init(){
    //create clickable paragraph
    d3.select("body")
	.append("p")
	.text("Click on me!")
	.on("click", function() {
	    renderDataset();
	});
    
    //Create SVG element
    var crudeSVG = d3.select("body")
	.append("svg");

	crudeSVG.on( "mousedown", function() {
	    var p = d3.mouse( this);
	    svg.append("rect")
	    .attr("class", "selection")
	    .attr("rx", 6)
	    .attr("ry", 6)
	    .attr("x", p[0])
	    .attr("y", p[1])
	    .attr("width", 0)
	    .attr("height", 0)
	});

	crudeSVG.on( "mousemove", function() {
	    var s = svg.select( "rect.selection");
	    if( !s.empty()) {
	        var p = d3.mouse(this),
	            d = {
	                x       : parseInt( s.attr("x"), 10),
	                y       : parseInt( s.attr("y"), 10),
	                width   : parseInt( s.attr("width"), 10),
	                height  : parseInt( s.attr("height"), 10)
	            };
	            move = {
	                x : p[0] - d.x,
	                y : p[1] - d.y
	            };

	        if( move.x < 1 || (move.x*2<d.width)) {
	            d.x = p[0];
	            d.width -= move.x;
	        } else {
	            d.width = move.x;       
	        }

	        if( move.y < 1 || (move.y*2<d.height)) {
	            d.y = p[1];
	            d.height -= move.y;
	        } else {
	            d.height = move.y;       
	        }
	       
	        s
	        .attr("x", d.x)
	        .attr("y", d.y)
	        .attr("width", d.width)
	        .attr("height", d.height);
	    }
	})
	.on( "mouseup", function() {
		var s = svg.select("rect.selection");
		var c = svg.selectAll("circle");
    	c.attr("fill", function(d){  
    		var xScale = d3.scaleLinear()
	        	.domain([0, d3.max(dataset, function(d) { return d[0]; })/4])
	        	.range([34, width]);
		    	// Scale limit 34 = 24 (axis) + 10 (circle radius) 
		    var yScale = d3.scaleLinear()
		        .domain([0, d3.max(dataset, function(d) { return d[1]; })/4])
				.range([height-34,0]);
			//re-scaling dataset
			var cx = xScale(d[0]);
			var cy = yScale(d[1]);
			var sx = parseInt( s.attr("x"), 10);
			var sw = parseInt( s.attr("width"), 10);
			var sy = parseInt( s.attr("y"), 10);
			var sh = parseInt( s.attr("height"), 10);
			var okX = false;
			var okY = false;
			//Decide if coordinate X is within selection
			if (sw < 0){
				if ((cx > sw) && (cx < sx)){
					okX = true;
				}
			} else {
				if ((cx > sx) && (cx < sw+sx)){
					okX = true;
				}
			}
			//Decide if coordinate Y is within selection
			if (sh < 0){
				if ((cy > sh) && (cy < sy)){
					okY = true;
				}
			} else {
				if ((cy > sy) && (cy < sh+sy)){
					okY = true;
				}
			}
			//if both are true, then circle is selected
			if (okX && okY){
				return "rgba(225,0,0,0.1)";
			} else {
				return "rgba(0,0,225,0.1)";
			}
		});
	    svg.select( ".selection").remove();
	});


    var svg = crudeSVG
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //
    var circlesGroup = svg.append("g").attr("id","circles");
    
    //
    svg.append("g").attr("id","xAxis").attr("transform","translate(0," + (height - margin.bottom) + ")");
    svg.append("g").attr("id","yAxis").attr("transform","translate(" + (margin.left) + ",0)");



    return svg;
}		  		  		  

//
var svg = init();

