const canvasSketch = require('canvas-sketch');
const Point = require('./common/Point');
const { setupPointInteractions } = require('./common/point-interactions');

const settings = {
  /** @type {[number, number]} */
  dimensions: [1080, 1080],
  animate: true,
};

const points = [
  new Point(200, 540),
  new Point(400, 300),
  new Point(800, 540),
];

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CreateSketch<typeof settings>} */
const sketch = ({ canvas }) => {
  setupPointInteractions(canvas, points);

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    context.quadraticCurveTo(
      points[1].x,
      points[1].y,
      points[2].x,
      points[2].y,
    );

    context.stroke();

    points.forEach((point, index) => {
      if (index === 1) {
        point.draw(context, { color: 'red' });
      } else {
        point.draw(context);
      }
    });
  };
};

canvasSketch(sketch, settings);
