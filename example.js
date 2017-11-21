var bunny = require('bunny');
var mass = require('mesh-mass');
var quadrature = require('./index.js');
var colormap = require('colormap');
var normals = require('normals');
var surfaceArea = 0;
var positions = [];
var weights = [];
var maximum = 1e-90;
var minimum = 1e90;

bunny.cells.map(function(cell) {
  var rule = quadrature([bunny.positions[cell[0]], bunny.positions[cell[1]], bunny.positions[cell[2]]], 5);
  rule.weights.map(function(weight) {
    surfaceArea += weight;
    weights.push(weight);
    if (weight > maximum) {
      maximum = weight;
    }

    if (weight < minimum) {
      minimum = weight;
    }
  });

  rule.positions.map(function(p) {
    positions.push(p);
  });
});

var map = colormap({
  colormap: 'jet',
  nshades: 255,
  format: 'rgb'
})

var colors = [];
weights.map(function(weight) {
  var index = Math.max(Math.min(parseInt(255 * ((weight - minimum) / (maximum - minimum))), 254), 0)
  var value = map[index];
  colors.push([value[0], value[1], value[2]]);
})

console.log("Quadrature area", surfaceArea);
console.log("Actual area", mass(bunny.cells, bunny.positions).area);

var regl = require('regl')();
var mat4 = require('gl-mat4');
var camera = require('regl-camera')(regl, {
  center: [0, 5, 0],
  theta: Math.PI / 2,
  distance: 15
});

const drawParticles = regl({
  vert: `
  precision mediump float;
  attribute vec3 color;
  varying vec3 vColor;
  attribute vec3 position;
  uniform mat4 view, projection;
  void main() {
    vColor = color;
    gl_PointSize = 4.0;
    gl_Position = projection * view * vec4(position, 1.0);
  }`,
  frag: `
  precision mediump float;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }`,
  attributes: {
    color: colors,
    position: positions
  },
  count: positions.length,
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
    vec3 lightDir = normalize(vec3(1.0, 0.5, 0.));
    gl_FragColor = vec4(vec3(0.6 * dot(vNorm, lightDir)), 1.0);
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
      view: mat4.create()
    })

    drawOuter({
      view: mat4.create()
    })
  })
})
