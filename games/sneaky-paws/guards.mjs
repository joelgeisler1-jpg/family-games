import { playSound } from './audio.mjs';
import { setMood } from './characters.mjs';
import { H, W } from './constants.mjs';
import { actors, piece } from './dom.mjs';
import { dist, lineOfSight } from './geometry.mjs';
import { LEVELS } from './levels.mjs';
import { state } from './state.mjs';
import { say } from './ui.mjs';

function drawGuards(L) {
  // Animated guard characters are drawn in a separate layer so patrols can move.
  for (let [i, g] of (L.guards || []).entries()) {
    const asleep = g.kind === 'sleep' || (state.level === 2 && !g.kind),
      walking = Boolean(g.patrol);
    const unit =
      piece(`<g class="guard-unit ${asleep ? 'sleeping' : ''} ${walking ? 'walking' : ''}" data-guard="${i}">
   ${asleep ? `<circle r="${g.r}" fill="#ff6f81" opacity=".115"/><circle r="${g.r}" fill="none" stroke="#eb7380" stroke-width="4" stroke-dasharray="9 8"/>` : `<path class="watch-cone" d=""/><circle r="35" fill="#ff877c" opacity=".10"/>`}
   <g class="guard-body">
    <ellipse cy="35" rx="38" ry="10" fill="#463b61" opacity=".18"/>
    <g class="guard-boot left"><path d="M-16 19v18m-1 -2h-13" fill="none" stroke="#303c60" stroke-width="9" stroke-linecap="round"/></g>
    <g class="guard-boot right"><path d="M15 19v18m-1 -2h14" fill="none" stroke="#303c60" stroke-width="9" stroke-linecap="round"/></g>
    <path d="M-26 25Q-31 2 -20 -9L20 -9Q32 3 26 25Z" fill="${walking ? '#417fa0' : '#566d96'}" stroke="#27344d" stroke-width="4"/>
    <path d="M-23 5L-35 19M23 5L34 19" stroke="#27344d" stroke-width="9" stroke-linecap="round"/>
    <rect x="-28" y="22" width="56" height="7" rx="3" fill="#303d59"/>
    <g class="guard-head"><rect x="-17" y="-15" width="34" height="27" rx="11" fill="#f5c5a2" stroke="#383e54" stroke-width="2.5"/>
    <path d="M-27 -22Q-30 -41 0 -41Q30 -41 27 -22L32 -18Q0 -12 -32 -18Z" fill="#38476d" stroke="#26334e" stroke-width="3"/>
    <rect x="-11" y="-37" width="22" height="12" rx="5" fill="#f8d77e"/><path d="M-8 -31h16" stroke="#ab8d3e" stroke-width="2"/>
    ${asleep ? `<path d="M-13 -3q6 -5 11 0M5 -3q5 -5 10 0" stroke="#563f53" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<g class="guard-eyes"><circle cx="-8" cy="-3" r="3" fill="#30314c"/><circle cx="9" cy="-3" r="3" fill="#30314c"/></g><g class="guard-blink"><path d="M-13 -3h10M5 -3h10" stroke="#5b3d47" stroke-width="3.5" stroke-linecap="round"/></g>`}
    <path d="M-2 7h6" stroke="#95635b" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="-11" y="11" width="11" height="8" rx="2" fill="#eacb72"/>
    <circle cx="22" cy="4" r="5" fill="#eddaa1"/></g>
   </g>
   ${asleep ? `<g class="guard-z" fill="#8066c3" font-family="system-ui" font-weight="900"><text x="32" y="-53" font-size="18">Z</text><text x="49" y="-69" font-size="26">z</text></g>` : ''}
   ${walking ? `<g class="watch-turn"><path d="M25 -12q15 -13 27 1" fill="none" stroke="#e5b66d" stroke-width="5"/><circle cx="53" cy="-13" r="7" fill="#fff4b6"/></g>` : ''}
   <g class="guard-thought"><rect x="14" y="${-g.r - 54}" width="71" height="33" rx="14" fill="#fffef9" stroke="#d8b3a0" stroke-width="3"/><path d="M25 ${-g.r - 21}l-3 11 14 -11" fill="#fffef9" stroke="#d8b3a0" stroke-width="2"/><text class="thought-text" x="49" y="${-g.r - 32}" text-anchor="middle" font-size="16" font-weight="900" fill="#b97437">?</text></g>
   <g class="guard-meter"><rect x="-35" y="${g.r + 39}" width="70" height="9" rx="5" fill="#fff" stroke="#be8b8d" stroke-width="2"/><rect class="meter-fill" x="-32" y="${g.r + 42}" width="0" height="3" rx="2" fill="#f47e57"/></g>
   <g class="alert-sign" opacity="0"><circle cx="43" cy="-51" r="20" fill="#ffebc5" stroke="#fa9767" stroke-width="4"/><text x="43" y="-42" text-anchor="middle" fill="#dd5a55" font-size="29" font-weight="900">!</text></g>
   <rect x="-42" y="${g.r + 12}" rx="8" width="84" height="21" fill="#fff" opacity=".94" stroke="#e5c5ce"/>
   <text y="${g.r + 27}" text-anchor="middle" font-size="11" font-weight="900" fill="#ab5b6a">${asleep ? 'SLEEPING' : walking ? 'PATROLLING' : 'ON DUTY'}</text>
  </g>`);
    // Patrol positioning is applied only to the inner guard group.
    actors.append(unit);
  }
}
function guardPos(g, t) {
  let p = g.patrol;
  if (!p) return { x: g.x, y: g.y };
  return {
    x: g.x + Math.sin(t * p.speed + (p.phase || 0)) * p.dx,
    y: g.y + (Math.cos(t * p.speed + (p.phase || 0)) - 1) * (p.dy || 0),
  };
}
function guardFacing(g, t) {
  const v = g.vision || {},
    s = g.patrol;
  if (s) {
    const forward = Math.cos(t * s.speed + (s.phase || 0)) > 0;
    return (forward ? 0 : Math.PI) + 0.12 * Math.sin(t * 0.002);
  }
  return (v.look ?? Math.PI) + Math.sin(t * 0.0009) * (0.35 + (v.sweep || 0));
}
function guardSeesPoint(g, p, t, walls, distractedUntil) {
  if (!g.vision || t < distractedUntil) return false;
  const loc = guardPos(g, t),
    d = dist(loc, p);
  if (d > g.vision.range || d < 1) return false;
  const facing = guardFacing(g, t),
    a = Math.atan2(p.y - loc.y, p.x - loc.x),
    delta = Math.atan2(Math.sin(a - facing), Math.cos(a - facing));
  return Math.abs(delta) < g.vision.half && lineOfSight(loc, p, walls);
}
function updatePatrols(t) {
  let L = LEVELS[state.level];
  for (let [i, g] of (L.guards || []).entries()) {
    let p = guardPos(g, t),
      node = actors.querySelector(`[data-guard="${i}"]`);
    if (!node) continue;
    node.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    if (g.patrol) node.setAttribute('data-heading', Math.cos(t * g.patrol.speed) > 0 ? 'right' : 'left');
    if (g.vision) {
      const cone = node.querySelector('.watch-cone'),
        dir = guardFacing(g, t),
        fov = g.vision.half,
        r = g.vision.range;
      let d = 'M0 0';
      for (let j = 0; j <= 18; j++) {
        let a = dir - fov + (2 * fov * j) / 18;
        let end = r;
        for (let k = 8; k <= r; k += 8) {
          let x = p.x + k * Math.cos(a),
            y = p.y + k * Math.sin(a);
          if (
            x < 20 ||
            x > W - 20 ||
            y < 20 ||
            y > H - 20 ||
            L.walls.some((w) => x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h)
          ) {
            end = k - 8;
            break;
          }
        }
        d += `L${(end * Math.cos(a)).toFixed(1)} ${(end * Math.sin(a)).toFixed(1)}`;
      }
      cone.setAttribute('d', d + 'Z');
      const distracted = t < state.distractedUntil;
      node.classList.toggle('distracted', distracted);
      if (distracted) node.querySelector('.thought-text').textContent = '♫ ?';
    }
  }
}
function updateAwareness(t, dt, fail) {
  if (state.mode !== 'drawing') return;
  for (let [i, g] of (LEVELS[state.level].guards || []).entries()) {
    if (!g.vision) continue;
    const st = state.guardStates[i],
      node = actors.querySelector(`[data-guard="${i}"]`);
    let visible = false;
    const stride = Math.max(2, Math.ceil(state.points.length / 240));
    for (let j = state.points.length - 1; j >= 0; j -= stride) {
      if (guardSeesPoint(g, state.points[j], t, LEVELS[state.level].walls, state.distractedUntil)) {
        visible = true;
        break;
      }
    }
    st.alert = Math.max(0, Math.min(1.08, st.alert + (visible ? dt / 820 : -dt / 640)));
    node?.classList.toggle('suspicious', st.alert > 0.12 && t >= state.distractedUntil);
    const meter = node?.querySelector('.meter-fill');
    if (meter) meter.setAttribute('width', String(Math.round(64 * Math.min(1, st.alert))));
    const thought = node?.querySelector('.thought-text');
    if (thought && t >= state.distractedUntil) thought.textContent = st.alert > 0.62 ? 'WHO?!' : '?';
    if (visible && st.alert > 0.13 && !st.noticed) {
      setMood('alert', 1900);
      st.noticed = true;
      playSound('notice');
      say('A guard noticed something! Slip out of the spotlight.', true, 2300);
    }
    if (st.alert < 0.08) st.noticed = false;
    if (st.alert >= 1) {
      fail('A watchful guard sounded the alarm!', 'guard', guardPos(g, t));
      return;
    }
  }
}

export { drawGuards, guardPos, updateAwareness, updatePatrols };
