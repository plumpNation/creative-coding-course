const canvasSketch = require('canvas-sketch');
const mathUtils = require('canvas-sketch-util/math');
const randomUtils = require('canvas-sketch-util/random');
const colorUtils = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');
const random = require('canvas-sketch-util/random');

// Change for new artwork
const seed = 1; // random.getRandomSeed();

const artboard = 1000

const settings = {
  dimensions: [ artboard, artboard ],
  // animate: true,
  fps: 60,
  name: 'triangle-' + seed, // use the seed as the name
};

/**
 * Calculate the coordinates for a specific angle
 * at a specific radius from starting point.
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

/**
 * @param {CanvasRenderingContext2D} context
 * @param {number} width
 * @param {number} height
 */
const centerTranslation = (context, width, height) => {
  // 0.58 is a hack to centre the triangle in the easiest way
  context.translate(width * 0.5, height * 0.58);
}

/**
 * Safe and predictable way to enforce context is always restored.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {() => {}} cb
 */
const subContext = (context, cb) => {
  context.save();
  cb();
  context.restore();
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {{ color: string; offsetX: number; offsetY: number; blur: number }} options
 */
const configureShadow = (context, {
  color = 'rgba(0, 0, 0, 1)',
  offsetX = 0,
  offsetY = 0,
  blur = 0
}) => {
  context.shadowColor = color;
  context.shadowOffsetX = offsetX;
  context.shadowOffsetY = offsetY;
  context.shadowBlur = blur
};

/**
 * Create a mask, and add contents.
 * @param {CanvasRenderingContext2D} context
 * @param {() => void} createMask
 * @param {() => void} createContents
 */
const clip = (context, createMask, createContents) => {
  createMask();
  context.clip();
  createContents();
  context.restore(); // needed after clip
}

/**
 * This is the main application controller.
 * It is run by the canvas-sketch application.
 *
 * @param {{ context: CanvasRenderingContext2D, width: number, height: number }} options
 */
const sketch = ({ width, height }) => {
  random.setSeed(seed);

  const repeats = 40;
  const degrees = -30;

  const rects = [];

  const rectColors = [
    randomUtils.pick(risoColors).hex,
    randomUtils.pick(risoColors).hex
  ]

  const bgColor = randomUtils.pick(risoColors).hex;
  const outerPolyStrokeColor = randomUtils.pick(rectColors);

  const maskOptions = {
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
    const w = randomUtils.range(width - (width * 0.3), width);

    const rectMaxHeight = height * 0.2;

    const h = randomUtils.range(rectMaxHeight - (rectMaxHeight * 0.9), rectMaxHeight);

    console.log(h)

    rects.push({ x, y, w, h, fill, stroke });
  }

  /**
   * This is the render function
   *
   * @param {{ context: CanvasRenderingContext2D, width: number, height: number }} options
   */
  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    clip(context, () => {
      // mask
      subContext(context, () => {
        centerTranslation(context, width, height);

        drawPolygon(context, maskOptions);
      });
    }, () => {
      // mask contents
      rects.forEach(({ x, y, w, h, fill, stroke }) => {
        subContext(context, () => {
          // DRAW A RECTANGLE
          context.translate(x, y);
          context.strokeStyle = stroke;
          context.fillStyle = fill;
          context.lineWidth = artboard * 0.01;

          // Randomly use overlay blend mode on rectangle.
          context.globalCompositeOperation = randomUtils.value() > 0.5 ? 'overlay' : 'source-over';

          drawSkewedRectangle(context, { w, h, degrees })

          subContext(context, () => {
            // ADD SHADOW TO THE FILL
            configureShadow(context, {
              color: colorUtils.style(deriveLesserColor(fill, -20, 0.8)),
              offsetX: -10,
              offsetY: 20,
              blur: 8,
            });

            context.fill();
          });

          context.stroke();

          // We don't want the next stroke to be blend mode
          context.globalCompositeOperation = 'source-over';

          context.lineWidth = artboard * 0.001;
          context.strokeStyle = 'black';
          context.stroke();
        });
      });
    });

    subContext(context, () => {
      // DRAW THE OUTER TRIANGLE FRAME
      centerTranslation(context, width, height);

      context.strokeStyle = outerPolyStrokeColor;
      context.lineWidth = artboard * 0.02;
      context.globalCompositeOperation = 'color-burn';

      drawPolygon(context, { ...maskOptions, radius: maskOptions.radius - context.lineWidth });

      subContext(context, () => {
        // ADD SHADOWN TO OUTER TRIANGLE FRAME
        configureShadow(context, {
          color: colorUtils.style(deriveLesserColor('black', -10, 0.5)),
          offsetX: 0,
          offsetY: 10,
          blur: 10,
        });

        context.stroke();
      });

      // Just for sanity, reset the blend mode.
      context.globalCompositeOperation = 'source-over';
    });
  };
};

canvasSketch(sketch, settings);
