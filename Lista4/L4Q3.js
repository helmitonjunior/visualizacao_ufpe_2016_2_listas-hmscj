

var dataset = [];
var partidos = {};

var tree;

var width = innerWidth-40,
    height = innerHeight-40,
    color = d3.scale.category20c(),
    div = d3.select("body").append("div")
       .style("position", "relative");

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) { return d.size; });


d3.csv("cand_ver_recife_2016.csv", function(data) {
  dataset = data;
  console.log(data);
  dataset.map(function(d){
    if (!partidos[d.Partido]){
      partidos[d.Partido] = [];
    }

    partidos[d.Partido].push({name: d.Candidato, size: d.Votos})
  });

  tree = {
    name: "tree",
    children: [
    ]
  };

  console.log(partidos);
  var leaves = [];
  for (var partido in partidos) {
    tree.children.push({
      name: partido,
      size: 0,
      children: partidos[partido]
    })
  };
  console.log(leaves);
  //
   

  renderDataSet();
});

function renderDataSet() {
  var node = div.datum(tree).selectAll(".node")
      .data(treemap.nodes)
    .enter().append("div")
      .attr("class", "node")
      .call(position)
      .style("background-color", function(d) {
          console.log(d)
          return d.name == 'tree' ? '#fff' : color(d.parent.name); })
      .append('div')
      // .style("font-size", function(d) {
      //     // compute font size based on sqrt(area)
      //     return Math.max(20, 0.18*Math.sqrt(d.area))+'px'; })
      .text(function(d) { return d.children ? null : d.name+ "\n"+d.size; });
}


function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

