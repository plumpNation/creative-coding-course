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
  _points = [];
  /** @type {number} */
  _width = 300;
  /** @type {number} */
  _height = 300;
  /** @type {number} */
  _margin = 0.5;
  /** @type {number} */
  _columns = 5;
  /** @type {number} */
  _rows = 5;
  /** @type {FillStyle} */
  _pointFill = 'red';

  /** @param {number} value */
  width (value) {
    this._width = value;

    return this;
  }

  /** @param {number} value */
  height (value) {
    this._height = value;

    return this;
  }

  /** @param {number} value */
  columns (value) {
    this._columns = value;

    return this;
  }

  /** @param {number} value */
  rows (value) {
    this._rows = value;

    return this;
  }

  _createPoints (cellWidth, cellHeight) {
    const numCells = this._columns * this._rows;
    const points = [];

    for (let i = 0; i < numCells; i++) {
      const x = (i % this._columns) * cellWidth;
      const y = Math.floor(i / this._columns) * cellHeight;

      points.push(new Point(x, y));
    }

    return points;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {{ pointFill: FillStyle }} [options]
   */
  draw (context, options) {
    /** @type {Point[]} */
    const points = [];

    const numCells = this._columns * this._rows;

    const gridWidth = this._width;
    const gridHeight = this._height;

    const cellWidth = gridWidth / this._columns;
    const cellHeight = gridHeight / this._rows;

    for (let i = 0; i < numCells; i++) {
      const x = (i % this._columns) * cellWidth;
      const y = Math.floor(i / this._columns) * cellHeight;

      points.push(new Point(x, y));
    }

    context.save();

    // Centering the grid means we need to figure out
    // a nice equal distance from each side of the width.
    const mx = (this._width / this._columns + 2) * 0.5;
    const my = (this._height / this._rows + 2) * 0.5;

    context.translate(mx, my);

    points.forEach(point => {
      point.draw(context, { fill: options.pointFill || this._pointFill });
    });

    context.restore();
  }
}

const grid = () => new Grid();

module.exports = {
  grid,
  drawSkewedRectangle,
  drawPolygon,
};
