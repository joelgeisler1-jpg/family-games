import { playSound, toggleSound } from './audio.mjs';
import { CHARACTERS, setMood } from './characters.mjs';
import { W } from './constants.mjs';
import { $, arm, effects, piece } from './dom.mjs';
import { LEVELS } from './levels.mjs';
import { state } from './state.mjs';

let bubbleTimer = 0,
  lastEdgeSound = 0;
function burst(x, y, color = '#85d8b2') {
  let fx = piece(
    `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${color}" stroke-width="6" class="edge-ripple"/><text x="${x}" y="${y - 25}" font-size="19" font-weight="900" text-anchor="middle" fill="${color}" class="edge-label">★</text>`,
  );
  effects.append(fx);
  setTimeout(() => fx.remove(), 700);
}
function status(msg, kind = '') {
  $('noticeText').textContent = msg;
  $('notice').className = 'notice ' + kind;
  $('attempts').textContent = state.attempt
    ? `${state.attempt} ${state.attempt === 1 ? 'try' : 'tries'}`
    : '';
}
function updateLevelButtons(choose) {
  let e = $('levels');
  e.innerHTML = '';
  LEVELS.forEach((L, i) => {
    let b = document.createElement('button');
    b.type = 'button';
    b.className = 'level' + (state.level === i ? ' active' : '');
    b.disabled = i >= state.unlocked;
    b.textContent = i < state.unlocked ? `✦ ${i + 1}` : `🔒 ${i + 1}`;
    b.setAttribute('aria-label', `Level ${i + 1}: ${L.name}${i >= state.unlocked ? ' locked' : ''}`);
    if (i === state.level) b.setAttribute('aria-current', 'step');
    b.onclick = () => choose(i);
    e.append(b);
  });
  requestAnimationFrame(() => {
    let b = e.children[state.level];
    if (b)
      e.scrollLeft = Math.max(0, b.offsetLeft - e.offsetLeft - e.clientWidth / 2 + b.clientWidth / 2);
  });
}
function say(message, tip = false, duration = 0) {
  const bubble = $('speech');
  bubble.classList.toggle('tip', tip);
  $('bubbleSpeaker').textContent =
    `${tip ? '💡 ' : ''}${CHARACTERS[state.level].name.toUpperCase()} · ${tip ? 'HINT' : CHARACTERS[state.level].role.toUpperCase()}`;
  $('bubbleText').textContent = message;
  clearTimeout(bubbleTimer);
  if (duration)
    bubbleTimer = setTimeout(() => {
      if (state.mode !== 'win' && state.mode !== 'failed')
        say(LEVELS[state.level].bubble || LEVELS[state.level].clue);
    }, duration);
}
function edgeBump(p, side) {
  const now = performance.now();
  if (state.edgeSide === side && now - lastEdgeSound < 650) return;
  state.edgeSide = side;
  if (now - lastEdgeSound < 150) return;
  lastEdgeSound = now;
  let n =
    piece(`<circle class="edge-ripple" cx="${p.x}" cy="${p.y}" r="21" fill="none" stroke="#a47afb" stroke-width="5"/>
 <g class="edge-label"><text x="${Math.max(68, Math.min(W - 68, p.x))}" y="${Math.max(45, p.y - 23)}" font-size="22" font-weight="900" text-anchor="middle" fill="#7955c7" stroke="white" stroke-width="4" paint-order="stroke">boing!</text></g>`);
  effects.append(n);
  setTimeout(() => n.remove(), 710);
  say('Boing! The edges are safe. Keep stretching!', true, 1600);
  status('✨ Boing! That edge is harmless — keep stretching.', 'edge');
  playSound('boing');
  arm.closest('#armGroup').classList.remove('edge-bump');
  void arm.closest('#armGroup').getBoundingClientRect();
  arm.closest('#armGroup').classList.add('edge-bump');
}
function bindControls({ load, next }) {
  $('soundToggle').onclick = () => {
    const enabled = toggleSound();
    $('soundToggle').textContent = enabled ? '🔊' : '🔇';
    $('soundToggle').setAttribute('aria-label', enabled ? 'Mute sound' : 'Turn sound on');
    $('soundToggle').setAttribute('aria-pressed', String(!enabled));
    if (enabled) playSound('boing');
  };
  $('reset').onclick = () => {
    playSound('reset');
    load();
  };
  $('hint').onclick = () => {
    setMood('thinking', 3500);
    playSound('hint');
    say(LEVELS[state.level].hint, true, 6500);
  };
  $('next').onclick = next;
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') load();
    if (ev.key === 'Enter' && state.mode === 'win') $('next').click();
  });
}

export { bindControls, burst, edgeBump, say, status, updateLevelButtons };
