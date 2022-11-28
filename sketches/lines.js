const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1000, 1000 ]
};

const sketch = () => {
  const points = [
    new Point(200, 540),
    new Point(400, 300, true),
    new Point(800, 540),
  ];

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

class Point {
  constructor(x, y, isControl) {
    this.x = x;
    this.y = y;
    this.isControl = isControl;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);

    context.fillStyle = this.isControl ? 'red' : 'black';

    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}
