const canvasSketch = require('canvas-sketch');
const mathUtils = require('canvas-sketch-util/math');
const randomUtils = require('canvas-sketch-util/random');
const createColormap = require('colormap');

// const colors = require('./common/colors');
const { grid } = require('./common/shapes');

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CanvasSketchSettings} */
const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CreateSketch<typeof settings>} */
const sketch = ({ width, height }) => {
  const numColumns = 72;
  const numRows = 8;

  const frequency = 0.002;
  const amplitude = 50; // min 9 for colormap

  const grid1 = grid()
    .columns(numColumns)
    .rows(numRows)
    .width(width)
    .height(height)
    .build();

  /**
   * @type string[]
   */
  // @ts-ignore
  const colormap = createColormap({
    colormap: 'cool',
    nshades: amplitude,
  });

  return ({ context, width, height, frame }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    grid1
      .mutatePoints((point) => {
        const speed = 3;

        const noise = randomUtils.noise2D(
          point.initialX + frame * speed,
          point.initialY + frame * speed,
          frequency,
          amplitude,
        );

        point.x = point.initialX + noise;
        point.y = point.initialY + noise;
      })
      .drawSegmentRowCurves(context, {
        color: (point) => {
          const noise = randomUtils.noise2D(
            point.x,
            point.y,
            frequency,
            amplitude,
          );

          const colormapIndex = Math.floor(mathUtils.mapRange(
            noise,
            -amplitude,
            amplitude,
            0, // output min is first item in array
            amplitude, // output max is last item in array
            true,
          ));

          return colormap[colormapIndex];
        },
        width: (point) => {
          const noise = randomUtils.noise2D(
            point.x,
            point.y,
            frequency,
            amplitude,
          );

          return mathUtils.mapRange(
            noise,
            -amplitude,
            amplitude,
            0,
            5,
          );
        },
      });
  };
};

canvasSketch(sketch, settings);
