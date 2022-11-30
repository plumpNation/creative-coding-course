const canvasSketch = require('canvas-sketch');

const { grid } = require('./common/shapes');

const settings = {
  /** @type {[number, number]} */
  dimensions: [1080, 1080],
};

const sketch = ({ width, height }) => {
  const grid1 = grid()
    .columns(10)
    .rows(10)
    .width(width)
    .height(height);

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    grid1
      .drawPoints(context, { color: 'red', radius: 5 })
  };
};

canvasSketch(sketch, settings);
