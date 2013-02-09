var _ = require("./lib/underscore-min.js"), microtime = require('microtime'),
    UndirectedGraph = require("./lib/undirected_graph.js").UndirectedGraph;

var faults = [];
var times = [];

for(var i = 1; i <= 100; i++) {
  var graph = new UndirectedGraph(i), start, slfTime, wigdersonTime, slfOut, wigdersonOut;
  graph.makeRandomWithSaturation();

  start = microtime.now();
  slfOut = graph.slfColorize();
  slfTime = (microtime.now() - start) / 10000000;

  start = microtime.now();
  wigdersonOut = graph.modifiedWigdersonColorize();
  wigdersonTime = (microtime.now() - start) / 10000000;

  faults.push((wigdersonOut - slfOut)/ slfOut);
  times.push(slfTime / wigdersonTime);

  process.stdout.write(i + " ");
}
process.stdout.write("\n\n");

process.stdout.write("Błąd względny: " + (_.reduce(faults, function(memo, num){ return memo + num; }, 0) / faults.length) + "\n");
process.stdout.write("Zysk czasowy: " + (_.reduce(times, function(memo, num){ return memo + num; }, 0) / times.length) + "\n");


