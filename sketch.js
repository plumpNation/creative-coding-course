const canvasSketch = require('canvas-sketch');
const mathUtils = require('canvas-sketch-util/math');
const randomUtils = require('canvas-sketch-util/random');
const colorUtils = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

const settings = {
  dimensions: [ 1080, 1080 ],
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
  const radians =  mathUtils.degToRad(angle)

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius
  }
}

const drawSkewedRectangle = ({
  context,
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

const drawPolygon = ({ context, radius = 300, sides = 6 }) => {
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
 *
 * @param {string} color
 * @param {number} luminance HSL Luminance
 * @param {number} opacity Alpha channel decimal
 * @returns {string} rgba style value
 */
const deriveLesserColor = (color, luminance, opacity) => {
  const result = colorUtils.offsetHSL(color, 0, 0, luminance);

  result.rgba[3] = opacity;

  return result.rgba
}

const centerTranslation = (context, width, height) => {
  context.translate(width * 0.5, height * 0.5);
}

const subContext = (context, cb) => {
  context.save();
  cb();
  context.restore();
}

const configureShadow = ({
  context,
  color = 'rgba(0, 0, 0, 1)',
  offsetX = 0,
  offsetY = 0,
  blur = 0
}) => {
  context.shadowColor = color;
  context.shadowOffsetX = offsetX;
  context.shadowOffsetY = offsetY;
  context.shadowBlur = blur
}

const sketch = ({ width, height }) => {
  const repeats = 40;
  const degrees = -30;

  const rects = [];

  const rectColors = [
    randomUtils.pick(risoColors).hex,
    randomUtils.pick(risoColors).hex
  ]

  const bgColor = randomUtils.pick(risoColors).hex;
  const outerPolyStrokeColor = randomUtils.pick(rectColors);

  const mask = {
    radius: width * 0.3,
    sides: 3,
  };

  // Since the render function is called when
  // saving an image from the browser, we need
  // to create collections outside the render
  // so that the same collection is available
  // to each render tick.
  // Save, refresh, will of course run this code again
  // and therefore generate a new collection.
  for (let i = 0; i < repeats; i += 1) {
    const fill = randomUtils.pick(rectColors);
    const stroke = randomUtils.pick(rectColors);

    const x = randomUtils.range(0, width);
    const y = randomUtils.range(0, height);
    const w = randomUtils.range(600, width);
    const h = randomUtils.range(40, 200);

    rects.push({ x, y, w, h, fill, stroke });
  }

  /**
   * This is the render function
   *
   * @param {{ context: CanvasRenderingContext2D, width: number, height: number }} opts
   */
  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    subContext(context, () => {
      centerTranslation(context, width, height);

      drawPolygon({ context, ...mask });

      context.lineWidth = 10;
      context.strokeStyle = 'black';
      context.stroke();
    });

    context.clip();

    rects.forEach(({ x, y, w, h, fill, stroke }) => {
      subContext(context, () => {
        context.translate(x, y); // center
        context.strokeStyle = stroke;
        context.fillStyle = fill;
        context.lineWidth = 10;

        context.globalCompositeOperation = randomUtils.value() > 0.5 ? 'overlay' : 'source-over';

        drawSkewedRectangle({ context, w, h, degrees })

        subContext(context, () => {
          // We don't want shadow on the stroke, only the fill
          configureShadow({
            context,
            color: colorUtils.style(deriveLesserColor(fill, -20, 0.8)),
            offsetX: -10,
            offsetY: 20,
            blur: 8,
          });

          context.fill();
        });

        context.stroke();

        context.globalCompositeOperation = 'source-over';

        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();
      });
    });

    context.restore(); // need one to stop clipping

    subContext(context, () => {
      centerTranslation(context, width, height);

      drawPolygon({ context, ...mask });

      subContext(context, () => {
        configureShadow({
          context,
          color: colorUtils.style(deriveLesserColor('black', -10, 0.5)),
          offsetX: 0,
          offsetY: 10,
          blur: 10,
        })

        context.strokeStyle = outerPolyStrokeColor;
        context.lineWidth = 30;

        context.stroke();
      });
    });
  };
};

canvasSketch(sketch, settings);
