const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [ 800, 800 ],
  // animate: true,
  fps: 60,
};

/**
 * Calculate the coordinates required for a specific angle.
 *
 * @param {number} angle
 * @param {number} radius
 * @returns {{x: number, y: number}}
 */
const getCartesianCoords = (angle, radius) => {
  const radians =  math.degToRad(angle)

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius
  }
}

const drawSkewedRectangle = ({
  context,
  degrees,
  width = 600,
  height = 200,
}) => {
  const { x, y } = getCartesianCoords(degrees, width);

  context.translate(x * -0.5, (y + height) * -0.5); // move draw origin

  context.save();

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(x, y);
  context.lineTo(x, y + height);
  context.lineTo(0, height);
  context.lineTo(0, 0);

  context.stroke();

  context.restore();
}

const sketch = () => {
  let x, y, w, h;

  return ({ context, width, height }) => {
    // calculations
    // ///////////////////////////

    w = width * 0.6;
    h = width * 0.1;
    x = width * 0.5;
    y = width * 0.5;

    // each clock segment angle is 30 degrees
    // 0 degrees is 3 o clock
    // 30 degrees is 4 o clock etc
    const degrees = 360 / 12;

    // drawing
    // ///////////////////////////

    context.save()
    context.translate(x, y); // center
    context.strokeStyle = 'blue';

    // context.strokeRect(0, 0, w, h);

    drawSkewedRectangle({ context, degrees })
    context.stroke();

    context.restore();
  };
};

canvasSketch(sketch, settings);
