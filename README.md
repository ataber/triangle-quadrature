# triangle-quadrature

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Gaussian quadrature for a triangle.

## Usage

[![NPM](https://nodei.co/npm/triangle-quadrature.png)](https://www.npmjs.com/package/triangle-quadrature)

```javascript
var bunny      = require('bunny')
var quadrature = require('triangle-quadrature')([bunny.positions[0], bunny.positions[1], bunny.positions[2])
console.log(quadrature) # <- {positions: [...], weights: [...]}
```

`require("triangle-quadrature")(positions, [order = 5])`
----------------------------------------------------
Computes Gaussian quadrature for a triangle defined by `positions` (three vec3s). Optionally, you can set a custom order, higher implying greater accuracy. To actually integrate using these quadrature points, simply take a sum of your integrand at `positions` weighted by `weights`.

## Contributing

See [stackgl/contributing](https://github.com/stackgl/contributing) for details.

## License

MIT. See [LICENSE.md](http://github.com/ataber/triangle-quadrature/blob/master/LICENSE.md) for details.

