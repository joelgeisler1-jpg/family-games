import { ARM_R } from './constants.mjs';
import { actors, cameraCone, piece, roomDecor, scannerFX, staticLayer, targetGroup } from './dom.mjs';
import { drawGuards, updatePatrols } from './guards.mjs';
import { updateGates } from './hazards.mjs';
import { LEVELS } from './levels.mjs';
import { pendingTasks } from './mission-status.mjs';
import { state } from './state.mjs';

function sceneDetails() {
  const labels = [
    'THE WAREHOUSE',
    'LASER HALL',
    'NIGHT SHIFT',
    'SECURITY OFFICE',
    'THE VAULT',
    'LOOP LAB',
    'PATROL HALL',
    'CONTROL ROOM',
    'DOUBLE REELS',
    'MIDNIGHT MUSEUM',
  ];
  roomDecor.innerHTML = `<g opacity=".8">
  <path d="M20 80H760 M20 484H760" stroke="#fff" stroke-width="7" opacity=".7"/>
  <g fill="none" stroke="#cbd0ed" stroke-width="3" opacity=".6"><path d="M58 72h92v-18h26 M710 429h-34v24h-50"/><circle cx="58" cy="72" r="6" fill="#d4d8f4"/><circle cx="710" cy="429" r="6" fill="#d4d8f4"/></g>
  <rect x="38" y="29" width="183" height="29" rx="9" fill="#fff" opacity=".77"/>
  <text x="52" y="49" fill="#6e648f" font-size="12" font-family="ui-rounded,system-ui,sans-serif" font-weight="900" letter-spacing="1.6">${labels[state.level]}</text>
  <g transform="translate(720 44)"><rect x="-33" y="-12" width="66" height="22" rx="6" fill="#d7e6df" stroke="#a8c7b7" stroke-width="2"/><circle cx="-20" cy="-1" r="5" fill="#64bf9c"/><text x="-10" y="3" fill="#4b7f6e" font-size="10" font-weight="900">SAFE?</text></g>
  <g opacity=".5"><rect x="282" y="34" width="165" height="11" rx="4" fill="#d9d5ec"/><rect x="282" y="34" width="64" height="11" rx="4" fill="#a9dacc"/><circle cx="457" cy="39" r="7" fill="#e3bf80" class="security-blink"/></g><g class="dust-speck" opacity=".52"><circle cx="220" cy="160" r="3" fill="#aa9acb"/><circle cx="586" cy="105" r="2.7" fill="#c7a4dd"/><circle cx="688" cy="289" r="2.6" fill="#9dbee1"/></g>
  <path d="M47 468h164 M575 468h160" stroke="#c4cbe9" stroke-width="4" stroke-linecap="round" stroke-dasharray="15 10" opacity=".57"/>
 </g>`;
  const props = [
    `<g transform="translate(537 162)" opacity=".54"><rect x="0" y="0" width="99" height="65" rx="9" fill="#dce1f3" stroke="#c3c9e9" stroke-width="3"/><path d="M15 20h65M15 34h45" stroke="#afb9da" stroke-width="5" stroke-linecap="round"/><circle cx="79" cy="49" r="6" fill="#8cdbb2"/></g>`,
    `<g opacity=".7"><path d="M48 151l16 -27 16 27z" fill="#ffe7b3" stroke="#edc479" stroke-width="3"/><text x="64" y="144" text-anchor="middle" fill="#936f37" font-size="17" font-weight="900">!</text><path d="M105 295h110 M495 435h80" stroke="#ced3ea" stroke-width="7" stroke-dasharray="13 11"/></g>`,
    `<g opacity=".72" transform="translate(688 350)"><rect x="0" y="0" width="45" height="63" rx="7" fill="#e0dff3" stroke="#bfbadb" stroke-width="3"/><path d="M11 18h23M11 30h16M11 42h23" stroke="#aaa4d0" stroke-width="4"/></g>`,
    `<g opacity=".72"><rect x="681" y="40" width="54" height="23" rx="8" fill="#f3dba9" stroke="#d8b96c" stroke-width="2"/><path d="M695 52h26" stroke="#ad925e" stroke-width="5" stroke-linecap="round"/><circle cx="61" cy="167" r="25" fill="none" stroke="#d1d8ed" stroke-width="7"/></g>`,
    `<g opacity=".75"><circle cx="692" cy="404" r="65" fill="#ecdfef" stroke="#d7c4df" stroke-width="5" stroke-dasharray="13 10"/><circle cx="692" cy="404" r="42" fill="none" stroke="#d1bfdc" stroke-width="4"/><path d="M658 404h68M692 369v70" stroke="#d1bfdc" stroke-width="5"/></g>`,
    `<g opacity=".8"><rect x="575" y="35" width="98" height="37" rx="9" fill="#d2e7e4"/><text x="624" y="59" text-anchor="middle" font-size="12" font-weight="900" fill="#428a86">SPIN TO WIN</text><path d="M41 180h80m-54-20v40" stroke="#d0dcef" stroke-width="7" stroke-linecap="round"/></g>`,
    `<g opacity=".8"><path d="M380 96h85l22 24h126" stroke="#cccfec" stroke-width="9" stroke-dasharray="10 10" fill="none"/><rect x="510" y="393" width="59" height="41" rx="9" fill="#f1e1bd"/><text x="539" y="417" font-size="12" fill="#a48656" font-weight="900" text-anchor="middle">SHHH</text></g>`,
    `<g opacity=".75"><rect x="40" y="77" width="95" height="53" rx="10" fill="#d8e6f4" stroke="#b5cde1" stroke-width="3"/><circle cx="68" cy="103" r="9" fill="#9bc9b5"/><path d="M88 100h32m-32 12h20" stroke="#9ba8c9" stroke-width="4"/><path d="M614 76v60h72" stroke="#bdd8db" stroke-width="5" stroke-dasharray="9 10" fill="none"/></g>`,
    `<g opacity=".7"><circle cx="390" cy="82" r="26" stroke="#b8d8ed" stroke-width="5" fill="none"/><path d="M366 82h48M390 60v44" stroke="#b8d8ed" stroke-width="4"/><path d="M28 340h135" stroke="#d0d5ec" stroke-width="7" stroke-dasharray="18 10"/></g>`,
    `<g opacity=".8"><path d="M65 110v52h70 M686 99h-87" stroke="#c3d4dc" stroke-width="6" stroke-dasharray="8 10" fill="none"/><rect x="35" y="80" width="85" height="24" rx="8" fill="#f7e8d4"/><text x="77" y="97" text-anchor="middle" font-size="12" font-weight="900" fill="#ab8e66">SECRET!</text></g>`,
  ];
  roomDecor.insertAdjacentHTML('beforeend', props[state.level]);
}
function drawStatic() {
  let L = LEVELS[state.level];
  scannerFX.innerHTML = '';
  staticLayer.innerHTML = '';
  actors.innerHTML = '';
  sceneDetails();
  for (let wall of L.walls) {
    let { x, y, w, h, type } = wall;
    let crate = type === 'crate';
    let g = piece(`
 <rect x="${x + 8}" y="${y + 10}" width="${w}" height="${h}" rx="12" fill="#353059" opacity=".17"/>
 <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${crate ? '#b7a1da' : '#9092bd'}" stroke="#4a456e" stroke-width="5"/>
 <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="7" fill="none" stroke="#e7def8" stroke-width="3.5" opacity=".9"/>
 ${crate ? `<path d="M${x + 25} ${y + 27}L${x + w - 25} ${y + h - 27}M${x + w - 25} ${y + 27}L${x + 25} ${y + h - 27}" stroke="#756399" stroke-width="10" opacity=".55"/><path d="M${x + w / 2} ${y + 12}v${h - 24}" stroke="#e0ccef" stroke-width="5" opacity=".7"/>` : `<path d="M${x + 11} ${y + h / 2}h${w - 22}" stroke="#7778a4" stroke-width="4"/><rect x="${x + w - 28}" y="${y + h / 2 - 19}" width="7" height="32" rx="3" fill="#f4f0ff"/>`}
 <rect x="${x + 14}" y="${y + 14}" width="${crate ? 35 : 23}" height="11" rx="4" fill="#fff2c6" opacity=".8"/><g opacity=".64"><path d="M${x + 10} ${y + Math.max(23, h - 18)}h${Math.min(w - 20, 44)}" stroke="#fff2ae" stroke-width="6" stroke-dasharray="9 7"/></g>
 `);
    staticLayer.append(g);
  }
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
   <circle class="spool-groove" cx="${x}" cy="${y}" r="${r + ARM_R + 3.5}" fill="none" stroke="#36b7ba" stroke-width="3" stroke-dasharray="5 6" opacity=".7"/>
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
      `<g class="treasure-spark"><path d="M${t.x - 29} ${t.y - 35}l4 -10 4 10 10 4 -10 4 -4 10 -4 -10 -10 -4Z" fill="#f5ba45"/><circle cx="${t.x + 37}" cy="${t.y - 24}" r="4" fill="#ffe98a"/></g><circle cx="${t.x}" cy="${t.y}" r="36" fill="${locked ? '#c8bfe3' : '#f9d76d'}" opacity=".31"/><circle cx="${t.x}" cy="${t.y}" r="29" fill="${locked ? '#eceaf5' : '#fff6d3'}" stroke="${locked ? '#b1a8cb' : '#e7c65e'}" stroke-width="3"/><text x="${t.x}" y="${t.y + 13}" font-size="37" text-anchor="middle">${locked ? '🔒' : state.level === 4 || state.level === 9 ? '💎' : '💰'}</text>`,
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
        `<g class="switch-unit"><circle cx="${k.x}" cy="${k.y}" r="33" fill="${state.switchOn ? '#b7f4c8' : '#d2f2f0'}" stroke="${state.switchOn ? '#47ae82' : '#439faa'}" stroke-width="4"/><rect x="${k.x - 18}" y="${k.y - 17}" width="36" height="34" rx="7" fill="#426579"/><circle cx="${k.x}" cy="${k.y - 1}" r="12" fill="${state.switchOn ? '#5eff8b' : '#d4ffb0'}" stroke="#eaffd8" stroke-width="3"/><text x="${k.x}" y="${k.y + 49}" font-size="12" font-weight="900" text-anchor="middle" fill="#4b9087">${state.switchOn ? 'ON ✓' : 'SWITCH'}</text></g>`,
      ),
    );
  }
}
function updateSpoolArt(i) {
  const el = staticLayer.querySelector(`[data-spool="${i}"]`);
  if (el) {
    el.classList.add('finished');
    const cap = el.querySelector('.spool-caption');
    if (cap) cap.textContent = '✓ LINKED';
  }
}

export { drawStatic, updateSpoolArt, updateTargets };
