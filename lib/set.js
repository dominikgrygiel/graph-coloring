var _ = require("./underscore-min.js");

var Set = function() {};
Set.prototype.add = function(o) { this[o] = true; };
Set.prototype.remove = function(o) { delete this[o]; };
Set.prototype.keys = function() { return Object.keys(this); };
Set.prototype.clone = function() {
  var ret = new Set();
  _(this.keys()).each(function(k) {
    ret.add(k);
  });

  return ret;
};

module.exports.Set = Set;

