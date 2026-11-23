import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routes } from './routes.mjs';
import { START, W, H, SAVE } from '../constants.mjs';
import { LEVELS } from '../levels.mjs';
import { state } from '../state.mjs';

class Element {
  children = [];
  dataset = {};
  style = {};
  classList = { add() {}, remove() {}, toggle() {} };
  listeners = new Map();
  attributes = new Map();
  set innerHTML(value) {
    this.children.length = 0;
  }
  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }
  append(child) {
    this.children.push(child);
  }
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  insertAdjacentHTML() {}
  setPointerCapture() {}
  querySelector() {
    return null;
  }
  closest() {
    return this;
  }
  remove() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, width: W, height: H };
  }
}

const elements = new Map();
const get = (id) => {
  if (!elements.has(id)) elements.set(id, new Element());
  return elements.get(id);
};
const frames = new Map();
const saved = new Map();
let frameId = 0;
let now = 0;
globalThis.document = {
  getElementById: get,
  createElement: () => new Element(),
  createElementNS: () => new Element(),
};
globalThis.window = new Element();
globalThis.localStorage = {
  getItem: (key) => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, value),
};
globalThis.requestAnimationFrame = (callback) => {
  frames.set(++frameId, callback);
  return frameId;
};
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
globalThis.performance = { now: () => now };

await import('../game.mjs');
get('soundToggle').onclick();

function frame(t) {
  now = t;
  for (const id of [...frames.keys()]) {
    const callback = frames.get(id);
    frames.delete(id);
    callback?.(t);
  }
}

function pointer(type, [x, y], t) {
  now = t;
  get('scene').listeners.get(type)({
    pointerId: 1,
    clientX: x,
    clientY: y,
    timeStamp: t,
    preventDefault() {},
  });
}

for (const profile of [
  { name: 'frequent pointer events and frames', spacing: 16, paintEveryMove: true },
  { name: 'sparse pointer events and delayed frames', spacing: 64, paintEveryMove: false },
]) {
  test(`all ten missions complete with ${profile.name}`, () => {
    assert.equal(routes.length, LEVELS.length);
    state.unlocked = 1;
    saved.clear();
    get('levels').children[0].onclick();
    let chapter = now + 1;
    for (const [index, route] of routes.entries()) {
      const level = LEVELS[index];
      // Repeat the relevant security phase while keeping the test clock monotonic.
      const period = level.pulse?.period ?? (level.camera ? (2 * Math.PI) / level.camera.speed : 1);
      const time = Math.ceil(chapter / period) * period + route.start;
      frame(time);
      let t = time;
      let prev = [START.x, START.y];
      pointer('pointerdown', prev, t);
      for (const waypoint of route.path) {
        const length = Math.hypot(waypoint[0] - prev[0], waypoint[1] - prev[1]);
        const steps = Math.max(1, Math.ceil(length / profile.spacing));
        const duration = Math.max(22, length * 0.7);
        for (let i = 1; i <= steps; i++) {
          const next = prev.map((from, dim) => from + ((waypoint[dim] - from) * i) / steps);
          t += duration / steps;
          if (profile.paintEveryMove) frame(t);
          pointer('pointermove', next, t);
          assert.notEqual(
            state.mode,
            'failed',
            `${level.name} at ${next.map(Math.round)}, t=${t}: ${get('noticeText').textContent}`,
          );
        }
        prev = waypoint;
      }
      assert.equal(state.mode, 'win', `${level.name}: ${get('noticeText').textContent}`);
      const path = state.points
        .map(({ x, y }, i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`)
        .join('');
      assert.equal(get('armOutline').attributes.get('d'), path);
      assert.equal(state.keyTaken, Boolean(level.key));
      assert.equal(state.switchOn, Boolean(level.switch));
      assert.equal(state.slideState.done, Boolean(level.slider));
      assert.equal(state.decoyTriggered, Boolean(level.decoy));
      assert.ok(state.spoolStates.every((spool) => spool.done));
      pointer('pointerup', prev, t);
      frame(t + 1200);
      assert.equal(saved.get(SAVE), String(Math.min(index + 2, LEVELS.length)));
      get('next').onclick();
      chapter = t + 1300;
    }
    assert.equal(state.level, 0);
  });
}
