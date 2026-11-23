import { playSound } from './audio.mjs';
import { segmentBlocked } from './collision.mjs';
import { ARM_R, EDGE, H, START, W } from './constants.mjs';
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
  if (chosen < 0) {
    if (state.wheelContact !== null)
      staticLayer
        .querySelector(`[data-spool="${state.wheelContact.index}"]`)
        ?.classList.remove('gripping');
    state.wheelContact = null;
    return raw;
  }
  const sp = reels[chosen],
    orbit = sp.r + ARM_R + 4;
  const r = Math.hypot(raw.x - sp.x, raw.y - sp.y);
  let angle =
    r < 9 && state.wheelContact?.index === chosen
      ? state.wheelContact.angle
      : Math.atan2(raw.y - sp.y, raw.x - sp.x);
  if (state.wheelContact?.index === chosen) {
    // If a finger crosses the hub, don't let the drawn arm magically jump through it.
    const turn = Math.atan2(
      Math.sin(angle - state.wheelContact.angle),
      Math.cos(angle - state.wheelContact.angle),
    );
    angle = state.wheelContact.angle + clamp(turn, -0.34, 0.34);
  } else {
    if (state.wheelContact !== null)
      staticLayer
        .querySelector(`[data-spool="${state.wheelContact.index}"]`)
        ?.classList.remove('gripping');
    staticLayer.querySelector(`[data-spool="${chosen}"]`)?.classList.add('gripping');
    if (performance.now() - lastGripSound > 250) {
      playSound('grip');
      lastGripSound = performance.now();
    }
    status('🧲 Snapped to the reel! Trace its outside edge to wind the arm.');
  }
  state.wheelContact = { index: chosen, angle };
  // A narrow magnetic run-in lets the hand approach smoothly, then stick exactly
  // to the outside edge until the finger pulls away from the reel.
  const blend = clamp((orbit + 53 - r) / 24, 0, 1),
    radius = r * (1 - blend) + orbit * blend;
  return { x: sp.x + Math.cos(angle) * radius, y: sp.y + Math.sin(angle) * radius };
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
function smoothPath(coords) {
  if (!coords.length) return '';
  let d = `M${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  // Catmull–Rom with conservative handles: a smooth, flexible arm without shortcutting sharp corners.
  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[Math.max(0, i - 1)],
      b = coords[i],
      c = coords[i + 1],
      e = coords[Math.min(coords.length - 1, i + 2)];
    const t = 0.12;
    const x1 = b.x + (c.x - a.x) * t,
      y1 = b.y + (c.y - a.y) * t;
    const x2 = c.x - (e.x - b.x) * t,
      y2 = c.y - (e.y - b.y) * t;
    d += `C${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }
  return d;
}
function redraw() {
  const shown = [state.points[0]];
  for (let i = 1; i < state.points.length - 1; i++)
    if (dist(state.points[i], shown[shown.length - 1]) > 11) shown.push(state.points[i]);
  if (state.points.length > 1) shown.push(state.points[state.points.length - 1]);
  const d = smoothPath(shown);
  for (const e of [armShadow, armOutline, arm, highlight]) e.setAttribute('d', d);
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
function sampleOnDrag(raw, fail, win) {
  const aim = clampToRoom(raw),
    from = state.lastInput;
  const steps = Math.max(1, Math.ceil(dist(from, aim) / 4));
  for (let i = 1; i <= steps; i++) {
    if (state.mode !== 'drawing') break;
    const input = {
      x: from.x + ((aim.x - from.x) * i) / steps,
      y: from.y + ((aim.y - from.y) * i) / steps,
    };
    const prev = state.points.at(-1),
      next = guideToSlide(guideToWheel(input));
    if (dist(prev, next) < 0.8) continue;
    let problem = segmentBlocked(
      prev,
      next,
      LEVELS[state.level],
      state.clock,
      state.switchOn,
      state.cameraAngle,
    );
    if (problem) {
      fail(problem.msg, problem.kind, problem.point);
      redraw();
      break;
    }
    state.points.push(next);
    checkSpools(next);
    checkSlide(next);
    ringDecoy(next);
    if (state.points.length > 3800) {
      state.points = state.points.filter(
        (_, j) => j === 0 || j === state.points.length - 1 || j % 2 === 0,
      );
    }
    if (checkTargets(next)) {
      redraw();
      win();
      break;
    }
  }
  state.lastInput = { ...aim };
  redraw();
}

export { redraw, sampleOnDrag };
