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
const { segmentBlocked, guardContact } = await import('../collision.mjs');
const { checkScanners } = await import('../hazards.mjs');
const { updateAwareness } = await import('../guards.mjs');
const { LEVELS } = await import('../levels.mjs');
const { state } = await import('../state.mjs');
const { advanceSecurity } = await import('../security.mjs');
const { segDist } = await import('../geometry.mjs');
const { ARM_R, REEL_RIM } = await import('../constants.mjs');
const { pendingTasks } = await import('../mission-status.mjs');

const point = (x, y) => ({ x, y });
function startDrawing(level, start, clock = 1000) {
  Object.assign(state, {
    level,
    clock,
    nextSecurityTick: clock + 16,
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
  const level = { walls: [{ x: 100, y: 100, w: 40, h: 40 }] };
  const hit = segmentBlocked(point(60, 90), point(160, 90), level, 0, false, 0);
  assert.equal(hit.kind, 'wall');
  assert.ok(hit.point.x > 80 && hit.point.x <= 160);
  assert.equal(segmentBlocked(point(60, 82), point(160, 82), level, 0, false, 0), null);
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
  checkScanners(109, 16, (...args) => {
    alarm = args;
  });
  assert.equal(alarm[1], 'laser');
  assert.deepEqual(alarm[2], point(400, 342));
});

test('walls occlude the sweeping camera and patrol contact follows the guard', () => {
  const camera = { x: 50, y: 100, r: 150, half: 0.2 };
  const a = point(155, 100);
  const b = point(160, 100);
  assert.equal(segmentBlocked(a, b, { walls: [], camera }, 0, false, 0).kind, 'camera');
  const walls = [{ x: 90, y: 90, w: 40, h: 40 }];
  assert.equal(segmentBlocked(a, b, { walls, camera }, 0, false, 0), null);

  const guards = LEVELS[6].guards;
  const patrolEnd = point(603, 265);
  assert.equal(guardContact(patrolEnd, patrolEnd, guards, 0), false);
  assert.equal(guardContact(patrolEnd, patrolEnd, guards, Math.PI / (2 * guards[0].patrol.speed)), true);
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
  const onReel = (angle) => point(spool.x + Math.cos(angle) * 47.5, spool.y + Math.sin(angle) * 47.5);
  startDrawing(5, onReel(Math.PI));
  drag(point(spool.x, spool.y));
  assert.ok(Math.hypot(state.points.at(-1).x - spool.x, state.points.at(-1).y - spool.y) >= 47.499);
  assert.equal(state.spoolStates[0].done, false);
  for (let step = 1; step <= 17; step++) drag(onReel(Math.PI + step * 0.24));
  for (let i = 1; i < state.points.length; i++) {
    assert.ok(segDist(spool, state.points[i - 1], state.points[i]) >= spool.r + REEL_RIM + ARM_R);
  }
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

test('a dropped frame cannot skip an entire laser pulse or patrol crossing', () => {
  const checkDuringStall = (level, time, end, points, expected) => {
    startDrawing(level, points[0], time);
    state.points = points;
    let issue;
    advanceSecurity(end, (message, kind) => {
      issue = { message, kind };
      state.mode = 'failed';
    });
    assert.equal(issue?.kind, expected);
  };
  // The ends of this segment are outside the beam; only the middle crosses it.
  checkDuringStall(1, 200, 3200, [point(348, 318), point(350, 366)], 'laser');
  checkDuringStall(6, 0, 3000, [point(600, 213), point(600, 317)], 'guard');
});

test('radar exposure agrees across normal frames and a single delayed update', () => {
  const scan = (frames) => {
    startDrawing(6, point(610, 164), 0);
    state.points.push(point(653, 164));
    for (const t of frames) advanceSecurity(t, assert.fail);
    return state.scannerAlert;
  };
  const steady = scan(Array.from({ length: 16 }, (_, i) => (i + 1) * 16));
  assert.ok(steady > 0);
  assert.equal(scan([256]), steady);
});
