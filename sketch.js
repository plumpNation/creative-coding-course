const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 800, 800 ],
  animate: true,
  fps: 60,
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'red';
    context.fillRect(0, 0, width, height);
  };
};

canvasSketch(sketch, settings);
