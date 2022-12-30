const { calculateHypoteneuseLength } = require('./helper');

class Point {
  /** @type {number} */
  x;
  /** @type {number} */
  y;

  /**
   * For use with animation
   *
   * @type {number}
   */
  initialX;
  /**
   * For use with animation
   *
   * @type {number}
   */
  initialY;

  /** @type {boolean} Is the point currently being dragged. */
  _isDragging = false;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor (x, y) {
    this.x = x;
    this.y = y;

    this.initialX = x;
    this.initialY = y;
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
   * @param {{ size?: number, color?: FillStyle }} [options]
   */
  draw (context, options) {
    const size = options?.size ?? 10;

    context.save();
    context.translate(this.x, this.y);

    context.fillStyle = options?.color || 'black';

    context.beginPath();
    context.arc(0, 0, size, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  hitTest (x, y) {
    const distance = calculateHypoteneuseLength(this.x, this.y, x, y);

    // todo, this may need to be relative to the artboard
    return distance < 20;
  }
}

module.exports = Point;
