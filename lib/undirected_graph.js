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
    this.colorizeGreedy = _.bind(this.colorizeGreedy, this);
    this.chromaticNumber = _.bind(this.chromaticNumber, this);
    this.lfColorize = _.bind(this.lfColorize, this);
    this.slColorize = _.bind(this.slColorize, this);
    this.slfColorize = _.bind(this.slfColorize, this);
    this.bruteColorize = _.bind(this.bruteColorize, this);
    this.hasConflict = _.bind(this.hasConflict, this);
	this.permutate = _.bind(this.permutate, this);

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

  //COLORING
  UndirectedGraph.prototype.colorizeGreedy = function(v) {
    var colors = this.colors;

    var siblingsColors = _(this.graph[v].keys()).map(function(e) { return colors[e]; }).filter(function(e) { return !_.isUndefined(e); });
    this.colors[v] = _(this.possibleColors).find(function(e) { return !_(siblingsColors).include(e); });
  };

  UndirectedGraph.prototype.chromaticNumber = function() {
    return _.chain(this.colors).map(function(v,k) { return v; }).uniq().value().length;
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

  UndirectedGraph.prototype.bruteColorize = function(){
    n = this.size;
	c = 1;
	this.b_colors = [];
	
	if(n < 2) return 1;
	
	htop:
	while(true){
		maxpos = n-1;
		change = 0;
		output = [];
		output[0] = [];
		for(i=0;i<n;i++){
			output[0].push(1);   
		}
		
		top:
		for(i=1;i<c*n;i++){
			output[i] = [];

			for(j=0;j<n;j++){
				if(change==j && output[i-1][j]+1 > c){
					output.splice(i);
					break top;
				}
								
				if(change == j)
					output[i][j] = output[i-1][j]+1;
				else
					output[i][j] = output[i-1][j]
					
			//		console.log("after:", output);
			}
			
			change++;
			
			if(change >= maxpos){
				change = 0;
				maxpos--;		

			}

		};
			this.found = 0;
			that=this;
			for(i=0; i < output.length ; i++){
				
				this.permutate(output[i], function(per){
					if(that.found) return ;
					  that.b_colors = per;
					  noconflict = true;
					  for(j=0;j<n;j++){
						if(that.hasConflict(j)){
							noconflict = false;
							break;
						}
					  }
					if(noconflict){
						that.found = c;
					}
				});
				if(this.found)
					return this.found;
				
			 
			}
			
			c++;
			
	}
	};



	UndirectedGraph.prototype.permutate = function(array, callback) {
		// Do the actual permuation work on array[], starting at index
			that = this;
			function p(array, index, callback) {
				if(that.found) return that.found;
				// Swap elements i1 and i2 in array a[]
				function swap(a, i1, i2) {
					var t = a[i1];
					a[i1] = a[i2];
					a[i2] = t;
				}

				// Are we at the last element of the array?                        
				if (index == array.length - 1) {
					// Nothing more to do - call the callback
					callback(array);
					// We have found a single permutation
					return 1;
				} else {
					// Still work to do.
					// Count the number of permutations to our right
					var count = p(array, index + 1, callback);
					// Swap the element at position index with
					// each element to its right, permutate again,
					// and swap back
					for (var i = index + 1; i < array.length; i++) {
						if(that.found) break;
						swap(array, i, index);
						count += p(array, index + 1, callback);
						swap(array, i, index);
					}
					return count;
				}
			}

			// No data? Then no permutations!        
			if (!array || array.length == 0) {
				return 0;
			}

			// Start the permutation    
			return p(array, 0, callback);
	};
	
	UndirectedGraph.prototype.hasConflict = function(vertex){
			for(e = 0; e < this.size; e++){
			  if(e == vertex) continue;
			  if(typeof this.graph[e][vertex] != "undefined" && typeof this.b_colors[e] != "undefined" && this.b_colors[e] == this.b_colors[vertex])
				return true;
			}
			return false;
	};

  

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

  return UndirectedGraph;

})();

module.exports.UndirectedGraph = UndirectedGraph;

