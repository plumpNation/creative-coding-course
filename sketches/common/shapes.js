const { getCartesianCoords } = require("./helper");

/**
 * @param {CanvasRenderingContext2D} context
 * @param {{ radius: number, sides: number }} options
 */
 const drawPolygon = (context, { radius = 300, sides = 6 }) => {
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for (let i = 0; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;

    context.lineTo(
      Math.cos(theta) * radius,
      Math.sin(theta) * radius,
    );
  }

  context.closePath();
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {{ degrees: number; w: number; h: number; }} options
 */
 const drawSkewedRectangle = (context, {
  degrees,
  w = 600,
  h = 200
}) => {
  const { x, y } = getCartesianCoords(degrees, w);

  context.translate(x * -0.5, (y + h) * -0.5); // move draw origin

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(x, y);
  context.lineTo(x, y + h);
  context.lineTo(0, h);
  context.closePath();
}

module.exports = {
  drawSkewedRectangle,
  drawPolygon,
}