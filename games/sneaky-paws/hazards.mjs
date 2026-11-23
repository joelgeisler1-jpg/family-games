import { playSound } from './audio.mjs';
import { setMood } from './characters.mjs';
import { ARM_R } from './constants.mjs';
import { cameraCone, scannerFX, staticLayer } from './dom.mjs';
import { dist, lineOfSight, segDist } from './geometry.mjs';
import { LEVELS } from './levels.mjs';
import { state } from './state.mjs';
import { say } from './ui.mjs';

function pulseActive(p, t) {
  return (t + p.phase) % p.period < p.on;
}
function radarAngle(r, t) {
  return r.offset + t * r.speed;
}
function radarSeesPoint(r, p, t, walls) {
  const d = dist(r, p);
  if (d > r.r || d < 12) return false;
  const angle = Math.atan2(p.y - r.y, p.x - r.x),
    turn = radarAngle(r, t);
  return (
    Math.abs(Math.atan2(Math.sin(angle - turn), Math.cos(angle - turn))) < r.half &&
    lineOfSight(r, p, walls)
  );
}
function updateScanners(t, dt, fail) {
  const L = LEVELS[state.level];
  if (!L.pulse && !L.radar) {
    scannerFX.innerHTML = '';
    return;
  }
  let markup = '';
  if (L.pulse) {
    const q = L.pulse,
      elapsed = (t + q.phase) % q.period,
      on = elapsed < q.on,
      warning = !on && elapsed > q.period - 580;
    const stroke = on ? '#f44a74' : warning ? '#ffc74d' : '#b7b9d5',
      width = on ? 10 : warning ? 7 : 3;
    markup += `<g class="beam-unit ${on ? 'firing' : warning ? 'charging' : 'inactive'}"><line x1="${q.x1}" y1="${q.y1}" x2="${q.x2}" y2="${q.y2}" stroke="${stroke}" stroke-width="${on ? 28 : 12}" opacity="${on ? 0.2 : 0.12}"/><line x1="${q.x1}" y1="${q.y1}" x2="${q.x2}" y2="${q.y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${on ? '0' : '9 8'}"/><circle cx="${q.x1}" cy="${q.y1}" r="13" fill="#5a5e84" stroke="${stroke}" stroke-width="4"/><circle cx="${q.x2}" cy="${q.y2}" r="13" fill="#5a5e84" stroke="${stroke}" stroke-width="4"/><text x="${(q.x1 + q.x2) / 2}" y="${q.y1 - 19}" text-anchor="middle" font-size="12" font-weight="900" fill="${on ? '#d83c62' : warning ? '#b3811f' : '#777d99'}">${on ? '⚡ FIRING' : warning ? '⚠ CHARGING' : '● RECHARGING'}</text></g>`;
  }
  if (L.radar) {
    const r = L.radar,
      a = radarAngle(r, t),
      end1 = a - r.half,
      end2 = a + r.half;
    const ex1 = r.x + r.r * Math.cos(end1),
      ey1 = r.y + r.r * Math.sin(end1),
      ex2 = r.x + r.r * Math.cos(end2),
      ey2 = r.y + r.r * Math.sin(end2);
    markup += `<g class="radar-unit"><path d="M${r.x} ${r.y}L${ex1.toFixed(1)} ${ey1.toFixed(1)}A${r.r} ${r.r} 0 0 1 ${ex2.toFixed(1)} ${ey2.toFixed(1)}Z" fill="${state.scannerAlert > 0.4 ? '#ff7981' : '#68e4c8'}" opacity=".27" stroke="#48a8ab" stroke-width="2"/><circle cx="${r.x}" cy="${r.y}" r="19" fill="#384f72" stroke="#e0f6f4" stroke-width="4"/><circle cx="${r.x}" cy="${r.y}" r="8" fill="#7ce7ca"/><path d="M${r.x - 29} ${r.y + 23}h58" stroke="#5f7398" stroke-width="7" stroke-linecap="round"/><text x="${r.x}" y="${r.y - 27}" text-anchor="middle" fill="#467d8a" font-size="11" font-weight="900">RADAR</text>${state.scannerAlert > 0.03 ? `<rect x="${r.x - 23}" y="${r.y + 28}" width="${Math.round(46 * state.scannerAlert)}" height="5" rx="2" fill="#f97373"/>` : ''}</g>`;
  }
  scannerFX.innerHTML = markup;
  if (state.mode !== 'drawing') return;
  if (L.pulse && pulseActive(L.pulse, t)) {
    const q = L.pulse,
      a = { x: q.x1, y: q.y1 },
      b = { x: q.x2, y: q.y2 };
    for (let i = 0; i < state.points.length; i += Math.max(1, Math.floor(state.points.length / 230))) {
      if (segDist(state.points[i], a, b) < ARM_R + 6) {
        fail('The security blaster fired! Watch its charge light.', 'laser', state.points[i]);
        return;
      }
    }
  }
  if (L.radar) {
    let seen = false;
    for (let i = 0; i < state.points.length; i += Math.max(1, Math.floor(state.points.length / 180)))
      if (radarSeesPoint(L.radar, state.points[i], t, L.walls)) {
        seen = true;
        break;
      }
    state.scannerAlert = Math.max(
      0,
      Math.min(1.06, state.scannerAlert + (seen ? dt / 1050 : -dt / 680)),
    );
    if (seen && state.scannerAlert > 0.25 && !state.scannerWarned) {
      state.scannerWarned = true;
      setMood('alert', 1700);
      playSound('notice');
      say('Radar sees the arm! Move out of the green sweep!', true, 1700);
    }
    if (state.scannerAlert < 0.05) state.scannerWarned = false;
    if (state.scannerAlert >= 1)
      fail('Radar detected your arm for too long!', 'camera', state.points.at(-1));
  }
}
function updateGates() {
  let L = LEVELS[state.level];
  for (let [i, gate] of (L.lasers || []).entries())
    if (gate.gate) {
      let n = staticLayer.querySelector(`[data-laser="${i}"]`);
      if (!n) continue;
      n.style.opacity = state.switchOn ? '.32' : '1';
      n.querySelectorAll('line').forEach((el) =>
        el.setAttribute('stroke', state.switchOn ? '#48ba8b' : el.getAttribute('stroke')),
      );
      n.querySelectorAll('circle').forEach((el) =>
        el.setAttribute('fill', state.switchOn ? '#80dcc6' : el.getAttribute('fill')),
      );
    }
}
function inCamera(p, c, cameraAngle, walls) {
  if (dist(p, c) > c.r + ARM_R) return false;
  const angle = Math.atan2(p.y - c.y, p.x - c.x);
  if (
    Math.abs(Math.atan2(Math.sin(angle - cameraAngle), Math.cos(angle - cameraAngle))) >=
    c.half + 0.025
  )
    return false;
  return lineOfSight(c, p, walls, 10);
}
function updateCamera(t, checkArm, fail) {
  let c = LEVELS[state.level].camera;
  if (c) {
    state.cameraAngle = c.base + Math.sin(t * c.speed) * c.sweep;
    let r = c.r,
      a = state.cameraAngle - c.half,
      b = state.cameraAngle + c.half;
    let sx = c.x + r * Math.cos(a),
      sy = c.y + r * Math.sin(a),
      ex = c.x + r * Math.cos(b),
      ey = c.y + r * Math.sin(b);
    cameraCone.setAttribute('d', `M${c.x} ${c.y} L${sx} ${sy} A${r} ${r} 0 0 1 ${ex} ${ey} Z`);
    if (checkArm) {
      for (let i = 0; i < state.points.length; i += 2) {
        if (inCamera(state.points[i], c, state.cameraAngle, LEVELS[state.level].walls)) {
          fail('The moving spotlight found you!', 'camera', state.points[i]);
          break;
        }
      }
    }
  }
}

export { inCamera, pulseActive, updateCamera, updateGates, updateScanners };
