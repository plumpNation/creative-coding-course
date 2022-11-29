const canvasSketch = require('canvas-sketch');

const Point = require('./common/Point');
const { setupPointInteractions } = require('./common/point-interactions');

const settings = {
  dimensions: [1000, 1000],
  animate: true,
};

/** @type {Point[]} */
const points = [
  new Point(200, 540),
  new Point(400, 300),
  new Point(800, 540),
  new Point(756, 812),
  new Point(547, 754),
];

/**
 * @param {{ canvas: HTMLCanvasElement }} options
 */
const sketch = ({ canvas }) => {
  setupPointInteractions(canvas, points, (x, y) => {
    points.push(new Point(x, y));
  });

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    // Draw the lines between the points
    context.strokeStyle = '#999';

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    points.forEach(point => {
      context.lineTo(point.x, point.y);
    });

    context.stroke();

    context.beginPath();

    points.forEach((currentPoint, index) => {
      // Ignore the last one
      if (index === points.length - 1) {
        // Comment this line to make curve end at midpoint.
        // context.quadraticCurveTo(currentPoint.x, currentPoint.y, currentPoint.x, currentPoint.y);
        return;
      }

      const nextPoint = points[index + 1];

      const mx = currentPoint.x + (nextPoint.x - currentPoint.x) * 0.5;
      const my = currentPoint.y + (nextPoint.y - currentPoint.y) * 0.5;

      if (index === 0) {
        // Comment this out if you want to start at the midpoint
        context.moveTo(currentPoint.x, currentPoint.y);
        // To start at the midpoint
        // context.moveTo(mx, my);
      } else if (index === points.length - 2) {
        // Comment this out if you want to end at the midpoint
        context.quadraticCurveTo(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y);
      } else {
        context.quadraticCurveTo(currentPoint.x, currentPoint.y, mx, my);
      }
    });

    context.lineWidth = 4;
    context.strokeStyle = 'blue';
    context.stroke();

    // Draw the points
    points.forEach(point => {
      point.draw(context);
    });
  };
};

canvasSketch(sketch, settings);
