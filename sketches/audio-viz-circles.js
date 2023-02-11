const canvasSketch = require('canvas-sketch');
const mathUtils = require('canvas-sketch-util/math');

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

/** @type {import('canvas-sketch-types/canvas-sketch/lib/core/SketchManager').CreateSketch<typeof settings>} */
const sketch = () => {
  const bins = [4, 12, 37];

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    if (!analyserNode) {
      return;
    }

    // copy the decibel value of each frequency to the array
    analyserNode.getFloatFrequencyData(audioData);

    // const avg = getAverageFrequencyDecibel(audioData);

    bins.forEach((bin) => {
      const mapped = mathUtils.mapRange(audioData[bin], analyserNode.minDecibels, analyserNode.maxDecibels, 0, 1, true);
      const radius = mapped * 300;

      context.save();
      context.translate(width * 0.5, height * 0.5);
      context.lineWidth = 10;

      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.stroke();

      context.restore();
    });
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
    } else {
      audio.pause();
      manager.pause();
    }
  });
};

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

  audioData = new Float32Array(analyserNode.frequencyBinCount);

  // console.log(audioData.length);

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
