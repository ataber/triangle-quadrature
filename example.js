var bunny = require('bunny');
var mass = require('mesh-mass');
var quadrature = require('./index.js');
var normals = require('normals');
var surfaceArea = 0;
var positions = [];
var weights = [];

bunny.cells.map(function(cell) {
  var rule = quadrature([bunny.positions[cell[0]], bunny.positions[cell[1]], bunny.positions[cell[2]]]);
  rule.weights.map(function(weight) {
    surfaceArea += weight;
    weights.push(weight);
  });

  rule.positions.map(function(p) {
    positions.push(p);
  });
});

console.log("Quadrature area", surfaceArea);
console.log("Actual area", mass(bunny.cells, bunny.positions).area);

var regl = require('regl')();
var mat4 = require('gl-mat4');
var camera = require('regl-camera')(regl, {
  center: [0, 0, 0],
  theta: Math.PI / 2,
  distance: 4
});

const drawParticles = regl({
  vert: `
  precision mediump float;
  attribute float weight;
  attribute vec3 position;
  uniform mat4 view, projection;
  void main() {
    gl_PointSize = 1.0;
    gl_Position = projection * view * vec4(position, 1);
  }`,
  frag: `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.75, 0.5, 0.3, 1);
  }`,
  attributes: {
    weight: regl.prop("weights"),
    position: regl.prop("positions")
  },
  count: regl.prop("positions").length,
  primitive: 'points'
})

var faceNormals = normals.faceNormals(bunny.cells, bunny.positions)
var explodedPositions = [];
var perVertexFaceNormals = [];
bunny.cells.map(function(cell, i) {
  explodedPositions.push(bunny.positions[cell[0]]);
  explodedPositions.push(bunny.positions[cell[1]]);
  explodedPositions.push(bunny.positions[cell[2]]);
  perVertexFaceNormals.push(faceNormals[i]);
  perVertexFaceNormals.push(faceNormals[i]);
  perVertexFaceNormals.push(faceNormals[i]);
});

var drawOuter = regl({
  vert: `
  precision mediump float;

  attribute vec3 position, normal;
  varying vec3 vNorm;
  uniform mat4 projection;
  uniform mat4 view;
  void main() {
    vNorm = normal;
    gl_Position = projection * view * vec4(position, 1.0);
  }
  `
  , frag: `
  precision mediump float;
  varying vec3 vNorm;
  void main() {
    gl_FragColor = vec4(vNorm, 1.0);
  }
  `,
  attributes: {
    position: explodedPositions,
    normal: perVertexFaceNormals
  },
  count: bunny.cells.length * 3,
  primitive: 'triangles'
})

regl.frame(() => {
  regl.clear({
    color: [1, 1, 1, 1],
    depth: 1
  })

  camera(() => {
    drawParticles({
      view: mat4.create(),
      positions: positions,
      weights: weights
    })

    drawOuter({
      view: mat4.create()
    })
  })
})
