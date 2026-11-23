import { playSound } from './audio.mjs';
import { setMood } from './characters.mjs';
import { staticLayer } from './dom.mjs';
import { clamp, dist } from './geometry.mjs';
import { updateGates } from './hazards.mjs';
import { LEVELS } from './levels.mjs';
import { pendingTasks, taskMessage } from './mission-status.mjs';
import { updateTargets } from './scene.mjs';
import { state } from './state.mjs';
import { burst, say, status } from './ui.mjs';

function guideToSlide(p) {
  let k = LEVELS[state.level].slider;
  if (!k || state.slideState.done) return p;
  const inRail = Math.abs(p.y - k.y) < 37 && p.x >= k.x - 25 && p.x <= k.to + 30;
  if (
    !state.slideState.gripped &&
    Math.hypot(p.x - (k.x + (k.to - k.x) * state.slideState.progress), p.y - k.y) < 31
  ) {
    state.slideState.gripped = true;
    staticLayer.querySelector('.slide-unit')?.classList.add('gripping');
    playSound('grip');
    say('Got it! Pull the bolt to the right ➜', true, 2000);
  }
  if (!state.slideState.gripped) return p;
  if (!inRail) {
    state.slideState.gripped = false;
    staticLayer.querySelector('.slide-unit')?.classList.remove('gripping');
    return p;
  }
  return { x: clamp(p.x, k.x, k.to), y: k.y };
}
function checkSlide(p) {
  let k = LEVELS[state.level].slider;
  if (!k || state.slideState.done || !state.slideState.gripped) return;
  const progress = clamp((p.x - k.x) / (k.to - k.x), 0, 1);
  if (progress > state.slideState.progress) state.slideState.progress = progress;
  let e = staticLayer.querySelector('.slide-unit');
  e?.querySelector('.slide-handle')?.setAttribute(
    'transform',
    `translate(${(k.x + (k.to - k.x) * state.slideState.progress).toFixed(1)} ${k.y})`,
  );
  e?.querySelector('.slide-fill')?.setAttribute(
    'd',
    `M${k.x} ${k.y}H${(k.x + (k.to - k.x) * state.slideState.progress).toFixed(1)}`,
  );
  if (Math.floor(progress * 5) > state.slideState.tick) {
    state.slideState.tick = Math.floor(progress * 5);
    playSound('slide');
  }
  if (state.slideState.progress > 0.975) {
    state.slideState.done = true;
    state.slideState.gripped = false;
    e?.classList.add('finished');
    setMood('clever', 1800);
    e?.classList.remove('gripping');
    e?.querySelector('.slide-caption') &&
      (e.querySelector('.slide-caption').textContent = '✓ BOLT OPEN');
    playSound('latch');
    burst(k.to, k.y, '#56ce9e');
    updateTargets();
    say('Click! The bolt is open. Sneak to the treasure!', true, 2900);
    status(`🔓 Bolt unlocked! ${taskMessage()}`);
  }
}
function ringDecoy(p) {
  const k = LEVELS[state.level].decoy;
  if (!k || dist(p, k) > 28 || state.decoyTriggered) return;
  state.decoyTriggered = true;
  state.distractedUntil = state.clock + (k.duration || 4300);
  state.guardStates.forEach((st) => {
    st.alert = 0;
    st.noticed = false;
  });
  staticLayer.querySelector('.decoy-unit')?.classList.add('playing');
  playSound('decoy');
  burst(k.x, k.y, '#edbc5b');
  updateTargets();
  say('Ding-ding! The guards are distracted. Go!', true, 2800);
  status(`🔔 Distraction started! ${taskMessage()}`);
}
function checkTargets(next) {
  let L = LEVELS[state.level];
  if (L.key && !state.keyTaken && dist(next, L.key) < 29) {
    state.keyTaken = true;
    updateTargets();
    status(`🔑 Key collected! ${taskMessage()}`);
    say(`Got the key! ${taskMessage()}`, true, 2300);
    setMood('clever', 1800);
    playSound('key');
    burst(L.key.x, L.key.y);
  }
  if (L.switch && !state.switchOn && dist(next, L.switch) < 30) {
    state.switchOn = true;
    updateGates();
    updateTargets();
    status(`🟢 Security gate OFF! ${taskMessage()}`);
    say('Gate switched off! ' + taskMessage(), true, 2400);
    setMood('clever', 1800);
    playSound('switch');
    burst(L.switch.x, L.switch.y);
  }
  if (dist(next, L.goal) < 28) {
    if (pendingTasks().length) {
      status(taskMessage());
      say(taskMessage(), true, 1800);
    } else {
      return true;
    }
  }
  return false;
}

export { checkSlide, checkTargets, guideToSlide, ringDecoy };
