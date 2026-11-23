const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  segDist = (p, a, b) => {
    const dx = b.x - a.x,
      dy = b.y - a.y,
      d = dx * dx + dy * dy || 1,
      t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / d));
    return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
  };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function lineOfSight(a, b, walls, step = 8) {
  const steps = Math.ceil(dist(a, b) / step);
  for (let i = 1; i < steps; i++) {
    const x = a.x + ((b.x - a.x) * i) / steps,
      y = a.y + ((b.y - a.y) * i) / steps;
    if (walls.some((w) => x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h)) return false;
  }
  return true;
}

export { clamp, dist, lineOfSight, segDist };
