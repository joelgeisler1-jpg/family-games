import assert from 'node:assert/strict';
import { test } from 'node:test';

// Collision and interaction modules share browser renderers. Supply only the SVG
// operations used during these tests; pointer delivery is checked in a browser.
const element = {
  classList: { add() {}, remove() {}, toggle() {} },
  style: {},
  dataset: {},
  append() {},
  setAttribute() {},
  querySelector() {
    return null;
  },
  closest() {
    return this;
  },
  getBoundingClientRect() {},
  remove() {},
};
globalThis.document = {
  getElementById: () => element,
  createElementNS: () => element,
};

const { sampleOnDrag } = await import('../arm-physics.mjs');
const { segmentBlocked, hitGuardsOnly } = await import('../collision.mjs');
const { updateScanners } = await import('../hazards.mjs');
const { updateAwareness } = await import('../guards.mjs');
const { LEVELS } = await import('../levels.mjs');
const { state } = await import('../state.mjs');
const { pendingTasks } = await import('../mission-status.mjs');

const point = (x, y) => ({ x, y });
function startDrawing(level, start, clock = 1000) {
  Object.assign(state, {
    level,
    clock,
    cameraAngle: 0,
    mode: 'drawing',
    points: [start],
    lastInput: start,
    wheelContact: null,
    edgeSide: '',
    switchOn: false,
    keyTaken: false,
    spoolStates: (LEVELS[level].spools || []).map(() => ({ arc: 0, last: null, done: false })),
    slideState: { progress: 0, gripped: false, done: false, tick: 0 },
    decoyTriggered: false,
    distractedUntil: 0,
    guardStates: (LEVELS[level].guards || []).map(() => ({ alert: 0, noticed: false })),
    scannerAlert: 0,
    scannerWarned: false,
  });
}
function drag(to, win = () => assert.fail('Unexpected treasure grab')) {
  sampleOnDrag(to, assert.fail, win);
}

test('a large input step checks the swept arm against expanded solids', () => {
  const level = { walls: [{ x: 100, y: 100, w: 20, h: 20 }] };
  const hit = segmentBlocked(point(60, 90), point(160, 90), level, 0, false, 0);
  assert.equal(hit.kind, 'wall');
  assert.deepEqual(hit.point, point(90, 90));
  assert.equal(segmentBlocked(point(60, 85), point(160, 85), level, 0, false, 0), null);
});

test('a switch disables its laser gate and a beam only collides while firing', () => {
  const gate = LEVELS[7];
  assert.equal(segmentBlocked(point(530, 430), point(568, 430), gate, 0, false, 0).kind, 'laser');
  assert.equal(segmentBlocked(point(530, 430), point(568, 430), gate, 0, true, 0), null);

  const beam = LEVELS[1];
  assert.equal(segmentBlocked(point(355, 342), point(400, 342), beam, 109, false, 0).kind, 'laser');
  assert.equal(segmentBlocked(point(355, 342), point(400, 342), beam, 110, false, 0), null);
  startDrawing(1, point(400, 342), 109);
  let alarm;
  updateScanners(109, 16, (...args) => {
    alarm = args;
  });
  assert.equal(alarm[1], 'laser');
  assert.deepEqual(alarm[2], point(400, 342));
});

test('walls occlude the sweeping camera and patrol contact follows the guard', () => {
  const camera = { x: 50, y: 100, r: 150, half: 0.2 };
  const a = point(145, 100);
  const b = point(150, 100);
  assert.equal(segmentBlocked(a, b, { walls: [], camera }, 0, false, 0).kind, 'camera');
  const walls = [{ x: 90, y: 90, w: 20, h: 20 }];
  assert.equal(segmentBlocked(a, b, { walls, camera }, 0, false, 0), null);

  const guards = LEVELS[6].guards;
  const patrolEnd = point(603, 265);
  assert.equal(hitGuardsOnly(patrolEnd, guards, 0), null);
  assert.equal(hitGuardsOnly(patrolEnd, guards, Math.PI / (2 * guards[0].patrol.speed)).kind, 'guard');
});

test('guard awareness accumulates, and the bell resets it and grants a timed distraction', () => {
  const guard = LEVELS[6].guards[0];
  startDrawing(6, point(guard.x + 80, guard.y), 0);
  updateAwareness(0, 120, assert.fail);
  assert.ok(state.guardStates[0].alert > 0);
  const { x, y, duration } = LEVELS[6].decoy;
  state.points = [point(x - 30, y)];
  state.lastInput = state.points[0];
  drag(point(x, y));
  assert.equal(state.decoyTriggered, true);
  assert.equal(state.guardStates[0].alert, 0);
  assert.equal(state.distractedUntil, duration);

  state.points = [point(guard.x + 80, guard.y)];
  updateAwareness(0, 120, assert.fail);
  assert.equal(state.guardStates[0].alert, 0);
});

test('the edge clamps the hand and a reel sticks outside its solid hub', () => {
  startDrawing(0, point(119, 425));
  drag(point(-100, 425));
  assert.deepEqual(state.points.at(-1), point(25, 425));
  assert.equal(state.mode, 'drawing');

  const spool = LEVELS[5].spools[0];
  const onReel = (angle) => point(spool.x + Math.cos(angle) * 43, spool.y + Math.sin(angle) * 43);
  startDrawing(5, onReel(Math.PI));
  drag(point(spool.x, spool.y));
  assert.ok(Math.hypot(state.points.at(-1).x - spool.x, state.points.at(-1).y - spool.y) >= 42.999);
  assert.equal(state.spoolStates[0].done, false);
  for (let step = 1; step <= 17; step++) drag(onReel(Math.PI + step * 0.24));
  assert.equal(state.spoolStates[0].done, true);
  assert.deepEqual(pendingTasks(), []);
});

test('treasure stays locked until the slide bolt is dragged to completion', () => {
  const { slider, goal } = LEVELS[2];
  startDrawing(2, point(goal.x - 30, goal.y));
  drag(goal);
  assert.deepEqual(pendingTasks(), ['slide bolt']);

  startDrawing(2, point(slider.x - 35, slider.y));
  drag(point(slider.x, slider.y));
  drag(point(slider.to - 10, slider.y));
  assert.equal(state.slideState.done, false);
  drag(point(slider.to, slider.y));
  assert.equal(state.slideState.done, true);
  let won = false;
  drag(goal, () => {
    won = true;
  });
  assert.equal(won, true);
});
