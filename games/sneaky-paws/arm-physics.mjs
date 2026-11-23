import { cameraAngleAt } from './hazards.mjs';
import { playSound } from './audio.mjs';
import { segmentBlocked } from './collision.mjs';
import { ARM_R, EDGE, H, REEL_RIM, START, W } from './constants.mjs';
import { arm, armOutline, armShadow, handGroup, highlight, staticLayer } from './dom.mjs';
import { clamp, dist } from './geometry.mjs';
import { LEVELS } from './levels.mjs';
import { taskMessage } from './mission-status.mjs';
import { checkSlide, checkTargets, guideToSlide, ringDecoy } from './objectives.mjs';
import { updateSpoolArt, updateTargets } from './scene.mjs';
import { state } from './state.mjs';
import { burst, edgeBump, say, status } from './ui.mjs';

let lastGripSound = 0,
  lastWindSound = 0;
function guideToWheel(raw) {
  const reels = LEVELS[state.level].spools || [];
  let chosen = -1,
    best = Infinity;
  for (let [i, sp] of reels.entries()) {
    const d = dist(raw, sp),
      outer = sp.r + ARM_R + 57;
    if (d < outer && d < best) {
      chosen = i;
      best = d;
    }
  }
  const contact = state.wheelContact;
  if (chosen < 0 && contact) chosen = contact.index;
  if (chosen < 0) return raw;

  const sp = reels[chosen];
  const orbit = sp.r + REEL_RIM + ARM_R + 0.5;
  const r = dist(raw, sp);
  const attached = contact?.index === chosen;
  const targetAngle = r < 12 && attached ? contact.angle : Math.atan2(raw.y - sp.y, raw.x - sp.x);
  const turn = attached
    ? Math.atan2(Math.sin(targetAngle - contact.angle), Math.cos(targetAngle - contact.angle))
    : 0;
  const angle = attached ? contact.angle + clamp(turn, -0.18, 0.18) : targetAngle;
  const blend = clamp((sp.r + ARM_R + 57 - r) / 24, 0, 1);
  const eased = blend * blend * (3 - 2 * blend);
  const targetRadius = r * (1 - eased) + orbit * eased;
  const radius = attached ? contact.radius + clamp(targetRadius - contact.radius, -8, 8) : targetRadius;

  if (blend === 0 && Math.abs(turn) <= 0.18 && Math.abs(radius - r) < 0.01) {
    clearWheelGrip(contact);
    state.wheelContact = null;
    return raw;
  }
  if (!attached) {
    clearWheelGrip(contact);
    staticLayer.querySelector(`[data-spool="${chosen}"]`)?.classList.add('gripping');
    if (performance.now() - lastGripSound > 250) {
      playSound('grip');
      lastGripSound = performance.now();
    }
    status('🧲 Snapped to the reel! Trace its outside edge to wind the arm.');
  }
  // Hold the grip until the hand catches up with the finger on exit.
  // The bounded angular step also keeps the chords between samples off the hub.
  state.wheelContact = { index: chosen, angle, radius };
  return { x: sp.x + Math.cos(angle) * radius, y: sp.y + Math.sin(angle) * radius };
}
function clearWheelGrip(contact) {
  if (contact)
    staticLayer.querySelector(`[data-spool="${contact.index}"]`)?.classList.remove('gripping');
}

function checkSpools(p) {
  let L = LEVELS[state.level];
  if (!L.spools) return;
  for (let [i, sp] of L.spools.entries()) {
    let st = state.spoolStates[i];
    if (st.done) continue;
    const radius = dist(p, sp),
      angle = Math.atan2(p.y - sp.y, p.x - sp.x);
    const inside = radius >= sp.r + ARM_R + 1 && radius < sp.r + ARM_R + 35;
    if (!inside) {
      st.last = null;
      continue;
    }
    if (st.last !== null) {
      let diff = Math.atan2(Math.sin(angle - st.last), Math.cos(angle - st.last));
      if (Math.abs(diff) < 0.52) {
        const old = Math.abs(st.arc);
        st.arc += diff;
        if (
          Math.floor(old / 0.55) < Math.floor(Math.abs(st.arc) / 0.55) &&
          performance.now() - lastWindSound > 125
        ) {
          playSound('wind');
          lastWindSound = performance.now();
        }
      }
    }
    st.last = angle;
    if (Math.abs(st.arc) >= sp.turn) {
      st.done = true;
      updateSpoolArt(i);
      updateTargets();
      playSound('reel');
      burst(sp.x, sp.y, '#53c99f');
      status(`🌀 Reel ${i + 1} unlocked! ${taskMessage()}`);
      say(`Reel ${i + 1} unlocked! ${taskMessage()}`, true, 2450);
    }
  }
}
// The round SVG stroke follows the same dense segments tested by collision.
let renderedPoints;
let renderedCount = 0;
let path = '';
function redraw() {
  if (renderedPoints !== state.points) {
    renderedPoints = state.points;
    renderedCount = 0;
    path = '';
  }
  if (renderedCount === state.points.length) return;
  for (let i = renderedCount; i < state.points.length; i++) {
    const { x, y } = state.points[i];
    path += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  renderedCount = state.points.length;
  for (const e of [armShadow, armOutline, arm, highlight]) e.setAttribute('d', path);
  const end = state.points.at(-1) || START,
    prev = state.points[Math.max(0, state.points.length - 6)] || START;
  const degrees =
    state.points.length > 2 ? (Math.atan2(end.y - prev.y, end.x - prev.x) * 180) / Math.PI : 0;
  handGroup.setAttribute(
    'transform',
    `translate(${end.x.toFixed(1)} ${end.y.toFixed(1)}) rotate(${degrees.toFixed(1)})`,
  );
  for (let [i, sp] of (LEVELS[state.level].spools || []).entries()) {
    const meter = staticLayer.querySelector(`[data-spool="${i}"] .spool-progress`);
    if (!meter) continue;
    let circum = 2 * Math.PI * (sp.r + 47),
      fraction = Math.min(1, Math.abs(state.spoolStates[i].arc) / sp.turn);
    meter.setAttribute('stroke-dasharray', `${(circum * fraction).toFixed(2)} ${circum.toFixed(2)}`);
  }
}
function clampToRoom(p) {
  const x = Math.max(EDGE, Math.min(W - EDGE, p.x)),
    y = Math.max(EDGE, Math.min(H - EDGE, p.y));
  const side =
    (p.x < EDGE ? 'L' : p.x > W - EDGE ? 'R' : '') + (p.y < EDGE ? 'T' : p.y > H - EDGE ? 'B' : '');
  if (side) edgeBump({ x, y }, side);
  else if (state.edgeSide) {
    state.edgeSide = '';
  }
  return { x, y };
}
function sampleOnDrag(raw, fail, win, draw = true) {
  const aim = clampToRoom(raw),
    from = state.lastInput;
  const steps = Math.max(1, Math.ceil(dist(from, aim) / 4));
  const level = LEVELS[state.level];
  const cameraAngle = level.camera ? cameraAngleAt(level.camera, state.clock) : 0;
  for (let i = 1; i <= steps; i++) {
    if (state.mode !== 'drawing') break;
    const input = {
      x: from.x + ((aim.x - from.x) * i) / steps,
      y: from.y + ((aim.y - from.y) * i) / steps,
    };
    const prev = state.points.at(-1),
      next = guideToSlide(guideToWheel(input));
    if (dist(prev, next) < 0.8) continue;
    let problem = segmentBlocked(prev, next, level, state.clock, state.switchOn, cameraAngle);
    if (problem) {
      fail(problem.msg, problem.kind, problem.point);
      break;
    }
    state.points.push(next);
    checkSpools(next);
    checkSlide(next);
    ringDecoy(next);
    if (checkTargets(next)) {
      redraw();
      win();
      break;
    }
  }
  state.lastInput = { ...aim };
  if (draw) redraw();
}

export { redraw, sampleOnDrag };
