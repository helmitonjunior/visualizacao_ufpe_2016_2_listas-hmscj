//Width and height
var margin = {top: 10, right: 20, bottom: 10, left: 20};
var width = 900 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;



//
var generator  = d3.randomUniform(0, 1);
var colorScale = colorbrewer.Paired[12];
//      
var dataset = [];

function updateDataset(){
    
    var numPoints = 5;
    var newDataset = Array.apply(null, Array(numPoints)).map(function() { return generator(); });
    var totalSum = d3.sum(newDataset);
    newDataset =  newDataset.map(function(d){return d/totalSum;});
    
    dataset = newDataset;
}

function pieChart(probabilities, colors){
 //Size Variables
      var size = 150;
      var radius = 16; //roughly 1% of 2π. Compensation needed at prob function.
      var data = [];

      var stable = [];
      probabilities.forEach(function (d){
        stable.push(Math.round(d*100));
        return stable;
      });

      //creating tuples w/ color and probability in variable data
      joinData (colors, stable, data);
      function joinData (c, p, d){
        console.log(p);
        for (var i = c.length - 1; i >= 0; i--) {
            var newData = {};
            newData.p = 0;
            newData.c = c[i];
            d.push(newData);
        }
      }

      stable.sort();
      for (var i = data.length - 1; i >= 0; i--) {
        data[i].p = stable[i];
      }
      //sorting data by probability
      data.sort(function(a, b) {
        return a.prob - b.prob;
      });

      //setting up base

      
      
    
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
        return (((d.p)+3)+" 100") ; //16 isn't exactly 1% of 2π, so we add +3 to adjust
      }

      var holder = -0;

                    // Exit
      pie.exit().remove();


      //Enter
       pie.enter().append("circle")
        .attr("r", 16)
        .attr("cx", 16)
        .attr("cy", 16)
        .attr("fill", "rgba(0,0,0,0)")
        .attr("stroke", paint)
        .attr("stroke-width", (radius*2))
        .attr("stroke-dashoffset", offset)
        .attr("stroke-dasharray", prob);

        //Update
        pie.transition()
        .duration(1000)
        .attr("stroke", paint)
        .attr("stroke-dashoffset", offset)
        .attr("stroke-dasharray", prob);




      

     

      //Making donut-like shape
      var clearCenter = svg.append("circle")
        .attr("r", 8)
        .attr("cx", 16)
        .attr("cy", 16)
        .attr("fill", "white");
      }

function renderDataset(){
    pieChart(dataset,colorScale.slice(1,6));
    //Codigo para fazer insercao/remocao/update de elementos    
    //em algum momento voce provavelmente vai querer chamar algo como:
    //                                      pieChart(dataset,colorScale.slice(0,5))
    
}


function init(){
    //create clickable paragraph
    d3.select("body")
  .append("p")
  .text("Click on me!")
  .on("click", function() {
      updateDataset();
      renderDataset();
      //var resetCanvas = d3.select("svg").remove();

      
  });
    var svg = d3.select("body").append('svg')
        .attr("viewBox", "0 0 32 32") //controlling chart's proportion fitness 
        .attr("width",300)
        .attr("height", 300);
    /*Create SVG element
    var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    */
    return svg;
}                 

//
var svg = init();