const random = require('canvas-sketch-util/random');

const { getCartesianCoords } = require('./helper');
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
   * @param {number} frequency
   * @param {number} amplitude
   */
  noise (frequency, amplitude) {
    this.#_noise = { frequency, amplitude };

    return this;
  }

  _createPoints (cellWidth, cellHeight) {
    const numCells = this.#_columns * this.#_rows;
    const points = [];

    for (let i = 0; i < numCells; i++) {
      const x = (i % this.#_columns) * cellWidth;
      const y = Math.floor(i / this.#_columns) * cellHeight;

      points.push(new Point(x, y));
    }

    return points;
  }

  /**
   * Exposing translation means that it's easier to match up
   * other components with this one.
   */
  get translation () {
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
  get points () {
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
      let columnX = (i % this.#_columns) * this.#_cellWidth;
      let rowY = Math.floor(i / this.#_columns) * this.#_cellHeight;

      if (this.#_noise) {
        const noise = random.noise2D(
          columnX,
          rowY,
          this.#_noise.frequency,
          this.#_noise.amplitude,
        );

        columnX += noise;
        rowY += noise;
      }

      this.#_points.push(new Point(columnX, rowY));
    }

    return this;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {{ color?: FillStyle, radius?: number }} [options]
   */
  drawPoints (context, options) {
    if (!this.#_points.length) {
      this.build();
    }

    context.save();

    const { x: mx, y: my } = this.translation;

    context.translate(mx, my);

    this.#_points.forEach(point => {
      point.draw(context, {
        fill: options?.color || this.#_pointFill,
        size: options?.radius || this.#_pointSize,
      });
    });

    context.restore();

    return this;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {{ color?: FillStyle, width?: number }} [options]
   */
  drawRowCurves (context, options) {
    if (!this.#_points.length) {
      this.build();
    }

    context.strokeStyle = options?.color ?? 'red';
    context.lineWidth = options?.width ?? 4;

    context.translate(this.translation.x, this.translation.y);

    for (let r = 0; r < this.#_rows; r++) {
      context.beginPath();

      for (let c = 0; c < this.#_columns - 1; c++) {
        const curr = this.points[r * this.#_columns + c + 0];
        const next = this.points[r * this.#_columns + c + 1];

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
   * @param {CanvasRenderingContext2D} context
   * @param {{ color?: FillStyle, width?: number }} [options]
   */
  drawRowLines (context, options) {
    if (!this.#_points.length) {
      this.build();
    }

    context.strokeStyle = options?.color ?? 'red';
    context.lineWidth = options?.width ?? 4;

    context.translate(this.translation.x, this.translation.y);

    for (let r = 0; r < this.#_rows; r++) {
      context.beginPath();

      for (let c = 0; c < this.#_columns; c++) {
        const curr = this.points[r * this.#_columns + c];

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
