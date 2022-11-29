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
    new Point(400, 300, true),
    new Point(800, 540),
  ];

  canvas.addEventListener('mousedown', handleMouseDown(canvas));

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
  isControl;
  /** @type {boolean} */
  isDragging;

  /**
   * @param {number} x
   * @param {number} y
   * @param {boolean} isControl
   */
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

  hitTest(x, y) {
    const distance = calculateHypoteneuseLength(this.x, this.y, x, y);

    // todo, this may need to be relative to the artboard
    return distance < 20;
  }
}
