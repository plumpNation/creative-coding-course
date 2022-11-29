const { normalizePosition } = require('./helper');
// eslint-disable-next-line no-unused-vars
const Point = require('./Point');

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Point[]} points
 * @param {(x: number, y: number) => void} [noHitCallback] What to do if there's no hit target
 */
const setupPointInteractions = (canvas, points, noHitCallback) => {
  /**
   * @param {MouseEvent} event
   */
  const handleMouseDown = (event) => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const { x, y } = normalizePosition(
      canvas,
      event.offsetX,
      event.offsetY,
    );

    // Grab a point if you are mousedowning near enough to it.
    points.forEach(point => {
      if (point.hitTest(x, y)) {
        point.startDrag();
      }
    });

    const hit = points.some(point => point.isDragging());

    if (!hit) {
      noHitCallback?.(x, y);
    }
  };

  /**
   * @param {MouseEvent} event
   */
  const handleMouseMove = (event) => {
    const { x, y } = normalizePosition(
      canvas,
      event.offsetX,
      event.offsetY,
    );

    points.forEach(point => {
      if (!point.isDragging()) {
        return;
      }

      point.x = x;
      point.y = y;
    });
  };

  /**
   * Cleanup on the mouseup
   */
  const handleMouseUp = () => {
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleMouseMove);

    points.forEach(point => point.stopDrag());
  };

  window.addEventListener('mousedown', handleMouseDown);
};

module.exports = {
  setupPointInteractions,
};
