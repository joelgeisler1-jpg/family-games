import { mountThief, setThiefPose } from './thief.mjs';
import { redraw } from './arm-physics.mjs';
import { playSound } from './audio.mjs';
import { setMood, showCharacter } from './characters.mjs';
import { hitGuardsOnly } from './collision.mjs';
import { SAVE, START } from './constants.mjs';
import { $, actors, board, effects, stolen, svg, targetGroup } from './dom.mjs';
import { dist } from './geometry.mjs';
import { guardPos, updateAwareness, updatePatrols } from './guards.mjs';
import { updateCamera, updateScanners } from './hazards.mjs';
import { bindPointerControls } from './input.mjs';
import { LEVELS } from './levels.mjs';
import { drawStatic } from './scene.mjs';
import { state } from './state.mjs';
import { bindControls, burst, say, status, updateLevelButtons } from './ui.mjs';

try {
  state.unlocked = Math.max(1, Math.min(LEVELS.length, Number(localStorage.getItem(SAVE)) || 1));
} catch {}
function choose(n) {
  if (n >= state.unlocked) return;
  state.level = n;
  state.attempt = 0;
  load();
}
function load() {
  state.scannerAlert = 0;
  state.scannerWarned = false;
  setMood('ready');
  if (state.winAnimation) cancelAnimationFrame(state.winAnimation);
  state.winAnimation = 0;
  state.points = [{ ...START }];
  state.lastInput = { ...START };
  state.wheelContact = null;
  setThiefPose('idle');
  state.mode = 'ready';
  state.keyTaken = false;
  state.switchOn = false;
  state.spoolStates = (LEVELS[state.level].spools || []).map(() => ({
    arc: 0,
    last: null,
    done: false,
  }));
  state.slideState = { progress: 0, gripped: false, done: false, tick: 0 };
  state.decoyTriggered = false;
  state.distractedUntil = 0;
  state.guardStates = (LEVELS[state.level].guards || []).map(() => ({ alert: 0, noticed: false }));
  state.activePointer = null;
  state.edgeSide = '';
  stolen.innerHTML = '';
  effects.innerHTML = '';
  board.classList.remove('alarm');
  $('winpanel').classList.remove('show');
  $('next').classList.remove('available');
  $('levelTitle').textContent = `${state.level + 1} / ${LEVELS.length} · ${LEVELS[state.level].name}`;
  showCharacter();
  say(LEVELS[state.level].bubble || LEVELS[state.level].clue);
  status(
    LEVELS[state.level].spools
      ? '👆 Drag from your glove, then curl AROUND each blue reel.'
      : '👆 Start on the glowing glove. Touching an edge just bounces!',
  );
  drawStatic();
  redraw();
  updateLevelButtons(choose);
  $('next').textContent = state.level === LEVELS.length - 1 ? 'Play again ↻' : 'Next mission →';
}
function fail(reason, kind = 'obstacle', location = state.points.at(-1) || START) {
  if (state.mode !== 'drawing') return;
  state.mode = 'failed';
  state.activePointer = null;
  state.edgeSide = '';
  setThiefPose('caught');
  setMood('oops');
  say(reason, true);
  const alarm = kind !== 'wall';
  status(`${alarm ? '🚨' : '🧱'} ${reason} Tap Try again.`, 'fail');
  if (alarm) {
    board.classList.remove('alarm');
    void board.offsetWidth;
    board.classList.add('alarm');
  }
  if (kind === 'guard') {
    let guards = LEVELS[state.level].guards || [];
    let closest = guards
      .map((g, i) => ({ i, d: dist(guardPos(g, state.clock), location) }))
      .sort((a, b) => a.d - b.d)[0];
    if (closest) actors.querySelector(`[data-guard="${closest.i}"]`)?.classList.add('alerted');
  }
  playSound(alarm ? 'alarm' : 'thud');
}
function win() {
  board.classList.remove('success');
  void board.offsetWidth;
  board.classList.add('success');
  state.mode = 'win';
  setThiefPose('recovering');
  state.activePointer = null;
  let last = state.points.at(-1);
  let loot = svg('text', { x: last.x, y: last.y + 9, 'text-anchor': 'middle', 'font-size': 29 });
  loot.textContent = state.level === 4 || state.level === 9 ? '💎' : '💰';
  stolen.append(loot);
  targetGroup.innerHTML = '';
  let duration = 1150,
    start = performance.now(),
    original = state.points.slice();
  function retract(t) {
    let fraction = Math.max(0, Math.min(1, (t - start) / duration)),
      idx = Math.max(
        0,
        Math.min(original.length - 1, Math.floor((1 - fraction) * (original.length - 1))),
      ),
      p = original[idx];
    let shortened = original.slice(0, idx + 1);
    state.points = shortened;
    redraw();
    loot.setAttribute('x', p.x);
    loot.setAttribute('y', p.y + 9);
    if (fraction < 1) {
      state.winAnimation = requestAnimationFrame(retract);
    } else {
      state.winAnimation = 0;
      stolen.innerHTML = '';
      complete();
    }
  }
  state.winAnimation = requestAnimationFrame(retract);
  playSound('win');
}
function complete() {
  setThiefPose('victory');
  setMood('happy');
  burst(120, 388, '#e9b44c');
  if (state.level === state.unlocked - 1 && state.unlocked < LEVELS.length) {
    state.unlocked++;
    try {
      localStorage.setItem(SAVE, String(state.unlocked));
    } catch {}
  }
  updateLevelButtons(choose);
  let final = state.level === LEVELS.length - 1;
  status(
    final ? '🏆 You mastered every Sneaky Paws mission!' : '✨ Treasure secured. Nobody noticed!',
    'win',
  );
  $('winTitle').textContent = final ? '🏆 Master thief!' : '✨ Perfectly sneaky!';
  $('winText').textContent = final
    ? 'You solved all ten puzzles!'
    : 'The treasure is safe in your pocket.';
  $('winpanel').classList.add('show');
  $('next').classList.add('available');
  say(
    final
      ? 'All missions complete! You are a master thief!'
      : 'Treasure secured! Next mission is beside Try Again.',
    false,
  );
}
function animate(t) {
  const dt = Math.min(100, Math.max(0, t - (state.clock || t)));
  state.clock = t;
  updatePatrols(t);
  updateScanners(t, dt, fail);
  if (state.mode === 'drawing' && t - state.lastTime > 52) {
    if ((LEVELS[state.level].guards || []).some((g) => g.patrol))
      for (let i = 0; i < state.points.length; i += Math.max(1, Math.floor(state.points.length / 240))) {
        let issue = hitGuardsOnly(state.points[i], LEVELS[state.level].guards, state.clock);
        if (issue) {
          fail(issue.msg, issue.kind, state.points[i]);
          break;
        }
      }
    if (state.mode === 'drawing') updateAwareness(t, Math.min(130, t - state.lastTime), fail);
  }
  updateCamera(t, state.mode === 'drawing' && t - state.lastTime > 52, fail);
  if (t - state.lastTime > 52) state.lastTime = t;
  requestAnimationFrame(animate);
}
function next() {
  state.level = (state.level + 1) % LEVELS.length;
  state.attempt = 0;
  load();
}
mountThief();
bindControls({ load, next });
bindPointerControls({ fail, win });
load();
requestAnimationFrame(animate);
