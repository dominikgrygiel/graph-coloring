var _ = require("./underscore-min.js"),
    Set = require("./set.js").Set,
    UndirectedGraph;

UndirectedGraph = (function() {

  function UndirectedGraph(size) {
    this.makeRandomWithSaturation = _.bind(this.makeRandomWithSaturation, this);
    this.maxPossibleEdges = _.bind(this.maxPossibleEdges, this);
    this.allEdges = _.bind(this.allEdges, this);
    this.saturation = _.bind(this.saturation, this);
    this.marshalDump = _.bind(this.marshalDump, this);
    this.addEdge = _.bind(this.addEdge, this);
    this.removeEdge = _.bind(this.removeEdge, this);
    this.visualizeURL = _.bind(this.visualizeURL, this);
    this.graphDegree = _.bind(this.graphDegree, this);
    this.colorizeGreedy = _.bind(this.colorizeGreedy, this);
    this.chromaticNumber = _.bind(this.chromaticNumber, this);
    this.rsColorize = _.bind(this.rsColorize, this);
    this.lfColorize = _.bind(this.lfColorize, this);
    this.slColorize = _.bind(this.slColorize, this);
    this.slfColorize = _.bind(this.slfColorize, this);
    this.bruteColorize = _.bind(this.bruteColorize, this);
    this.canBruteColorize = _.bind(this.canBruteColorize, this);
    this.modifiedWigdersonColorize = _.bind(this.modifiedWigdersonColorize, this);
	this.biggestFirst = _.bind(this.biggestFirst, this);
	this.conflict = _.bind(this.conflict, this);

    this.size = size;
    this.graph = new Array();
    this.possibleColors = [];
    this.vertexColors = [];

    for(var i = 0; i < this.size; i++) {
      this.graph[i] = new Set();
      this.possibleColors.push(i);
    }
  }

  UndirectedGraph.prototype.maxPossibleEdges = function() {
    var n = this.size;
    return n * (n - 1) / 2;
  };

  UndirectedGraph.prototype.allEdges = function() {
    var ret = [], clone = this.marshalDump();
    for(var i = 0; i < this.size; i++) {
      _(clone[i].keys()).each(function(k) {
        ret.push([i, k]);
        clone[k].remove(i);
      });
    }

    return ret;
  };

  UndirectedGraph.prototype.saturation = function() {
    return this.allEdges().length / this.maxPossibleEdges() * 100;
  };

  UndirectedGraph.prototype.makeRandomWithSaturation = function(sat) {
    sat || (sat = 50);
    while(this.saturation() < sat) {
      var r1 = Math.floor(Math.random() * this.size), r2;
      do {
        r2 = Math.floor(Math.random() * this.size);
      } while(r1 == r2);
      this.addEdge(r1, r2);
    }
  };

  UndirectedGraph.prototype.marshalDump = function() {
    var ret = [];
    for(var i = 0; i < this.size; i++) {
      ret[i] = this.graph[i].clone();
    }

    return ret;
  };

  UndirectedGraph.prototype.addEdge = function(r1, r2) {
    this.graph[r1].add(r2);
    this.graph[r2].add(r1);
  };

  UndirectedGraph.prototype.removeEdge = function(r1, r2) {
    this.graph[r1].remove(r2);
    this.graph[r2].remove(r1);
  };

  UndirectedGraph.prototype.visualizeURL = function() {
    var endString = 'http://www.algorytm.org/tools/graphs/graphchart.php?graphchartData=digraph GRAPH_0 {edge [fontsize=12 arrowhead=none];graph [rankdir=LR]; node [shape=ellipse regular=true fontsize=12 height="0.2" margin="0.01,0.01"];';

    for(var i = 0; i < this.size; i++) {
      endString += 'ver'+(i+1)+'_ [label="'+(i+1)+'" style="filled" fillcolor="white"];';
    }

    _(this.allEdges()).each(function(k) {
      endString += 'ver'+(parseInt(k[0], 10)+1)+'_ -> ver'+(parseInt(k[1], 10)+1)+'_ [label="" color="black" fontcolor="black"];';
    });

    endString +=' }&type=png';
    return endString;
  };

  UndirectedGraph.prototype.graphDegree = function() {
    var max = _(this.graph).max(function(e) { return e.keys().length; });
    return _.isObject(max) ? max.keys().length : 0;
  };

  //COLORING
  UndirectedGraph.prototype.colorizeGreedy = function(v, useColors) {
    var colors = this.colors;
    useColors || (useColors = this.possibleColors);

    var siblingsColors = _(this.graph[v].keys()).map(function(e) { return colors[e]; }).filter(function(e) { return !_.isUndefined(e); });
    this.colors[v] = _(useColors).find(function(e) { return !_(siblingsColors).include(e); });
  };

  UndirectedGraph.prototype.chromaticNumber = function() {
    return _.chain(this.colors).map(function(v,k) { return v; }).uniq().value().length;
  };

  UndirectedGraph.prototype.rsColorize = function() {
    var vertices = [], i, graph = this.graph;
    this.colors = {};

    shuffle = function(o){
      for(var j, x, i = o.length; i; j = parseInt(Math.random() * i, 10), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    for(i = 0; i < this.size; i++) {
      vertices.push(i);
    }
    shuffle(vertices);

    for(i = 0; i < this.size; i++) {
      this.colorizeGreedy(vertices[i]);
    }
    return this.chromaticNumber();
  };

  UndirectedGraph.prototype.lfColorize = function() {
    var vertices = [], i, graph = this.graph;
    this.colors = {};

    for(i = 0; i < this.size; i++) {
      vertices.push(i);
    }
    vertices.sort(function(a, b) { return graph[b].keys().length - graph[a].keys().length; });

    for(i = 0; i < this.size; i++) {
      this.colorizeGreedy(vertices[i]);
    }

    return this.chromaticNumber();
  };

  UndirectedGraph.prototype.slColorize = function() {
    var vertices = [], i, dump = this.marshalDump(), clone = [];
    this.colors = {};

    for(i = 0; i < this.size; i++) {
      temp = {};
      temp[i] = dump[i];
      clone.push(temp);
    }

    while(_.chain(clone).map(function(e) { return e[Object.keys(e)[0]].keys().length; }).max().value() > 0) {
      var smallest = _(clone).min(function(e) { return e[Object.keys(e)[0]].keys().length; });
      var smallestV = Object.keys(smallest)[0];

      vertices.push(smallestV);
      clone.splice(_.indexOf(clone, smallest), 1);
      _(clone).each(function(e) {
        var v = e[Object.keys(e)[0]];
        v.remove(smallestV);
      });
    }
    vertices.push(Object.keys(clone[0])[0]);

    for(i = this.size - 1; i >= 0; i--) {
      this.colorizeGreedy(vertices[i]);
    }

    return this.chromaticNumber();
  };

  UndirectedGraph.prototype.bruteColorize = function() {
    if(this.size === 1) {
      return 1;
    }

    for(var i = 0; i < this.size; i++) {
      var t = [];
      for(var j = 0; j <= i; j++) {
        t.push(j);
      }
      if(this.canBruteColorize(t)) {
        return i + 1;
      }
    }

    return Infinity;
  };

  UndirectedGraph.prototype.canBruteColorize = function(array) {
    var table = [], graph = this.graph, size = this.size;

    function pick(reps, input, item, count) {
      if(count < size) {
        for (var i = 0; i < input.length; i++) {
          item[count] = input[i];
          if(pick(reps, input, item, count + 1)) {
            return true;
          }
        }
      } else {
        var positive = true;
        for(var j = 0; j < size; j++) {
          if(_(graph[j].keys()).any(function(k) { return ((j != k) && (item[k] == item[j])); })) {
            positive = false;
            break;
          }
        }

        if(positive) {
          return true;
        }
      }

      return false;
    }

    return pick([], array, [], 0);
  };
  
   UndirectedGraph.prototype.biggestFirst = function() {
		var current = 0, prev = 0, colors = 0,  bysize = [], tsize, curV;
	
		gBF = [];
		for(var i = 0; i<this.size;i++) {
			tsize= this.graph[i].keys().length;
			if(typeof bysize[tsize] == "undefined")
				bysize[tsize] = [];
			gBF[i] = 0;
			bysize[tsize].push(i);
		}
		
		
		
		bysize= _(bysize).sortBy(function(n){return -n.length});
		for(var size in bysize){
			for(var i = 0 ; i < bysize[size].length; i++){
				curV = bysize[size][i];
				if(gBF[curV] == 0){
					for(var c = 1; (c <= this.size && gBF[curV] == 0) ; c++){
						if(!this.conflict(curV, c)){
							gBF[curV] = c;
							if(c > colors) colors++;
						}
					}
				}
				
				_.each(this.graph[curV], function(s){
						if(gBF[s] == 0)
							for(var c = 1; (c <= this.size && gBF[s] == 0) ; c++){
								if(!this.conflict(curV, c)){
									gBF[s] = c;
									if(c > colors) colors++;
								}
							}
				});
				
				
			}
		}
		
		return colors;
   };
   
   
   
   UndirectedGraph.prototype.conflict = function(vertex, color){
	for(var k in _(this.graph[vertex]).value()){
		if(parseInt(k) != "NaN")
			if(gBF[k] == color) return true;
	}
	return false;
   }

  UndirectedGraph.prototype.slfColorize = function() {
    var colors, leftVertices = [], i, graph = this.graph;
    colors = this.colors = {};

    for(i = 0; i < this.size; i++) {
      leftVertices.push(i);
    }

    while(leftVertices.length > 0) {
      var maxColors = [];
      _(leftVertices).each(function(e) {
        var colorSauration = _.chain(graph[e].keys()).map(function(v) { return colors[v]; }).filter(function(c) { return !_.isUndefined(c); }).uniq().value().length;
        maxColors[colorSauration] || (maxColors[colorSauration] = []);
        maxColors[colorSauration].push(e);
      });

      var bestMatch = _.chain(maxColors).last().max(function(e) { return graph[e].keys().length; }).value();
      this.colorizeGreedy(bestMatch);
      leftVertices.splice(_.indexOf(leftVertices, bestMatch), 1);
    }

    return this.chromaticNumber();
  };

  UndirectedGraph.prototype.modifiedWigdersonColorize = function() {
    var colors, dump, i, colorOffset = 0, n, me = this;
    colors = this.colors = {};

    dump = new UndirectedGraph(this.size);
    for(i = 0; i < this.size; i++) {
      dump.graph[i] = this.graph[i].clone();
      dump.possibleColors[i] = i;
    }

    while(dump.graphDegree() > (n = Math.sqrt(_(dump.graph).without(undefined).length))) {
      var biggerDegree = 0, constructedColors = [colorOffset, colorOffset + 1], biggerAndSiblings = [];
      colorOffset += 2;

      for(i = 0; i < dump.size; i++) {
        if(dump.graph[i] && (dump.graph[i].keys().length >= biggerDegree)) {
          biggerDegree = i;
        }
      }

      biggerAndSiblings = [biggerDegree].concat(dump.graph[biggerDegree].keys());
      _(biggerAndSiblings).each(function(k) { me.colorizeGreedy(k, constructedColors); });
      _(biggerAndSiblings).each(function(k) { delete dump.graph[k]; });

      for(i = 0; i < dump.size; i++) {
        if(dump.graph[i]) {
          _(biggerAndSiblings).each(function(k) { dump.graph[i].remove(k); });
        }
      }
    }

    for(i = 0; i < this.size; i++) {
      if(_.isUndefined(this.colors[i])) {
        this.colorizeGreedy(i);
      }
    }

    return this.chromaticNumber();
  };

  return UndirectedGraph;

})();

module.exports.UndirectedGraph = UndirectedGraph;

