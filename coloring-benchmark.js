var _ = require("./lib/underscore-min.js"),
    UndirectedGraph = require("./lib/undirected_graph.js").UndirectedGraph;

for(var i = 1; i <= 100; i++) {
  var graph = new UndirectedGraph(i);
  graph.makeRandomWithSaturation();

  var lf = graph.lfColorize(), sl = graph.slColorize(), slf = graph.slfColorize();
  console.log(i + ": " + lf + " " + sl + " " + slf);
}

