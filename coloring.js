var _ = require("./lib/underscore-min.js"),
    UndirectedGraph = require("./lib/undirected_graph.js").UndirectedGraph, n;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
  var lines = chunk.split("\n"), graph, n;

  n = parseInt(lines[0], 10);
  graph = new UndirectedGraph(n);

  for(var i = 1; i < lines.length; i++) {
    if(lines[i] !== '' && !isNaN(parseInt(lines[i].split(' ')[0], 10))) {
      graph.addEdge(parseInt(lines[i].split(' ')[0], 10) - 1, parseInt(lines[i].split(' ')[1], 10) - 1);
    }
  }

  process.stdout.write("Algorytm BruteForce: " + graph.bruteColorize() + "\n");
  process.stdout.write("Algorytm LF: " + graph.lfColorize() + "\n");
  process.stdout.write("Algorytm SL: " + graph.slColorize() + "\n");
  process.stdout.write("Algorytm SLF: " + graph.slfColorize() + "\n");

});

