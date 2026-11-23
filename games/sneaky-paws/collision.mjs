import { ARM_R, REEL_RIM } from './constants.mjs';
import { beamDistance, rectangleEntry, segDist, segmentInView, squaredSegDist } from './geometry.mjs';
import { guardPos } from './guards.mjs';
import { inCamera, pulseActive } from './hazards.mjs';

function segmentBlocked(a, b, level, clock, switchOn, cameraAngle) {
  const wallClearance = ARM_R + 2.5;
  for (const wall of level.walls) {
    if (
      Math.max(a.x, b.x) <= wall.x - wallClearance ||
      Math.min(a.x, b.x) >= wall.x + wall.w + wallClearance ||
      Math.max(a.y, b.y) <= wall.y - wallClearance ||
      Math.min(a.y, b.y) >= wall.y + wall.h + wallClearance
    )
      continue;
    // A stroked arm touches the flat faces and the rounded corners of the crate.
    const r = 12 + wallClearance;
    const x = wall.x + 12,
      y = wall.y + 12;
    const w = wall.w - 24,
      h = wall.h - 24;
    const face =
      rectangleEntry(a, b, { x: x - r, y, w: w + 2 * r, h }) ??
      rectangleEntry(a, b, { x, y: y - r, w, h: h + 2 * r });
    if (
      face ||
      segDist({ x, y }, a, b) < r ||
      segDist({ x: x + w, y }, a, b) < r ||
      segDist({ x, y: y + h }, a, b) < r ||
      segDist({ x: x + w, y: y + h }, a, b) < r
    ) {
      return { msg: 'The arm bumped a solid object!', kind: 'wall', point: face ?? b };
    }
  }
  for (const spool of level.spools || []) {
    if (segDist(spool, a, b) < spool.r + REEL_RIM + ARM_R)
      return { msg: 'The reel is solid! Loop AROUND its blue ring.', kind: 'wall', point: b };
  }
  for (const laser of level.lasers || []) {
    if (!(laser.gate && switchOn) && beamDistance(a, b, laser) < ARM_R + 8)
      return { msg: 'A laser beam set off the alarm!', kind: 'laser', point: b };
  }
  if (level.pulse && pulseActive(level.pulse, clock) && beamDistance(a, b, level.pulse) < ARM_R + 6)
    return { msg: 'The blaster beam hit the arm!', kind: 'laser', point: b };
  if (guardContact(a, b, level.guards || [], clock))
    return { msg: 'A guard caught your sneaky arm!', kind: 'guard', point: b };
  if (level.camera && cameraContact(a, b, level, cameraAngle))
    return { msg: 'The camera spotted your arm!', kind: 'camera', point: b };
  return null;
}

function guardContact(a, b, guards, clock) {
  return guards.some(
    (g) => squaredSegDist(guardPos(g, clock), a, b) < ((g.vision ? 31 : g.r) + ARM_R) ** 2,
  );
}

function cameraContact(a, b, level, angle) {
  const camera = level.camera;
  return segmentInView(a, b, camera, camera.r + ARM_R, (p) => inCamera(p, camera, angle, level.walls));
}

export { cameraContact, guardContact, segmentBlocked };
