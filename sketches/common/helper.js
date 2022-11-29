const mathUtils = require('canvas-sketch-util/math');
const colorUtils = require('canvas-sketch-util/color');

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 *
 * \sqrt {x^2 + y^2}
 *
 * @returns {number}
 */
const calculateHypoteneuseLength = (x1, y1, x2, y2) => {
  const dx = x1 - x2;
  const dy = y1 - y2;

  return Math.sqrt((dx * dx) + (dy * dy));
};

/**
 * @param {string} color
 * @param {number} luminance HSL Luminance
 * @param {number} opacity Alpha channel decimal
 * @returns {string} rgba style value
 */
const deriveLesserColor = (color, luminance, opacity) => {
  const result = colorUtils.offsetHSL(color, 0, 0, luminance);

  result.rgba[3] = opacity;

  return result.rgba;
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {number} width
 * @param {number} height
 */
const centerTranslation = (context, width, height) => {
  // 0.58 is a hack to centre the triangle in the easiest way
  context.translate(width * 0.5, height * 0.58);
};

/**
 * Safe and predictable way to enforce context is always restored.
 * Easy code nesting also helps with reading and debugging when using save/restore.
 *
 * @todo It's likely that this is not the best practice, I see a lot of people
 * saying to prefer `context.setTransform`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {() => void} cb
 */
const subContext = (context, cb) => {
  context.save();
  cb();
  context.restore();
};

/**
 * Calculate the coordinates for a specific angle
 * at a specific radius from starting point.
 *
 * @param {number} angle
 * @param {number} radius
 * @returns {{x: number, y: number}}
 */
const getCartesianCoords = (angle, radius) => {
  const radians = mathUtils.degToRad(angle);

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius
  };
};

/**
 * Fluid syntax on shadow creation.
 */
class Shadow {
  /** @type {CanvasRenderingContext2D} */
  context;

  /**
   * @param {CanvasRenderingContext2D} context
   */
  constructor (context) {
    this.context = context;

    context.shadowColor = 'rgba(0, 0, 0, 1)';
  }

  /**
   * @param {string} color
   */
  color = (color) => {
    this.context.shadowColor = color;

    return this;
  };

  /**
   * @param {number} value
   */
  offsetX = (value) => {
    this.context.shadowOffsetX = value;

    return this;
  };

  /**
   * @param {number} value
   */
  offsetY = (value) => {
    this.context.shadowOffsetY = value;

    return this;
  };

  /**
   * @param {number} value
   */
  blur = (value) => {
    this.context.shadowBlur = value;

    return this;
  };
}

/**
 * Instantiates a Shadow class for fluid syntax.
 *
 * @param {CanvasRenderingContext2D} context
 */
const shadow = (context) => new Shadow(context);

/**
 * Create a mask, and add contents. Automatically ends the clipping after the
 * contents are rendered. Keeps code nested for easy reading/debugging.
 * However, it's possible that you won't come across so many happy accidents
 * when using clip in this more controlled way.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {() => void} createMask
 * @param {() => void} createContents
 */
const clip = (context, createMask, createContents) => {
  createMask();
  context.clip();
  createContents();
  context.restore(); // needed after clip
};

/**
 * Takes the canvas scale into consideration and provides
 * the x and y that are relative to the canvas.
 * Used with event.offsetY and offsetX.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} x
 * @param {number} y
 * @returns {{ x: number, y: number }}
 */
const normalizePosition = (canvas, x, y) => {
  const nx = (x / canvas.offsetWidth) * canvas.width;
  const ny = (y / canvas.offsetHeight) * canvas.height;

  return { x: nx, y: ny };
};

module.exports = {
  shadow,
  getCartesianCoords,
  centerTranslation,
  subContext,
  clip,
  deriveLesserColor,
  calculateHypoteneuseLength,
  normalizePosition,
};
