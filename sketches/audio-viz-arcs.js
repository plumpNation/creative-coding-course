const canvasSketch = require('canvas-sketch');
const mathUtils = require('canvas-sketch-util/math');
const randomUtils = require('canvas-sketch-util/random');
const eases = require('eases');

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CanvasSketchSettings} */
const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

/** @type {HTMLAudioElement} */
let audio;
/** @type {AnalyserNode} */
let analyserNode;
/** @type {Float32Array} */
let audioData;

let manager;
let minDb, maxDb;

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CreateSketch<typeof settings>} */
const sketch = () => {
  const circleCount = 5;
  const sliceCount = 9;
  const slice = Math.PI * 2 / sliceCount;
  const radius = 200;

  /** @type number[] */
  const bins = [];
  /** @type number[] */
  const lineWidths = [];

  for (let i = 0; i < circleCount * sliceCount; i++) {
    let bin = randomUtils.rangeFloor(4, 64);

    if (randomUtils.value() > 0.5) {
      bin = 0;
    }

    bins.push(bin);
  }

  // Create large line widths for circles as they get larger.
  for (let i = 0; i < circleCount; i++) {
    const t = i / (circleCount - 1);
    // based on this easing
    const lineWidth = eases.quadIn(t) * 200 + 20;

    lineWidths.push(lineWidth);
  }

  return ({ context, width, height }) => {
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    if (!analyserNode) {
      return;
    }

    // copy the decibel value of each frequency to the array
    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(width * 0.5, height * 0.5);

    let circleRadius = radius;

    // foreach circle
    for (let i = 0; i < circleCount; i++) {
      context.save();

      circleRadius += lineWidths[i] * 0.5 + 2;

      // foreach slice
      for (let j = 0; j < sliceCount; j++) {
        context.rotate(slice);

        const bin = bins[i * sliceCount + j];

        if (!bin) {
          continue;
        }

        const lineWidthMultiplier = mathUtils.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);
        const lineWidth = lineWidths[i] * lineWidthMultiplier;

        if (lineWidth < 1) {
          continue;
        }

        context.lineWidth = lineWidth;

        const r = circleRadius + context.lineWidth * 0.5;

        context.beginPath();
        context.arc(0, 0, r, 0, slice);
        context.stroke();
      }

      circleRadius += lineWidths[i];

      context.restore();
    }

    context.restore();
  };
};

const addAudioListeners = () => {
  /** autoplay and audioContext require user interaction. */
  window.addEventListener('mouseup', () => {
    if (!audio) {
      audio = createAudio();
    }

    if (audio.paused) {
      audio.play();
      manager.play();
      console.info('Playing audio...');
    } else {
      audio.pause();
      manager.pause();
      console.info('Paused audio...');
    }
  });
};

/**
 * Create the audio object, and the analyser we will use
 * to drive the animation.
 *
 * @see https://www.youtube.com/watch?v=nmgFG7PUHfo
 */
const createAudio = () => {
  const audio = document.createElement('audio');

  audio.src = 'audio/demo1.mp3';

  const audioContext = new window.AudioContext();
  const sourceNode = audioContext.createMediaElementSource(audio);

  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512; // always needs to be a power of 2
  analyserNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyserNode);

  // Create the array we will be using as memory space for the
  // data we get out of the analyserNode on each render tick.
  if (!audioData) {
    audioData = new Float32Array(analyserNode.frequencyBinCount);
  }

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

  return audio;
};

/**
 *
 * @param {Float32Array} frequencyData
 */
const getAverageFrequencyDecibel = (frequencyData) => {
  // Can be a for loop for perf reasons if needed
  const sum = Array.from(frequencyData).reduce((total, next) =>
    total + next
  , 0);

  return sum / frequencyData.length;
};

const start = async () => {
  addAudioListeners();

  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();
