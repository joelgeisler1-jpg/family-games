import { cameraContact } from './collision.mjs';
import { findArmSegment, squaredSegDist } from './geometry.mjs';
import { guardPos, updateAwareness } from './guards.mjs';
import { cameraAngleAt, checkScanners } from './hazards.mjs';
import { LEVELS } from './levels.mjs';
import { ARM_R } from './constants.mjs';
import { state } from './state.mjs';

// A patrol moves at most about two board pixels per tick. Keep this clock
// independent of paint and pointer event cadence, including dropped frames.
const STEP = 16;

function advanceSecurity(t, fail) {
  if (!Number.isFinite(t) || t < 0 || t < state.clock) return;
  state.clock = t;
  if (state.mode !== 'drawing') {
    state.nextSecurityTick = t + STEP;
    return;
  }
  const level = LEVELS[state.level];
  const patrols = level.guards?.filter((g) => g.patrol) ?? [];
  if (!level.pulse && !level.radar && !level.camera && !level.guards?.some((g) => g.vision)) return;

  while (state.nextSecurityTick <= t && state.mode === 'drawing') {
    const tick = state.nextSecurityTick;
    state.nextSecurityTick += STEP;
    checkScanners(tick, STEP, fail);
    if (state.mode !== 'drawing') break;
    if (patrols.length) {
      const bodies = patrols.map((guard) => ({
        center: guardPos(guard, tick),
        radiusSquared: ((guard.vision ? 31 : guard.r) + ARM_R) ** 2,
      }));
      const hit = findArmSegment(state.points, (a, b) =>
        bodies.some(({ center, radiusSquared }) => squaredSegDist(center, a, b) < radiusSquared),
      );
      if (hit) {
        fail('You touched a guard!', 'guard', hit);
        break;
      }
    }
    updateAwareness(tick, STEP, fail);
    if (state.mode !== 'drawing') break;
    if (level.camera) {
      const angle = cameraAngleAt(level.camera, tick);
      const hit = findArmSegment(state.points, (a, b) => cameraContact(a, b, level, angle));
      if (hit) fail('The moving spotlight found you!', 'camera', hit);
    }
  }
}

export { advanceSecurity };
