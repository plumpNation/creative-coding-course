const canvasSketch = require('canvas-sketch');
const Point = require('./common/Point');

const settings = {
  /** @type {[number, number]} */
  dimensions: [1080, 1080]
};

const points = [
  new Point(200, 540),
  new Point(400, 300),
  new Point(800, 540),
  new Point(756, 812),
  new Point(547, 754),
];

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
  };
};

canvasSketch(sketch, settings);
