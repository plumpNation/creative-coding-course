const canvasSketch = require('canvas-sketch');
const randomUtils = require('canvas-sketch-util/random');
const colorUtils = require('canvas-sketch-util/color');

const { risoColors: colors } = require('./common/colors');
const { clip, subContext, centerTranslation, deriveLesserColor, shadow } = require('./common/helper');
const { drawPolygon, drawSkewedRectangle } = require('./common/shapes');

// Change for new artwork
const seed = 1; // random.getRandomSeed();

const artboard = 1000;

/** @type {[number, number]} */
const dimensions = [artboard, artboard];

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CanvasSketchSettings} */
const settings = {
  dimensions,
  // animate: true,
  fps: 60,
  name: 'triangle-' + seed, // use the seed as the name
};

/**
 * This is the main application controller.
 * It is run by the canvas-sketch application.
 * @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CreateSketch<typeof settings>}
 */
const sketch = ({ width, height }) => {
  randomUtils.setSeed(seed);

  const repeats = 40;
  const degrees = -30;

  const rectangles = [];

  const rectColors = [
    randomUtils.pick(colors).hex,
    randomUtils.pick(colors).hex,
  ];

  const bgColor = randomUtils.pick(colors).hex;
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

    console.log(h);

    rectangles.push({ x, y, w, h, fill, stroke });
  }

  /**
   * This is the render function
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
      rectangles.forEach(({ x, y, w, h, fill, stroke }) => {
        subContext(context, () => {
          // DRAW A RECTANGLE
          context.translate(x, y);
          context.strokeStyle = stroke;
          context.fillStyle = fill;
          context.lineWidth = artboard * 0.01;

          // Randomly use overlay blend mode on rectangle.
          context.globalCompositeOperation = randomUtils.value() > 0.5 ? 'overlay' : 'source-over';

          drawSkewedRectangle(context, { w, h, degrees });

          subContext(context, () => {
            // ADD SHADOW TO THE FILL
            shadow(context)
              .color(colorUtils.style(deriveLesserColor(fill, -20, 0.8)))
              .offsetX(-10)
              .offsetY(20)
              .blur(8);

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
        shadow(context)
          .color(colorUtils.style(deriveLesserColor('black', -10, 0.5)))
          .offsetX(0)
          .offsetY(10)
          .blur(10);

        context.stroke();
      });

      // Just for sanity, reset the blend mode.
      context.globalCompositeOperation = 'source-over';
    });
  };
};

canvasSketch(sketch, settings);
