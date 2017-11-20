var gaussQuadrature = require('gauss-quadrature');
var vec3 = require('gl-vec3');

module.exports = function(positions, order = 5) {
  var gaussRule = gaussQuadrature(5);

  var point12 = new Array(3);
  vec3.add(point12, positions[0], positions[1]);
  vec3.scale(point12, point12, 0.5);
  var point123 = new Array(3);
  vec3.add(point123, point12, positions[2]);
  vec3.scale(point123, point123, 0.5);

  var a = new Array(3);
  vec3.subtract(a, positions[1], point12);

  var b = new Array(3);
  vec3.subtract(b, point123, point12);
  var area = vec3.length(vec3.cross(b, b, a)) / 2;

  var positions = [];
  var weights = [];

  for (var i = 0; i < order; i++) {
    var position = new Array(3);
    vec3.subtract(position, point12, point123);
    vec3.scaleAndAdd(position, point123, position, gaussRule[0][i]);

    var w = area * (1.0 + gaussRule[0][i]) * gaussRule[1][i];

    for (var j = 0; j < order; j++) {
      positions.push(vec3.subtract([],
        position,
        vec3.scale([], a, gaussRule[0][j] * (1.0 + gaussRule[0][i]) / 2.0)
      ));
      weights.push(w * gaussRule[1][j]);
    }
  }

  return {
    positions: positions,
    weights: weights
  }
};
