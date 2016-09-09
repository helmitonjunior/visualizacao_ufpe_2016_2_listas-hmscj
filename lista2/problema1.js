
	    var colors = ["red", "green", "yellow", "orange"];
      var probabilities = [10, 20, 20, 50];
      pieChart(colors, probabilities);

      function pieChart(colors, probabilities)
      {

      //Size Variables
      var size = 150;
      var radius = 16; //roughly 1% of 2π. Compensation needed at prob function.
      var data = [];
    
      //creating tuples w/ color and probability in variable data
      joinData (colors, probabilities, data);
      function joinData (c, p, d){
        for (var i = c.length - 1; i >= 0; i--) {
            var newData = {};
            newData.p = p[i];
            newData.c = c[i];
            d.push(newData);
        }
      }



      //sorting data by probability
      data = data.sort(function(a, b) {
        return a.prob - b.prob;
      });

      var scale = d3.scale.linear() //adjusting a little flaw on chart completion at 101
      .domain([0,100])   
      .rangeRound([0,101]); 

      //setting up canvas
      var svg = d3.select("body").append('svg')
      	.attr("viewBox", "0 0 32 32") //controlling chart's proportion fitness 
        .attr("width",size)
        .attr("height", size);


      var base = svg.append("circle")
        .attr("r", 16)
        .attr("cx", 16)
        .attr("cy", 16)
        .attr("fill", "lightblue")
    
      //Always start the chart with the lowest probability's color
      // Bind data
      var pie = svg.selectAll("circle").data(data);

      function paint (d) {
        return d.c;
      }

      function offset (d) { 
        step = holder;
        holder = holder-(d.p);
        return step;
      }

       function prob (d) { 
        return ((d.p)+1)+" 100" ; //16 is no exactly 1% of 2π,add +1 to compensate
      }

      var holder = -0;


      //Enter
       pie.enter().append("circle")
        .attr("r", 16)
        .attr("cx", 16)
        .attr("cy", 16);

      //Update
      pie.attr("fill", "rgba(0,0,0,0)")
      .attr("stroke", paint)
      .attr("stroke-width", (radius*2))
      .attr("stroke-dashoffset", offset)
      .attr("stroke-dasharray", prob);

      // Exit
      pie.exit().remove();

      //Making donut-like shape
      var clearCenter = svg.append("circle")
        .attr("r", 8)
        .attr("cx", 16)
        .attr("cy", 16)
        .attr("fill", "white");
      }

