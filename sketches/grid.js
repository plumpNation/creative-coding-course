const canvasSketch = require('canvas-sketch');
const { math } = require('canvas-sketch-util');
// const random = require('canvas-sketch-util/random');
// const mathUtils = require('canvas-sketch-util/math');
const createColormap = require('colormap');

// const colors = require('./common/colors');
const { grid } = require('./common/shapes');

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CanvasSketchSettings} */
const settings = {
  /** @type {[number, number]} */
  dimensions: [1080, 1080],
};

const sketch = ({ width, height }) => {
  const numColumns = 72;
  const numRows = 8;

  const frequency = 2;
  const amplitude = 50;

  const grid1 = grid()
    .columns(numColumns)
    .rows(numRows)
    .width(width)
    .height(height)
    .noise(frequency, amplitude)
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

  const gridNoise = grid1.getNoise();

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    grid1
      // .drawPoints(context, { color: 'red', radius: 10 })
      .drawSegmentRowCurves(context, {
        color: (pointNoise) => {
          // return random.pick(segmentColors);

          /** @type {number} */
          const t = math.mapRange(
            pointNoise,
            -gridNoise.amplitude,
            gridNoise.amplitude,
            0, // output min is first item in array
            colormap.length - 1, // output max is last item in array
            true,
          );

          return colormap[Math.round(t)];
        },
      });
  };
};

canvasSketch(sketch, settings);
