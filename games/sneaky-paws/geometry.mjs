const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const interpolate = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

function squaredSegDist(p, a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return (p.x - a.x - t * dx) ** 2 + (p.y - a.y - t * dy) ** 2;
}

function segDist(p, a, b) {
  return Math.sqrt(squaredSegDist(p, a, b));
}

function segmentDistance(a, b, c, d) {
  const ux = b.x - a.x,
    uy = b.y - a.y;
  const vx = d.x - c.x,
    vy = d.y - c.y;
  const cross = ux * vy - uy * vx;
  if (cross) {
    const x = c.x - a.x,
      y = c.y - a.y;
    const t = (x * vy - y * vx) / cross;
    const s = (x * uy - y * ux) / cross;
    if (t >= 0 && t <= 1 && s >= 0 && s <= 1) return 0;
  }
  return Math.min(segDist(a, c, d), segDist(b, c, d), segDist(c, a, b), segDist(d, a, b));
}

// Return the entry point of a line into an open rectangle. A tangent
// can graze its boundary without entering the rectangle.
function rectangleEntry(a, b, box) {
  let enter = 0,
    exit = 1;
  for (const [axis, size] of [
    ['x', 'w'],
    ['y', 'h'],
  ]) {
    const delta = b[axis] - a[axis];
    if (!delta) {
      if (a[axis] <= box[axis] || a[axis] >= box[axis] + box[size]) return null;
      continue;
    }
    const near = (box[axis] - a[axis]) / delta;
    const far = (box[axis] + box[size] - a[axis]) / delta;
    enter = Math.max(enter, Math.min(near, far));
    exit = Math.min(exit, Math.max(near, far));
    if (enter >= exit) return null;
  }
  return interpolate(a, b, enter);
}

function lineOfSight(a, b, walls) {
  return !walls.some((wall) => rectangleEntry(a, b, wall));
}

function beamDistance(a, b, beam) {
  if (
    Math.max(a.x, b.x) < Math.min(beam.x1, beam.x2) - 24 ||
    Math.min(a.x, b.x) > Math.max(beam.x1, beam.x2) + 24 ||
    Math.max(a.y, b.y) < Math.min(beam.y1, beam.y2) - 24 ||
    Math.min(a.y, b.y) > Math.max(beam.y1, beam.y2) + 24
  )
    return Infinity;
  return segmentDistance(a, b, { x: beam.x1, y: beam.y1 }, { x: beam.x2, y: beam.y2 });
}

function findArmSegment(points, test) {
  for (let i = points.length - 1; i >= 0; i--) {
    if (test(points[i - 1] ?? points[i], points[i])) return points[i];
  }
  return null;
}

function segmentInView(a, b, origin, range, seesPoint) {
  if (squaredSegDist(origin, a, b) > range ** 2) return false;
  const steps = Math.max(1, Math.ceil(dist(a, b) / 2));
  for (let i = 0; i <= steps; i++) {
    if (seesPoint(i === 0 ? a : i === steps ? b : interpolate(a, b, i / steps))) return true;
  }
  return false;
}

export {
  beamDistance,
  clamp,
  dist,
  findArmSegment,
  lineOfSight,
  rectangleEntry,
  segDist,
  segmentInView,
  squaredSegDist,
};
