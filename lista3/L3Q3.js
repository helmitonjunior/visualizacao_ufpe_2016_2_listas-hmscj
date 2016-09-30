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

var bigscale = d3.scaleLinear()
	.domain([0, 660])   // Data space
	.range([0, 250]); // Pixel space	
var scalerect = d3.scaleLinear()
	.domain([0, 200])   // Data space
	.range([0, 80]); // Pixel space


var filterMonth = Array(10);

var prot={
acidentes: [],
total: 0,
motocicletas: 0,
ciclistas: 0,
pedestres:0,
colisoes:0,
automoveis:0,
};

	var tipos = [
	    'Motocicletas',
	    'Ciclistas',
	    'Pedestres',
	    'Colisões',
	    'Automóveis e outros'
	];

var meses = [];

var check=false;
var selected =0;

var yinvert;

var scalev3 = d3.scaleLinear()
.domain([0, 120])   // Data space
.range([0, 100]); // Pixel space



	var tipomap = {
	    'red': {
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'yellow': {
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'blue': {
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'green': {
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
	    },
	    'purple': {
	    	filter: true,
	    	pontos:[] ,
	    	selecao:[],
		}
	};


function color(tipo){
	if (tipo == 'Automóveis e outros' || tipo == 'Automóveis'
	 || tipo == 'Outros' || tipo == 'automoveis'){
		return "yellow";
	}
	else if (tipo == 'Pedestres' || tipo == 'Atropelamentos'
		|| tipo == 'Pedestre' || tipo == 'pedestres'){
		return "green";
	}
	else if (tipo == 'Ciclistas' || tipo ==  'Cicliestas' ||
	  tipo ==  'Pedestres e ciclista' || tipo ==  'Ciclistas e pedestre' ||
	  tipo ==  'Ciclistas e Pedestres' || tipo === 'ciclistas'){
		return "red";
	}
	else if (tipo == 'Colisões' || tipo == 'colisoes'){
		return "blue";
	}
	else if (tipo == 'Motocicletas' || tipo == 'Motocicleta' ||
	 tipo == 'Moto e Ciclomotor' || tipo == 'Motos e Ciclomotores'
	 || tipo == 'Ciclomotores' || tipo == 'motocicletas'){
		return "purple";
	} else {
		return "gray" //unexpected type
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
					meses[m-3].acidentes.push(Object.assign({},d));
					meses[m-3].total++;
					switch (color(d.properties.tipo)){
						  case 'purple':
						    meses[m-3].motocicletas++;
						    break;
						  case 'blue':
						    meses[m-3].colisoes++;
						    break;
						  case 'red':
						    meses[m-3].ciclistas++;
						    break;
						  case 'green':
						    meses[m-3].pedestres++;
						    break;
						  case 'yellow':
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
			
			filterMonth.fill(1);
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
    
	tipomap['red'].pontos = [];
	tipomap['blue'].pontos = [];
	tipomap['green'].pontos = [];
	tipomap['yellow'].pontos = [];
	tipomap['purple'].pontos = [];



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
	    return "rgba(0,150,225, 0.5)";
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
		tipomap[color(d.properties.tipo)].pontos.push(d);
	});

	var pos = 0;
	var scaleMes = d3.scaleLinear()
    		.domain([0, 150])   // Data space
	    	.range([0, 200]); // Pixel space
	
	//svg3.selectAll("rect").remove();

	var bars = svg3
	.selectAll("g")
	.data(meses)
	.enter()
	.append("g");
	// 
	bars
	.each(function(mes, mesIndex){

		var rects = Object.keys(mes).filter(function(item){
			return item != 'total' && item != 'acidentes';
		}).map(function(item){
			return {
				value: mes[item],
				tipo: item
			};
		})
		.sort(function(prev, curr){
		 	return prev.tipo.localeCompare(curr.tipo);
		});

		var values = rects.map(function(d){return d.value});

		rects = rects.map(function(rect, i){
			var range = values.slice(0,i+1);

			rect.offset = (!range.length) ? 0 : range.reduce(function(prev, cur){
				return prev+cur;
			});

			return rect;
		});

		var acidentescale = d3.scaleLinear()
		.range([0, 1])
		.domain([
			0,
			mes.total
		]);



		d3.select(this)
		.selectAll("rect")
		.data(rects)
		.enter()
		.append("rect")
		.attr("x", function(d, i){
          	return ((mesIndex+1)*40)+3;
		})
		.attr("y", function(d, i){
			return height - yinvert(d.offset);
		})
		.attr("width",  40)
		.attr("height", function(d){
	       	return parseFloat(acidentescale(d.value) * yinvert(mes.total));
		})
		.attr("fill", function(d){
			return color(d.tipo);
		});
	});

	pos = 5;
	var mes= -1;
	var mapmes= ['Mar', 'Abr', 'Mai', 'Jun',
	'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    svg3.selectAll("text").remove();
	var q = svg3.selectAll("text").data(meses);
	q.enter()
	 .append("text")
          .attr("x", function(){
            pos += 41;
            return pos;
          })
          .attr("y", function(d){
            return (height - yinvert(d.total))-5
           })
          .on("click", function(d, i){	
			if (filterMonth[i] == 1){
		        filterMonth[i] = 0;
		    } else {
		       	filterMonth[i] = 1;
		     }
		     var c = d3.select("svg").selectAll("circle");
		    		c.attr("fill", function(d){  
		    			tipo = color(d.properties.tipo);
		    			var m = parseInt(d.properties.data.substring(3,5));
		    			if (filterMonth[m-3] == 0){
		    				return "rgba(0,0,0,0.05)";	
		    			}
		    			if (tipomap[tipo].filter){	
		    				if  (d.properties.select && check){						
								return color(d);
							} else if  (d.properties.select && !check){						
								return "rgba(0,150,255,0.5)";
							} else {
								return "rgba(0,150,255,0.5)";
							}	
						
						} else {
							return "rgba(0,0,0,0.05)";										
						}	
					});
		    })
          .text(function(d){
            mes +=1;
            return mapmes[mes];
           });

	if (selected == 0){
	    	pos = 0;
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
		          		var target = color(d);
		          		if (tipomap[target].pontos.length > 200){
		          			return bigscale(tipomap[color(d)].pontos.length);
		          	}
		          	return scalerect(tipomap[color(d)].pontos.length);
		      	   })
		          .attr("fill",function(d){
		          	if (check){
		          		return color(d)
		          	}else {
		          		return "rgba(0,0,0,0.1)"
		          	}
				})
		        .on("click", function(d){		          	
		          	if (tipomap[target].filter){ 
		          		tipomap[target].filter = false;
		          	} else {
		          		tipomap[target].filter = true;
		          	}
		          	var c = d3.select("svg").selectAll("circle");
		    		c.attr("fill", function(d){  
		    			tipo = color(d.properties.tipo);
		    			var m = parseInt(d.properties.data.substring(3,5));
		    			if (filterMonth[m-3] == 0){
		    				return "rgba(0,0,0,0.05)";	
		    			}
		    			if (tipomap[tipo].filter){	
		    				if  (d.properties.select && check){						
								return color(d);
							} else if  (d.properties.select && !check){						
								return "rgba(0,150,255,0.5)";
							} else {
								return "rgba(0,150,255,0.5)";
							}	
						
						} else {
							return "rgba(0,0,0,0.05)";										
						}	
		    		});
		          	renderDataset();
		        });

		    pos = 2;      
		    svg2.selectAll("text").remove();
			var t = svg2.selectAll("text").data(tipos);
			t.enter()
			 .append("text")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", function(d){
		          	var target = color(d);
		          	if (tipomap[target].selecao.length > 200){
		          		return bigscale(tipomap[target].selecao.length)+15;
		          	} else if (selected == 0){
		          		var y = tipomap[target].pontos.length;
		         		if (y > 200){
		         			return bigscale(y)+15;
		         		} else {
		          			return scalerect(y)+15;
		          		}
		          	} else {
		          		return tipomap[target].selecao.length+10;
		      	   	}
		      	   })
		          .text(function(d){
		          	if (selected == 0){
		          		return tipomap[color(d)].pontos.length;
		          	} else{
		          		return tipomap[color(d)].selecao.length;
		      	   	}
		      	   });
        }
}

function init(){
	d3.select('#check')
	.on("change", function(){
		check = this.checked;
		var c = d3.select("svg").selectAll("circle");
		c.attr("fill", function(d){  
			tipo = color(d.properties.tipo);
			var m = parseInt(d.properties.data.substring(3,5));
		    if (filterMonth[m-3] == 0){
		    	return "rgba(0,0,0,0.05)";	
		    }
			if (tipomap[tipo].filter){
				if  (d.properties.select && check){
					return tipo;
				} else if (d.properties.select && !check) {
					return "rgba(255,0,0,0.5)"
				}else {
					return "rgba(0,150,255,0.5)"
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
				return "rgba(0,0,0,0.1)"
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
	                x       : parseFloat( s.attr("x"), 10),
	                y       : parseFloat( s.attr("y"), 10),
	                width   : parseFloat( s.attr("width"), 10),
	                height  : parseFloat( s.attr("height"), 10)
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
				tipomap['red'].selecao = [];
				tipomap['yellow'].selecao = [];
				tipomap['green'].selecao = [];
				tipomap['purple'].selecao = [];
				tipomap['blue'].selecao = [];
		    	
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
					tipo = color(d.properties.tipo);
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
						var m = parseInt(d.properties.data.substring(3,5));
		    			if (filterMonth[m-3] == 0){
		    				return "rgba(0,0,0,0.05)";	
		    			}
						if (check && filter){
							return color(d.properties.tipo);
						} else if  (!filter){
							return "rgba(0,0,0,0.05)" 
						} else if (!check && filter){
							return "rgba(255,0,0,0.5)"
						}
												
					} else {
						d.properties.select = false;
						var m = parseInt(d.properties.data.substring(3,5));
		    			if (filterMonth[m-3] == 0){
		    				return "rgba(0,0,0,0.05)";	
		    			}
						if (!tipomap[tipo].filter){	
							return "rgba(0,0,0,0.05)"
						} else {
							return "rgba(0,150,255,0.5)"
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
		           	var target =color(d);
		           	if (tipomap[target].pontos.length > 200){
		          		return bigscale(tipomap[color(d)].pontos.length);
		          	}
		          	return scalerect(tipomap[color(d)].pontos.length);
		      	   })
		        .attr("fill",function(d){
		          	if (check){
		          		return color(d)
		          	}else {
		          		return "rgba(0,0,0,0.1)"
		          	}
				})
				.on("click", function(d){
		          	var target =color(d);
		          	if (tipomap[target].filter){ 
		          		tipomap[target].filter = false;
		          	} else {
		          		tipomap[target].filter = true;
		          	}
		          	var c = d3.select("svg").selectAll("circle");
		    		c.attr("fill", function(d){  
		    			tipo = color(d.properties.tipo);
		    			var m = parseInt(d.properties.data.substring(3,5));
		    			if (filterMonth[m-3] == 0){
		    				return "rgba(0,0,0,0.05)";	
		    			}
		    			if (tipomap[tipo].filter){		
		    				
		    				if  (d.properties.select==true &&check){		
								return color(d.properties.tipo);
							}else if (d.properties.select==true &&check){
								return "rgba(255,0,0,0.5)";
							} else {
								return "rgba(0,150,255,0.5)";
							}	
						
						} else {
							return "rgba(0,0,0,0.05)";										
						}	
		    		});
		          	renderDataset();
		        });

			pos = 2;
		    svg2.selectAll("text").remove();
			var s = svg2.selectAll("text").data(tipos);
			s.enter()
			 .append("text")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", function(d){
		          	if (tipomap[color(d)].selecao.length > 200){	
		          		return bigscale(tipomap[color(d)].selecao.length)+15;
		          	}
		          	return scalerect(tipomap[color(d)].selecao.length);
		      	   })
		          .text(function(d){
		          	if (selected == 0){
		          		return tipomap[color(d)].pontos.length;
		          	} else{
		          		return tipomap[color(d)].selecao.length;
		      	   	}
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
		           	if (tipomap[color(d)].selecao.length > 200){
		           		return bigscale(tipomap[color(d)].selecao.length);
		          	}
		          	return scalerect(tipomap[color(d)].selecao.length);
		      	   })
		          .attr("fill",function(d){
		          	if (check){
		          		return color(d);
		          	}else {
		          		return "rgba(0,0,0,0.1)"
		          	}
				})
		          .on("click", function(d){
		          	var target = color(d);
		          	if (tipomap[target].filter){ 
		          		tipomap[target].filter = false;
		          	} else {
		          		tipomap[target].filter = true;
		          	}
		          	var c = d3.select("svg").selectAll("circle");
		    		c.attr("fill", function(d){  
		    			tipo = color(d.properties.tipo);
		    			var m = parseInt(d.properties.data.substring(3,5));
		    			if (filterMonth[m-3] == 0){
		    				return "rgba(0,0,0,0.05)";	
		    			}
		    			if (tipomap[tipo].filter){		
		    				
		    				if  (d.properties.select==true &&check){		
								return color(d.properties.tipo);
							}else if (d.properties.select==true && !check){
								return "rgba(255,0,0,0.5)";
							} else {
								return "rgba(0,150,255,0.5)";
							}	
						
						} else {
							return "rgba(0,0,0,0.05)";										
						}	
		    		});
		          	renderDataset();
		        });;
			pos = 2;
		    svg2.selectAll("text").remove();
			var t = svg2.selectAll("text").data(tipos);
			t.enter()
			 .append("text")
		          .attr("x", function(){
		          	pos += 40;
		          	return pos;
		          })
		          .attr("y", function(d){
		          	if (tipomap[color(d)].selecao.length > 200){
		          		return bigscale(tipomap[color(d)].selecao.length)+15;
		          	} else {
		          		return scalerect(tipomap[color(d)].selecao.length)+15;
		      	   	}
		      	   })
		          .text(function(d){
		          	if (selected == 0){
		          		return tipomap[color(d)].pontos.length;
		          	} else{
		          		return tipomap[color(d)].selecao.length;
		      	   	}
		      	   });
		}

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