var _ = require("./lib/underscore-min.js"), microtime = require('microtime'),
    UndirectedGraph = require("./lib/undirected_graph.js").UndirectedGraph;

process.stdout.write("V;brute;;LF;;SL;;SLF;;\n");

for(var i = 1; i <= 100; i++) {
  var graph = new UndirectedGraph(i), start;
  graph.makeRandomWithSaturation(80);

  process.stdout.write(i + ";");
  start = microtime.now();
  process.stdout.write(graph.bruteColorize() + ";" + (microtime.now() - start) / 1000 + ";");

  start = microtime.now();
  process.stdout.write(graph.lfColorize() + ";" + (microtime.now() - start) / 10000 + ";");

  start = microtime.now();
  process.stdout.write(graph.slColorize() + ";" + (microtime.now() - start) / 10000 + ";");

  start = microtime.now();
  process.stdout.write(graph.slfColorize() + ";" + (microtime.now() - start) / 10000 + "\n");
}

