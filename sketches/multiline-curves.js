const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1000, 1000 ],
  animate: true,
};

let points;

/**
 * @param {{ canvas: HTMLCanvasElement }} options
 */
const sketch = ({ canvas }) => {
  // Has to be here as the class is below this code in this file.
  points = [
    new Point(200, 540),
    new Point(400, 300),
    new Point(800, 540),
    new Point(756, 812),
    new Point(547, 754),
  ];

  canvas.addEventListener('mousedown', handleMouseDown(canvas));

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
        return
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

/**
 * Takes the canvas scale into consideration and provides
 * the x and y that are relative to the canvas.
 * Used with event.offsetY and offsetX.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} x
 * @param {number} y
 * @returns {{ x: number, y: number }}
 */
const normalizePosition = (canvas, x, y) => {
  const nx = (x / canvas.offsetWidth) * canvas.width;
  const ny = (y / canvas.offsetHeight) * canvas.height;

  return { x: nx, y: ny };
}

/**
 * @param {HTMLCanvasElement} canvas
 *
 * @returns {(event: MouseEvent) => void}
 */
const handleMouseDown = (canvas) => (event) => {
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove(canvas));

  const { x, y } = normalizePosition(
    canvas,
    event.offsetX,
    event.offsetY,
  );

  // Grab a point if you are mousedowning near enough to it.
  points.forEach(point => {
    point.isDragging = point.hitTest(x, y);
  });
};

/**
 * @param {HTMLCanvasElement} canvas
 *
 * @returns {(event: MouseEvent) => void}
 */
const handleMouseMove = (canvas) => (event) => {
  const { x, y } = normalizePosition(
    canvas,
    event.offsetX,
    event.offsetY,
  );

  points.forEach(point => {
    if (!point.isDragging) {
      return;
    }

    point.x = x;
    point.y = y;
  });
};

const handleMouseUp = () => {
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('mousemove', handleMouseMove);

  points.forEach(point => point.isDragging = false);
};

/**
 * @param {{ x: number; y: number; }} point1
 * @param {{ x: number; y: number; }} point2
 *
 * \sqrt {x^2 + y^2}
 *
 * @returns {number}
 */
const calculateHypoteneuseLength = (x1, y1, x2, y2) => {
  const dx = x1 - x2;
  const dy = y1 - y2;


  return Math.sqrt((dx * dx) + (dy * dy));
}

// todo why have a class? Just use an object and helper functions.
//    or are there performance benefits when there are many points?
class Point {
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {boolean} */
  isDragging;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);

    context.fillStyle = 'black';

    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  hitTest(x, y) {
    const distance = calculateHypoteneuseLength(this.x, this.y, x, y);

    // todo, this may need to be relative to the artboard
    return distance < 20;
  }
}
