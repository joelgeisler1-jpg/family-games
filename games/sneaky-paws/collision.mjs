import { ARM_R } from './constants.mjs';
import { dist, segDist } from './geometry.mjs';
import { guardPos } from './guards.mjs';
import { inCamera, pulseActive } from './hazards.mjs';

function segmentBlocked(a, b, L, clock, switchOn, cameraAngle) {
  const len = dist(a, b),
    steps = Math.max(1, Math.ceil(len / 5));
  for (let i = 1; i <= steps; i++) {
    let p = { x: a.x + ((b.x - a.x) * i) / steps, y: a.y + ((b.y - a.y) * i) / steps };
    let issue = hit(p, L, clock, switchOn, cameraAngle);
    if (issue) return { ...issue, point: p };
  }
  return null;
}
function hit(p, L, clock, switchOn, cameraAngle) {
  for (let w of L.walls)
    if (p.x > w.x - ARM_R && p.x < w.x + w.w + ARM_R && p.y > w.y - ARM_R && p.y < w.y + w.h + ARM_R)
      return { msg: 'The arm bumped a solid object!', kind: 'wall' };
  for (let sp of L.spools || [])
    if (dist(p, sp) < sp.r + ARM_R)
      return { msg: 'The reel is solid! Loop AROUND its blue ring.', kind: 'wall' };
  for (let laser of L.lasers || [])
    if (
      !(laser.gate && switchOn) &&
      segDist(p, { x: laser.x1, y: laser.y1 }, { x: laser.x2, y: laser.y2 }) < ARM_R + 8
    )
      return { msg: 'A laser beam set off the alarm!', kind: 'laser' };
  if (
    L.pulse &&
    pulseActive(L.pulse, clock) &&
    segDist(p, { x: L.pulse.x1, y: L.pulse.y1 }, { x: L.pulse.x2, y: L.pulse.y2 }) < ARM_R + 6
  )
    return { msg: 'The blaster beam hit the arm!', kind: 'laser' };
  for (let g of L.guards || [])
    if (dist(p, guardPos(g, clock)) < (g.vision ? 31 : g.r) + ARM_R)
      return { msg: 'A guard caught your sneaky arm!', kind: 'guard' };
  if (L.camera && inCamera(p, L.camera, cameraAngle, L.walls))
    return { msg: 'The camera spotted your arm!', kind: 'camera' };
  return null;
}
function hitGuardsOnly(p, guards, clock) {
  for (let g of guards)
    if (dist(p, guardPos(g, clock)) < (g.vision ? 31 : g.r) + ARM_R)
      return { msg: 'You touched a guard!', kind: 'guard' };
  return null;
}

export { hitGuardsOnly, segmentBlocked };
