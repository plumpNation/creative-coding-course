const { getCartesianCoords, shadow } = require('./helper');
const Point = require('./Point');

/**
 * @param {CanvasRenderingContext2D} context
 * @param {{ radius: number, sides: number }} options
 */
const drawPolygon = (context, { radius = 300, sides = 6 }) => {
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for (let i = 0; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;

    context.lineTo(
      Math.cos(theta) * radius,
      Math.sin(theta) * radius,
    );
  }

  context.closePath();
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {{ degrees: number; w: number; h: number; }} options
 */
const drawSkewedRectangle = (context, {
  degrees,
  w = 600,
  h = 200,
}) => {
  const { x, y } = getCartesianCoords(degrees, w);

  context.translate(x * -0.5, (y + h) * -0.5); // move draw origin

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(x, y);
  context.lineTo(x, y + h);
  context.lineTo(0, h);
  context.closePath();
};

/**
 * @param {FillStyle | (() => FillStyle) | undefined} color
 * @param {FillStyle} [defaultColor]
 * @return {FillStyle}
 */
const determineStrokeColor = (color, defaultColor = 'red') => {
  if (typeof color === 'string') {
    return color;
  }

  if (typeof color === 'function') {
    return color();
  }

  return defaultColor;
};

/**
   * @param {number | (() => number) | undefined} width
   * @param {number} [defaultWidth]
   * @return {number}
   */
const determineStrokeWidth = (width, defaultWidth = 4) => {
  if (typeof width === 'number') {
    return width;
  }

  if (typeof width === 'function') {
    width = width();
  }

  return defaultWidth;
};

class Grid {
  /** @type {Point[]} */
  #_points = [];

  #_width = 300;
  #_height = 300;
  #_margin = 0.5; // 0.5 is centered given width and height
  #_columns = 5;
  #_rows = 5;
  /** @type {FillStyle} */
  #_pointFill = 'red';
  #_pointSize = 10;

  /** @type {number | undefined} */
  #_cellWidth;
  /** @type {number | undefined} */
  #_cellHeight;

  /** @type {{ frequency: number; amplitude: number; } | undefined} */
  #_noise;

  /** @param {number} value */
  width (value) {
    this.#_width = value;

    return this;
  }

  /** @param {number} value */
  height (value) {
    this.#_height = value;

    return this;
  }

  /** @param {number} value */
  columns (value) {
    this.#_columns = value;

    return this;
  }

  /** @param {number} value */
  rows (value) {
    this.#_rows = value;

    return this;
  }

  /**
   * Exposing translation means that it's easier to match up
   * other components with this one.
   */
  getTranslation () {
    // Centering the grid means we need to figure out
    // a nice equal distance from each side of the width.
    const x = this.#_cellWidth * this.#_margin;
    const y = this.#_cellHeight * this.#_margin;

    return { x, y };
  }

  /**
   * Exposing points so they can be used (with translation)
   * to draw with.
   */
  getPoints () {
    return this.#_points;
  }

  /**
   * Generate all the computed properties without drawing.
   */
  build () {
    const numCells = this.#_columns * this.#_rows;

    this.#_cellWidth = this.#_width / this.#_columns;
    this.#_cellHeight = this.#_height / this.#_rows;

    for (let i = 0; i < numCells; i++) {
      const x = (i % this.#_columns) * this.#_cellWidth;
      const y = Math.floor(i / this.#_columns) * this.#_cellHeight;

      // If animating, this is only the initial point positions.
      this.#_points.push(new Point(x, y));
    }

    return this;
  }

  /**
   * Draws a graphical representation of the grid points onto the canvas.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {{ color?: FillStyle, radius?: number, shadow?: { color: string, blur?: number } }} [options]
   */
  drawPoints (context, options) {
    if (!this.#_points.length) {
      this.build();
    }

    context.save();

    const { x: mx, y: my } = this.getTranslation();

    context.translate(mx, my);

    if (options?.shadow) {
      shadow(context)
        .blur(options.shadow.blur || 10)
        .color(options.shadow.color || 'black');
    }

    this.#_points.forEach(point => {
      point.draw(context, {
        color: options?.color ?? this.#_pointFill,
        size: options?.radius ?? this.#_pointSize,
      });
    });

    context.restore();

    return this;
  }

  /**
   * Most useful in the render tick to provide animation.
   *
   * @param {(point: Point) => void} mutateFn
   */
  mutatePoints (mutateFn) {
    this.#_points.forEach(mutateFn);

    return this;
  }

  /**
   * Draw quadratic curves through the grid row points.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {{ color?: FillStyle, width?: number }} [options]
   */
  drawRowCurves (context, options) {
    if (!this.#_points.length) {
      this.build();
    }

    context.strokeStyle = options?.color ?? 'red';
    context.lineWidth = options?.width ?? 4;

    const translation = this.getTranslation();

    context.translate(translation.x, translation.y);

    for (let r = 0; r < this.#_rows; r++) {
      context.beginPath();

      for (let c = 0; c < this.#_columns - 1; c++) {
        const points = this.getPoints();

        const curr = points[r * this.#_columns + c + 0];
        const next = points[r * this.#_columns + c + 1];

        const mx = curr.x + (next.x - curr.x) * 0.5;
        const my = curr.y + (next.y - curr.y) * 0.5;

        if (c === 0) {
          context.moveTo(curr.x, curr.y);
        } else if (c === this.#_columns - 2) {
          context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
        } else {
          context.quadraticCurveTo(curr.x, curr.y, mx, my);
        }
      }

      context.stroke();
    }

    return this;
  }

  /**
   * Draw segmented quadrative curves through row points.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {{ color?: FillStyle | ((point: Point) => FillStyle), width?: number | ((point: Point) => number) }} [options]
   */
  drawSegmentRowCurves (context, options) {
    if (!this.#_points.length) {
      this.build();
    }

    context.save();

    const translation = this.getTranslation();

    context.translate(translation.x, translation.y);

    let lastX, lastY;

    for (let r = 0; r < this.#_rows; r++) {
      for (let c = 0; c < this.#_columns; c++) {
        const pointIndex = r * this.#_columns + c + 0;
        const nextPointIndex = c === this.#_columns - 1 ? pointIndex : pointIndex + 1;

        const points = this.getPoints();

        const curr = points[pointIndex];
        const next = points[nextPointIndex];

        const mx = curr.x + (next.x - curr.x) * 0.8;
        const my = curr.y + (next.y - curr.y) * 5.5;

        if (c === 0) {
          lastX = curr.x;
          lastY = curr.y;
        }

        context.beginPath();

        // There may be performance problems with continously
        // calling functions to calculate color.
        // Perhaps don't do this if color is a single value.
        const strokeColor = typeof options?.color === 'function'
          ? options?.color(curr)
          : options?.color;

        const strokeWidth = typeof options?.width === 'function'
          ? options?.width(curr)
          : options?.width;

        context.strokeStyle = determineStrokeColor(strokeColor);
        context.lineWidth = determineStrokeWidth(strokeWidth);

        context.moveTo(lastX, lastY);

        if (c === this.#_columns - 1) {
          context.quadraticCurveTo(lastX, lastY, curr.x, curr.y);
        } else {
          context.quadraticCurveTo(curr.x, curr.y, mx, my);
        }

        context.stroke();

        lastX = mx - c / this.#_columns * 250;
        lastY = my - r / this.#_rows * 250;
      }
    }

    context.restore();

    return this;
  }

  /**
   * Draw straight lines from point to point in rows.
   * Provide line color and width in options.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {{ color?: FillStyle, width?: number }} [options]
   */
  drawRowLines (context, options) {
    if (!this.#_points.length) {
      this.build();
    }

    context.strokeStyle = options?.color ?? 'red';
    context.lineWidth = options?.width ?? 4;

    const translation = this.getTranslation();

    context.translate(translation.x, translation.y);

    for (let r = 0; r < this.#_rows; r++) {
      context.beginPath();

      for (let c = 0; c < this.#_columns; c++) {
        const curr = this.getPoints()[r * this.#_columns + c];

        if (c === 0) {
          context.moveTo(curr.x, curr.y);
        } else {
          context.lineTo(curr.x, curr.y);
        }
      }

      context.stroke();
    }

    return this;
  }
}

const grid = () => new Grid();

module.exports = {
  grid,
  drawSkewedRectangle,
  drawPolygon,
};
