const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const colors = require('./common/colors');
const { grid } = require('./common/shapes');

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CanvasSketchSettings} */
const settings = {
  /** @type {[number, number]} */
  dimensions: [1080, 1080],
};

const sketch = ({ width, height }) => {
  const numColumns = 10;
  const numRows = 10;

  const grid1 = grid()
    .columns(numColumns)
    .rows(numRows)
    .width(width)
    .height(height)
    .noise(0.001, 90)
    .build();

  const segmentColors = [
    random.pick(colors).hex,
    random.pick(colors).hex,
    random.pick(colors).hex,
  ];

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    grid1
      .drawPoints(context, { color: 'red', radius: 10 })
      .drawSegmentRowCurves(context, {
        color: () => random.pick(segmentColors),
      });
  };
};

canvasSketch(sketch, settings);
