const canvasSketch = require('canvas-sketch');
const mathUtils = require('canvas-sketch-util/math');
const randomUtils = require('canvas-sketch-util/random');
const createColormap = require('colormap');

// const colors = require('./common/colors');
const { grid } = require('./common/shapes');

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CanvasSketchSettings} */
const settings = {
  dimensions: [1080, 1080],
};

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

  // const segmentColors = [
  //   random.pick(colors).hex,
  //   random.pick(colors).hex,
  //   random.pick(colors).hex,
  // ];

  /**
   * @type string[]
   */
  // @ts-ignore
  const colormap = createColormap({
    colormap: 'cool',
    nshades: amplitude,
  });

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    grid1
      // .drawRowLines(context, { color: 'yellow', width: 10 })
      // .drawRowCurves(context, { color: 'yellow', width: 10 })
      // .drawPoints(context, { color: 'red', radius: 10 })
      .mutatePoints((point) => {
        const noise = randomUtils.noise2D(
          point.x,
          point.y,
          frequency,
          amplitude,
        );

        point.x += noise;
        point.y += noise;
      })
      .drawSegmentRowCurves(context, {
        color: (point) => {
          // return random.pick(segmentColors);

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
