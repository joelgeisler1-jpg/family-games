import { setMood } from './characters.mjs';
import { environment, obstacle } from './environments.mjs';
import { ARM_R } from './constants.mjs';
import { actors, cameraCone, piece, roomDecor, scannerFX, staticLayer, targetGroup } from './dom.mjs';
import { drawGuards, updatePatrols } from './guards.mjs';
import { updateGates } from './hazards.mjs';
import { LEVELS } from './levels.mjs';
import { pendingTasks } from './mission-status.mjs';
import { state } from './state.mjs';

let illustratedLevel;
function drawStatic() {
  let L = LEVELS[state.level];
  scannerFX.innerHTML = '';
  staticLayer.innerHTML = '';
  actors.innerHTML = '';
  if (illustratedLevel !== state.level) {
    roomDecor.innerHTML = environment(state.level);
    illustratedLevel = state.level;
  }
  for (const wall of L.walls) staticLayer.append(piece(obstacle(wall, state.level)));
  for (let [li, laser] of (L.lasers || []).entries()) {
    let { x1, y1, x2, y2 } = laser;
    staticLayer.append(
      piece(`<g class="laser-unit ${laser.gate ? 'laser-gate' : ''}" data-laser="${li}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fd5872" stroke-width="32" opacity=".19" filter="url(#blur)"/>
 <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ed5b7e" stroke-width="8" stroke-linecap="round" stroke-dasharray="13 7"/>
 <circle cx="${x1}" cy="${y1}" r="12" fill="#b54464" stroke="#fff" stroke-width="3"/><circle cx="${x2}" cy="${y2}" r="12" fill="#b54464" stroke="#fff" stroke-width="3"/>
 <circle cx="${x1}" cy="${y1}" r="4" fill="#ffe7db"/><circle cx="${x2}" cy="${y2}" r="4" fill="#ffe7db"/></g>`),
    );
  }
  drawGuards(L);
  if (state.level === LEVELS.length - 1) {
    actors.append(
      piece(
        `<g class="museum-cat" transform="translate(717 208)" opacity=".88"><path class="tail" d="M-14 20Q-50 17 -39 -15Q-33 -24 -28 -15" fill="none" stroke="#d39b68" stroke-width="13" stroke-linecap="round"/><ellipse cy="19" rx="27" ry="22" fill="#d6ac7c"/><path d="M-22 -11L-24 -35L-7 -22L7 -22L23 -35L21 -11" fill="#d6ac7c" stroke="#987457" stroke-width="2"/><ellipse cy="-3" rx="25" ry="21" fill="#d6ac7c"/><circle cx="-8" cy="-3" r="3" fill="#303347"/><circle cx="8" cy="-3" r="3" fill="#303347"/><path d="M-3 7l3 4 3 -4" fill="#a65d6b"/><path d="M-9 12l-23 -4M9 12l23 -4" stroke="#8b705d" stroke-width="2"/></g>`,
      ),
    );
  }
  for (let [i, post] of (L.spools || []).entries()) {
    let { x, y, r } = post;
    const e =
      piece(`<g class="spool-unit" data-spool="${i}"><circle class="spool-halo" cx="${x}" cy="${y}" r="${r + 53}" fill="#73d7dc" opacity=".08"/>
   <circle class="spool-ring" cx="${x}" cy="${y}" r="${r + 47}" fill="none" stroke="#39abc0" stroke-dasharray="10 9" stroke-width="5" opacity=".74"/>
   <circle class="spool-progress" cx="${x}" cy="${y}" r="${r + 47}" fill="none" stroke="#55cc97" stroke-width="8" stroke-linecap="round" stroke-dasharray="0 ${((r + 47) * Math.PI * 2).toFixed(2)}" transform="rotate(-90 ${x} ${y})"/>
   <circle class="spool-groove" cx="${x}" cy="${y}" r="${r + ARM_R + 4}" fill="none" stroke="#36b7ba" stroke-width="3" stroke-dasharray="5 6" opacity=".7"/>
   <circle cx="${x + 3}" cy="${y + 7}" r="${r + 4}" fill="#333c6a" opacity=".18"/>
   <circle cx="${x}" cy="${y}" r="${r + 5}" fill="#e7f7f9" stroke="#2d93ae" stroke-width="5"/>
   <g class="spool-core"><circle cx="${x}" cy="${y}" r="${r}" fill="#5cb6c9" stroke="#276a8c" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r - 10}" fill="#b2f6fa" stroke="#317894" stroke-width="3"/><path d="M${x} ${y - r + 6}v${2 * r - 12}M${x - r + 6} ${y}h${2 * r - 12}" stroke="#38819e" stroke-width="5"/></g>
   <rect x="${x - 43}" y="${y + r + 39}" width="86" height="20" rx="8" fill="#ffffff" stroke="#6ebccb" stroke-width="2"/><text x="${x}" y="${y + r + 53}" text-anchor="middle" font-size="11" font-weight="900" fill="#278c9b" class="spool-caption">↻ TRACE EDGE</text>
  </g>`);
    staticLayer.append(e);
  }
  if (L.slider) {
    let q = L.slider,
      w = q.to - q.x;
    staticLayer.append(
      piece(`<g class="slide-unit" data-slide="1">
  <rect x="${q.x - 20}" y="${q.y - 27}" width="${w + 40}" height="69" rx="19" fill="#d2e9ed" stroke="#9fbfc8" stroke-width="3"/>
  <path d="M${q.x} ${q.y}H${q.to}" stroke="#587e9b" stroke-width="17" stroke-linecap="round"/>
  <path d="M${q.x} ${q.y}H${q.to}" stroke="#b9f6e5" stroke-width="7" stroke-linecap="round" stroke-dasharray="8 8"/>
  <path class="slide-fill" d="M${q.x} ${q.y}H${q.x}" stroke="#4bd39d" stroke-width="12" stroke-linecap="round"/>
  <g class="slide-handle" transform="translate(${q.x} ${q.y})"><circle r="22" fill="#4ebdb4" stroke="#356b83" stroke-width="5"/><circle r="11" fill="#fff2bf"/><path d="M-4 -1l5 5 8 -10" stroke="#447c73" stroke-width="3" fill="none"/></g>
  <text x="${(q.x + q.to) / 2}" y="${q.y + 31}" font-size="11" text-anchor="middle" font-weight="900" fill="#477e91" class="slide-caption">➜ PULL RIGHT</text>
 </g>`),
    );
  }
  if (L.decoy) {
    let k = L.decoy;
    staticLayer.append(
      piece(`<g class="decoy-unit" data-decoy="1"><circle class="decoy-halo" cx="${k.x}" cy="${k.y}" r="36" fill="#ffd482" opacity=".3"/>
 <circle cx="${k.x}" cy="${k.y}" r="27" fill="#ffdc75" stroke="#a67b36" stroke-width="4"/>
 <text x="${k.x}" y="${k.y + 11}" text-anchor="middle" font-size="29">🔔</text><text x="${k.x}" y="${k.y + 47}" text-anchor="middle" fill="#a47b38" font-size="11" font-weight="900">RING DECOY</text></g>`),
    );
  }
  if (L.camera) {
    let c = L.camera;
    staticLayer.append(
      piece(`<path d="M${c.x - 29} ${c.y - 32}h58v48h-58z" rx="8" fill="#4f597f" stroke="#313652" stroke-width="3"/>
 <rect x="${c.x - 20}" y="${c.y - 22}" width="40" height="9" rx="4" fill="#a6b3d1"/>
 <circle cx="${c.x}" cy="${c.y}" r="19" fill="#d2d7ed" stroke="#515579" stroke-width="6"/>
 <circle cx="${c.x}" cy="${c.y}" r="9" fill="#f1cd70"/><circle cx="${c.x + 3}" cy="${c.y - 3}" r="3.5" fill="#fff6d9"/>
 <rect x="${c.x - 24}" y="${c.y + 23}" width="48" height="14" rx="6" fill="#f5dbb0" stroke="#d2a66f" stroke-width="2"/>
 <text x="${c.x}" y="${c.y + 34}" text-anchor="middle" font-size="10" font-weight="900" fill="#8c6c47">CAM 01</text>`),
    );
  }
  updateTargets();
  updateGates();
  updatePatrols(state.clock);
  cameraCone.style.display = L.camera ? '' : 'none';
}
function updateTargets() {
  let L = LEVELS[state.level];
  targetGroup.innerHTML = '';
  let t = L.goal;
  const locked = pendingTasks().length > 0;
  targetGroup.append(
    piece(
      `<g class="treasure-spark"><path d="M${t.x - 29} ${t.y - 35}l4 -10 4 10 10 4 -10 4 -4 10 -4 -10 -10 -4Z" fill="#f5ba45"/><circle cx="${t.x + 37}" cy="${t.y - 24}" r="4" fill="#ffe98a"/></g><circle cx="${t.x}" cy="${t.y}" r="36" fill="${locked ? '#c8bfe3' : '#f9d76d'}" opacity=".31"/><circle class="${locked ? 'treasure-locked' : 'treasure-ready'}" cx="${t.x}" cy="${t.y}" r="29" fill="${locked ? '#eceaf5' : '#fff6d3'}" stroke="${locked ? '#b1a8cb' : '#e7c65e'}" stroke-width="3"/><text x="${t.x}" y="${t.y + 13}" font-size="37" text-anchor="middle">${locked ? '🔒' : state.level === 4 || state.level === 9 ? '💎' : '💰'}</text>`,
    ),
  );
  if (L.key && !state.keyTaken) {
    let k = L.key;
    targetGroup.append(
      piece(
        `<circle cx="${k.x}" cy="${k.y}" r="30" fill="#fff0a5" stroke="#e2c762" stroke-width="3"/><text x="${k.x}" y="${k.y + 12}" font-size="35" text-anchor="middle">🔑</text>`,
      ),
    );
  }
  if (state.level === LEVELS.length - 1 && !locked) {
    targetGroup.append(
      piece(
        `<g opacity=".76"><path d="M552 322 Q621 320 666 317" fill="none" stroke="#4ebf94" stroke-width="5" stroke-linecap="round" stroke-dasharray="5 12"/><path d="M656 304l14 13 -15 13" fill="none" stroke="#4ebf94" stroke-width="5" stroke-linejoin="round"/></g>`,
      ),
    );
  }
  if (L.switch) {
    let k = L.switch;
    targetGroup.append(
      piece(
        `<g class="switch-unit${state.switchOn ? ' powered' : ''}"><circle class="switch-face" cx="${k.x}" cy="${k.y}" r="33" fill="${state.switchOn ? '#b7f4c8' : '#d2f2f0'}" stroke="${state.switchOn ? '#47ae82' : '#439faa'}" stroke-width="4"/><rect x="${k.x - 18}" y="${k.y - 17}" width="36" height="34" rx="7" fill="#426579"/><circle cx="${k.x}" cy="${k.y - 1}" r="12" fill="${state.switchOn ? '#5eff8b' : '#d4ffb0'}" stroke="#eaffd8" stroke-width="3"/><text x="${k.x}" y="${k.y + 49}" font-size="12" font-weight="900" text-anchor="middle" fill="#4b9087">${state.switchOn ? 'ON ✓' : 'SWITCH'}</text></g>`,
      ),
    );
  }
}
function updateSpoolArt(i) {
  setMood('clever', 1800);
  const el = staticLayer.querySelector(`[data-spool="${i}"]`);
  if (el) {
    el.classList.add('finished');
    const cap = el.querySelector('.spool-caption');
    if (cap) cap.textContent = '✓ LINKED';
  }
}

export { drawStatic, updateSpoolArt, updateTargets };
