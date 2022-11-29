const { calculateHypoteneuseLength } = require('./helper');

class Point {
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {boolean} Is a control point i.e. on a quadratic curve. */
  _isControl = false;
  /** @type {boolean} Is the point currently being dragged. */
  _isDragging = false;

  /**
   * @param {number} x
   * @param {number} y
   * @param {boolean} [isControl]
   */
  constructor (x, y, isControl) {
    this.x = x;
    this.y = y;

    this._isControl = isControl;
  }

  startDrag () {
    this._isDragging = true;
  }

  stopDrag () {
    this._isDragging = false;
  }

  isDragging () {
    return this._isDragging;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {{ fill: FillStyle }} [options]
   */
  draw (context, options) {
    context.save();
    context.translate(this.x, this.y);

    context.fillStyle = options?.fill || (this._isControl ? 'red' : 'black');

    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  hitTest (x, y) {
    const distance = calculateHypoteneuseLength(this.x, this.y, x, y);

    // todo, this may need to be relative to the artboard
    return distance < 20;
  }
}

module.exports = Point;
