const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 800, 800 ],
  animate: true,
  fps: 60,
};

const sketch = () => {
  let x, y, w, h;

  return ({ context, width, height }) => {
    // context.fillStyle = 'blue';
    // context.fillRect(0, 0, width, height);

    w = width * 0.6;
    h = width * 0.1;
    x = width * 0.5;
    y = width * 0.5;

    context.save()
    context.translate(x, y); // center
    context.translate(w * -0.5, h * -0.5); // move draw origin

    context.strokeStyle = 'blue';

    // context.strokeRect(0, 0, w, h);

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(w, 0);
    context.lineTo(w, h);
    context.lineTo(0, h);
    context.lineTo(0, 0);

    context.stroke();

    context.restore()
  };
};

canvasSketch(sketch, settings);
