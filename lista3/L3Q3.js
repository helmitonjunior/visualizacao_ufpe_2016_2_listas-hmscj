//Width and height
var margin = {top: 20, right: 30, bottom: 20, left: 30};
var width = 450 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

//
var generator = d3.randomUniform(0, 1);

var xOffset = 0,
	yOffset = 0,
	initialMousePosition = [0,0],
	state = "idle"
	scaleFactor = 1.0;


var svg2;
var svg3;

//			
var dataset;
var acidentes;
var descartados =[];
var selecting=1;
var projection;
var move;



var prot={
acidentes: [],
total: 0,
motocicletas: 0,
ciclistas: 0,
pedestres:0,
ciclomotores:0,
automoveis:0,
};

var meses = [];

var check=false;
var selected =0;

var yinvert;

var scalev3 = d3.scaleLinear()
.domain([0, 120])   // Data space
.range([0, 100]); // Pixel space

	var tipos = [
	    'Motocicletas',
	    'Ciclomotores',
	    'Ciclistas',
	    'Pedestres',
	    'Automóveis e outros'
	];

	var tipomap = {
	    'Cicliestas': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Pedestre': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Motocicleta': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Outros': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Automóveis': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Ciclistas e Pedestres': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Pedestres e ciclista': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Motos e Ciclomotores': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Atropelamentos': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Ciclistas e pedestre': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Colisões': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Motocicletas': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Moto e Ciclomotor': {
	    	color: "gray",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Ciclomotores': {
	    	color: "red",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Ciclistas': {
	    	color: "blue",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Pedestres': {
	    	color: "green",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'Automóveis e outros': {
	    	color: "yellow",
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	};


function color(tipo){
	if (tipo == 'Automóveis e outros'){
		return "yellow";
	}
	else if (tipo == 'Pedestres'){
		return "green";
	}
	else if (tipo == 'Ciclistas'){
		return "blue";
	}
	else if (tipo == 'Ciclomotores'){
		return "red";
	}
	else if (tipo == 'Motocicletas'){
		return "gray";
	} else {
		return "rgba(100,10,20,0.1)"
	}
}

function updateDataset(render){
	d3.json("bairros.geojson", function(json) {
		dataset = json;
		d3.json("merged-2014.geojson", function(geo) {
			acidentes = geo;
			for (var i = 0; i <10; i++){
					meses.push(Object.assign({},prot));
				}
			acidentes.features.forEach(function(d){	
				var m = parseInt(d.properties.data.substring(3,5));
				if (m-3 >= 0 && m-3 < 10){
					meses[m-3].acidentes.push(d);
					meses[m-3].total++;
					switch (d.properties.tipo){
						  case 'Motocicletas':
						    meses[m-3].motocicletas++;
						    break;
						  case 'Ciclomotores':
						    meses[m-3].ciclomotores++;
						    break;
						  case 'Ciclistas':
						    meses[m-3].ciclistas++;
						    break;
						  case 'Pedestres':
						    meses[m-3].pedestres++;
						    break;
						  case 'Automóveis e outros':
						    meses[m-3].automoveis++;
						    break;
						  default:
						    break;
					}
				} else {
					//console.log("Valor descartado:"+d.properties.data);	    
					descartados.push(d);
				}
			});
			yinvert = d3.scaleLinear()
			.domain([0, d3.max(meses, function(d){
					return d.total;
				})
			])
			.range([0, height-20]);
			

			render();
		});
	});
}


function renderDataset(){
    

    //
	var xDomain = [xOffset, (xOffset + d3.max(dataset, function(d) { return d[0]; }))];
	var yDomain = [yOffset, (yOffset + d3.max(dataset, function(d) { return d[1]; }))];
	
	//
	var xCenter = (xDomain[0] + xDomain[1]) / 2;
	var yCenter = (yDomain[0] + yDomain[1]) / 2;
	
	//
    var xScale = d3.scaleLinear()
        .domain([scaleFactor * xDomain[0] + (1 - scaleFactor) * xCenter, scaleFactor * xDomain[1] + (1 - scaleFactor) * xCenter])
        .range([0, width]);
    //
    var yScale = d3.scaleLinear()
        .domain([scaleFactor * yDomain[0] + (1 - scaleFactor) * yCenter, scaleFactor * yDomain[1] + (1 - scaleFactor) * yCenter])
	.range([height,0]);

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
    var xAxis = d3.axisBottom(xAxisScale).ticks(6);		  
    var xAxisGroup = d3.select("#xAxis")
	.transition()
	.call(xAxis);

    //
    var yAxis = d3.axisLeft(yAxisScale).ticks(6);		  
    var yAxisGroup = d3.select("#yAxis").transition().call(yAxis);		


	var tempprojection = d3.geoAlbers()
    	.scale(1)
    	.translate([0,0])
    	.precision(0);

    //Define path generator
    var temppath = d3.geoPath()
        .projection(tempprojection);


    // Compute the bounds of a feature of interest, then derive scale & translate.
    var b = temppath.bounds(dataset);
        scale = scaleFactor / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        translate = [(width - scale * (b[1][0] + b[0][0])) / 2, (height - scale * (b[1][1] + b[0][1])) / 2];

    translate = [translate[0]-xOffset, translate[1]-yOffset];

    	 projection = d3.geoAlbers()
        .scale(scale)
        .translate(translate);

         

    var path = d3.geoPath()
        .projection(projection);


	//Bind data and create one path per GeoJSON feature
	var plot = svg.selectAll("path")
	   .data(dataset.features);

	plot
	   .enter()
	   .append("path")
	   .attr("d", path)
       .attr("stroke", "black")
       .attr("fill", "none");
	 
    	
    // Update 
    plot.attr("d", path)
    .attr("stroke", "black");

	var circleSelection = svg.selectAll("circle")
	.data(acidentes.features);    

	  //Remove circles that are not needed
    circleSelection
	.exit()
	.remove();
    
	tipomap['Automóveis e outros'].pontos = [];
	tipomap['Ciclomotores'].pontos = [];
	tipomap['Ciclistas'].pontos = [];
	tipomap['Motocicletas'].pontos = [];
	tipomap['Pedestres'].pontos = [];



	//Create circles
    circleSelection
	.enter()
	.append("circle")
	.attr("cx", function(d) {
	    return projection([d.properties.longitude, d.properties.latitude])[0];
	})
	.attr("cy", function(d) {
	    return projection([d.properties.longitude, d.properties.latitude])[1];
	})
	.attr("r", function(d) {
	    return 3;
	})
	.attr("fill", function(d){
	    return "rgba(0,0,225, 0.5)";
	});

    //
    circleSelection
        //.transition()
	// .delay(function(d,i){return 100*i;})
	// .duration(1000)
	.attr("cx", function(d) {
	    return projection([d.properties.longitude, d.properties.latitude])[0];
	})
	.attr("cy", function(d) {
	    return projection([d.properties.longitude, d.properties.latitude])[1];
	})
	.attr("r", function(d) {
	    return 3;
	});


	d3.selectAll("circle").each(function(d) {
		tipomap[d.properties.tipo].pontos.push(d);
	});

	var pos = 0;
	var scaleMes = d3.scaleLinear()
    		.domain([0, 150])   // Data space
	    	.range([0, 200]); // Pixel space
	
	svg3.selectAll("rect").remove();

	var v = svg3.selectAll("rect").data(meses);

	v.enter()
	.append("rect")
		.attr("x", function(){
		   	pos += 40;
		   	return pos;
		})
		.attr("y", function(d){
			return height - yinvert(d.total)
		})
		.attr("width",  40)
		.attr("height", function(d){
	       	return yinvert(d.total);
		})
		.attr("fill", "white")
		.attr("stroke", "black");

		pos = 5;      
		var mes= -1;
		var mapmes= ['Mar', 'Abr', 'Mai', 'Jun',
		'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
	    svg3.selectAll("text").remove();
		var q = svg3.selectAll("text").data(meses);
		q.enter()
		 .append("text")
	          .attr("x", function(){
	          	pos += 40;
	          	return pos;
	          })
	          .attr("y", function(d){
	          	return (height - yinvert(d.total))-5
	      	   })
	          .text(function(d){
	          	mes +=1;
	          	return mapmes[mes];
	      	   });


	if (selected == 0){
	    	pos = 0;
			var scale = d3.scaleLinear()
    		.domain([0, 120])   // Data space
	    	.range([0, 200]); // Pixel space
			svg2.selectAll("rect").remove();
			var s = svg2.selectAll("rect").data(tipos);
			s.enter()
			 .append("rect")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", 0)
		          .attr("width",  40)
		          .attr("height", function(d){
		          	return tipomap[d].pontos.length;
		      	   })
		          .attr("fill",function(d){
		          	if (check){
		          		return tipomap[d].color
		          	}else {
		          		return "rgba(0,0,0,0.05)"
		          	}
				})
		        .on("click", function(d){		          	
		          	if (tipomap[d].filter){ 
		          		tipomap[d].filter = false;
		          	} else {
		          		tipomap[d].filter = true;
		          	}
		          	var c = d3.select("svg").selectAll("circle");
		    		c.attr("fill", function(d){  
		    			tipo = d.properties.tipo;
		    			
		    			if (tipomap[tipo].filter){		
		    				if  (d.properties.select){						
								return color(tipo);
							} else {
								return "rgba(0,0,255,0.5)";
							}	
						
						} else {
							return "rgba(0,0,0,0.05)";										
						}	
		    		});
		          	renderDataset();
		        });


		    pos = 0;      
		    svg2.selectAll("text").remove();
			var t = svg2.selectAll("text").data(tipos);
			t.enter()
			 .append("text")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", function(d){
		          	return tipomap[d].pontos.length+15;
		      	   })
		          .text(function(d){
		          	return tipomap[d].pontos.length;
		      	   });
        }
}

function init(){
	d3.select('#check')
	.on("change", function(){
		check = this.checked;
		var c = d3.select("svg").selectAll("circle");
		c.attr("fill", function(d){  
			tipo = d.properties.tipo;

			if (tipomap[tipo].filter){
				if  (d.properties.select && check){
					return color(tipo);
				} else if (d.properties.select && !check) {
					return "rgba(255,0,0,0.5)"
				}else {
					return "rgba(0,0,255,0.5)"
				}	
			} else {
				return "rgba(0,0,0,0.05)"										
			}	
		});

		var s = svg2.selectAll("rect");
		if (check){	
			s.attr("fill", function(d){
				return color(d)
			});
		} else {
			s.attr("fill", function(d){
				return "rgba(0,0,0,0.05)"
			});
		}
		renderDataset();
	});

    //create clickable paragraph
    d3.select("body")
	.append("p")
	.text("Click on me!")
	.on("click", function() {
	    updateDataset(renderDataset);
	});
    
    //Create SVG element
    var svg = d3.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg2 = d3.select("body")
	.append("svg")
	.attr("width", (width + margin.left + margin.right)-100)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("width", (width + margin.left + margin.right)-100)
	.attr("height", height + margin.top + margin.bottom);
	

	svg3 = d3.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom);	


//	svg.append("g").attr("id","xAxis").attr("transform","translate(0," + (height - margin.bottom) + ")");
//    svg.append("g").attr("id","yAxis").attr("transform","translate(" + (margin.left) + ",0)");

	// Mouse functions
	d3.select("svg")
	.on("mousedown", function(d)
	{
		if (d3.event.button != 0) return;
		d3.event.stopPropagation();
		d3.event.preventDefault();
		var p = d3.mouse(this);
		initialMousePosition = p;
		state = "pan";
	})
	.on("mousemove",function(d){
		d3.event.stopPropagation();
		d3.event.preventDefault();
	    if(state === "pan"){
			var p = d3.mouse( this);

				move = 
				{
					x : p[0] - initialMousePosition[0],
					y : p[1] - initialMousePosition[1]
				};			
			xOffset -= move.x;
			yOffset -= move.y;
			initialMousePosition = p;

			renderDataset();	
		} else if (state === "select" && selecting == 0){ //selecting, not panning
		var s = svg.select( "rect.selection");
	    if( !s.empty()) {
	        var p = d3.mouse(this),
	            d = {
	                x       : parseInt( s.attr("x"), 10),
	                y       : parseInt( s.attr("y"), 10),
	                width   : parseInt( s.attr("width"), 10),
	                height  : parseInt( s.attr("height"), 10)
	            };

	            p[0] = p[0]-margin.left;
	            p[1] = p[1]-margin.top;
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
	        .attr("width", d.width, 10)
	        .attr("height", d.height,10);
	    }
		}
	})
	.on("mouseup",function(d){	
		d3.event.stopPropagation();
		d3.event.preventDefault();
		if (selecting == 0) {
	    	if (state == "select"){
				tipomap['Automóveis e outros'].selecao = [];
				tipomap['Ciclomotores'].selecao = [];
				tipomap['Ciclistas'].selecao = [];
				tipomap['Motocicletas'].selecao = [];
				tipomap['Pedestres'].selecao = [];
		    	
		    	selected =0;
		    	var s = svg.select("rect.selection");
				var c = d3.select("svg").selectAll("circle");
    			c.attr("fill", function(d){  
    				var xScale = d3.scaleLinear()
	   	    	 		.domain([0, d3.max(dataset, function(d) { return d[0]; })/4])
	   	     			.range([34, width]);
			    		// Scale limit 34 = 24 (axis) + 10 (circle radius) 
			    	var yScale = d3.scaleLinear()
			        	.domain([0, d3.max(dataset, function(d) { return d[1]; })/4])
						.range([height-34,0]);
					//re-scaling dataset
					var point = projection([d.properties.longitude, d.properties.latitude]);
					var cx = point[0];
					var cy = point[1];
					var sx = parseInt( s.attr("x"), 10);
					var sy = parseInt( s.attr("y"), 10);
					var sw = parseInt( s.attr("width"), 10);
					var sh = parseInt( s.attr("height"), 10);
					var okX = false;
					var okY = false;
					tipo = d.properties.tipo;
						//Decide if coordinate X is within selection
					if (move.x > 0){
						if (cx < sw+sx && cx > sx){
							okX = true;
						}
					} else {
						if (cx > sx && cx < sx+sw){
							okX = true;
						}
					}
					if (move.y > 0){
						if (cy > sy && cy < sy+sh){
							okY = true;
						}
					} else {
						if ( cy > sy && cy <sy+sh){
							okY = true;
						}
					}

					//if both are true, then circle is selected
					if (okX && okY){	
						selected++;
						var filter = tipomap[tipo].filter;					
						d.properties.select = true;	
						tipomap[tipo].selecao.push(d);
						if (check && filter){
							return color(tipo);
						} else if  (!filter){
							return "rgba(0,0,0,0.05)" 
						} else if (!check && filter){
							return "rgba(255,0,0,0.5)"
						}
												
					} else {
						d.properties.select = false;
						if (!tipomap[tipo].filter){	
							return "rgba(0,0,0,0.05)"
						} else {
							return "rgba(0,0,255,0.5)"
						}
					}
			});
		    svg.select( ".selection").remove();
		    } 
		selecting = 1;
		} else {
			svg.select(".selection").remove();
			selecting = 0;
		}
		var scale = d3.scaleLinear()
    		.domain([0, 120])   // Data space
	    	.range([0, 200]); // Pixel space
		var pos=0;
		svg2.selectAll("rect").remove();
	    if (selected == 0){

			svg2.selectAll("rect").remove();
			var s = svg2.selectAll("rect").data(tipos);
			s.enter()
			 .append("rect")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", 0)
		          .attr("width",  40)
		          .attr("height", function(d){
		          	return tipomap[d].pontos.length;
		      	   })
		        .attr("fill",function(d){
		          	if (check){
		          		return tipomap[d].color
		          	}else {
		          		return "rgba(0,0,0,0.05)"
		          	}
				})
				.on("click", function(d){
		          	
		          	if (tipomap[d].filter){ 
		          		tipomap[d].filter = false;
		          	} else {
		          		tipomap[d].filter = true;
		          	}
		          	var c = d3.select("svg").selectAll("circle");
		    		c.attr("fill", function(d){  
		    			tipo = d.properties.tipo;
		    			if (tipomap[tipo].filter){		
		    				
		    				if  (d.properties.select==true){		
								return color(tipo);
							} else {
								return "rgba(0,0,255,0.5)";
							}	
						
						} else {
							return "rgba(0,0,0,0.05)";										
						}	
		    		});
		          	renderDataset();
		        });

			pos = 0;
		    svg2.selectAll("text").remove();
			var s = svg2.selectAll("text").data(tipos);
			s.enter()
			 .append("text")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", function(d){
		          	return tipomap[d].pontos.length;
		      	   })
		          .text(function(d){
		          	return tipomap[d].pontos.length;
		      	   });

	    } else {	

			svg2.selectAll("rect").remove();
			var s = svg2.selectAll("rect").data(tipos);
			s.enter()
			 .append("rect")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", 0)
		          .attr("width",  40)
		          .attr("height", function(d){
		          	return tipomap[d].selecao.length;
		      	   })
		          .attr("fill",function(d){
		          	if (check){
		          		return tipomap[d].color
		          	}else {
		          		return "rgba(0,0,0,0.05)"
		          	}
				})
		          .on("click", function(d){
		          	
		          	if (tipomap[d].filter){ 
		          		tipomap[d].filter = false;
		          	} else {
		          		tipomap[d].filter = true;
		          	}
		          	var c = d3.select("svg").selectAll("circle");
		    		c.attr("fill", function(d){  
		    			tipo = d.properties.tipo;
		    			if (tipomap[tipo].filter){		
		    				
		    				if  (d.properties.select == true){		
								return color(tipo);
							} else {
								return "rgba(0,0,255,0.5)";
							}	
						
						} else {
							return "rgba(0,0,0,0.05)";										
						}	
		    		});
		          	renderDataset();
		        });;
			pos = 0;
		    svg2.selectAll("text").remove();
			var t = svg2.selectAll("text").data(tipos);
			t.enter()
			 .append("text")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", function(d){
		          	return tipomap[d].selecao.length+15;
		      	   })
		          .text(function(d){
		          	return tipomap[d].selecao.length;
		      	   });
		}
		console.log("Automóveis e outros :"+tipomap["Automóveis e outros"].selecao.length);
		console.log("Ciclistas :"+tipomap["Ciclistas"].selecao.length);
		console.log("Ciclomotores :"+tipomap["Ciclomotores"].selecao.length);
	    console.log("Motocicletas :"+tipomap["Motocicletas"].selecao.length);
		console.log("Pedestres :"+tipomap["Pedestres"].selecao.length);
		
	    state = "idle";
	    renderDataset();
	})
	.on("wheel.zoom",function(d){
	    d3.event.stopPropagation();
	    d3.event.preventDefault();
	    if(d3.event.wheelDeltaY > 0)
			scaleFactor *= 1.1;
	    else
			scaleFactor *= 0.9;
		renderDataset();  
	})
	.on("contextmenu", function(data, index) {
    	if (d3.event.button != 2) return;
    	state = "select";
    	d3.event.preventDefault();
	    d3.event.stopPropagation();
	    var p = d3.mouse( this);
	    svg.append("rect")
	    .attr("class", "selection")
	    .attr("rx", 6)
	    .attr("ry", 6)
	    .attr("x", p[0]-margin.left)
	    .attr("y", p[1]-margin.top)
	    .attr("width", 0)
	    .attr("height", 0)
	    .attr("stroke", "gray")
	    .attr("stroke-width", "1px")
	    .attr("stroke-opacity", "0.5")
	    .attr('fill', 'transparent');
	    renderDataset();
	});
	
  return svg;
}		  		  		  

//


















var svg = init();