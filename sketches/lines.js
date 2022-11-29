const canvasSketch = require('canvas-sketch');
const Point = require('./common/Point');
const { setupPointInteractions } = require('./common/point-interactions');

const settings = {
  dimensions: [1000, 1000],
  animate: true,
};

const points = [
  new Point(200, 540),
  new Point(400, 300, true),
  new Point(800, 540),
];

/**
 * @param {{ canvas: HTMLCanvasElement }} options
 */
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

    points.forEach(point => {
      point.draw(context);
    });
  };
};

canvasSketch(sketch, settings);
