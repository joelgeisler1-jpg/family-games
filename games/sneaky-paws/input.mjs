import { redraw, sampleOnDrag } from './arm-physics.mjs';
import { playSound } from './audio.mjs';
import { H, START, W } from './constants.mjs';
import { scene } from './dom.mjs';
import { dist } from './geometry.mjs';
import { LEVELS } from './levels.mjs';
import { drawStatic } from './scene.mjs';
import { state } from './state.mjs';
import { say, status } from './ui.mjs';

function position(ev) {
  let r = scene.getBoundingClientRect();
  return { x: ((ev.clientX - r.left) / r.width) * W, y: ((ev.clientY - r.top) / r.height) * H };
}
function bindPointerControls({ fail, win }) {
  scene.addEventListener('pointerdown', (ev) => {
    if (state.mode === 'win') return;
    let p = position(ev);
    if (state.mode === 'failed') {
      status('↻ Tap Try again to reset your arm.', 'fail');
      return;
    }
    if (state.mode === 'ready') {
      if (dist(p, START) > 65) {
        status('👆 Touch the glowing glove beside the thief to start.');
        return;
      }
      state.mode = 'drawing';
      state.attempt++;
      state.points = [{ ...START }];
      state.lastInput = { ...START };
      state.wheelContact = null;
      playSound('start');
      say(
        LEVELS[state.level].pulse
          ? 'Watch the beam charge before it fires!'
          : LEVELS[state.level].radar
            ? 'Keep your arm outside the sweeping radar!'
            : 'Careful... guards will notice if you stay in their sight!',
        false,
        2800,
      );
      status('🤫 Weave around obstacles and security. Edges just bounce!');
    } else if (state.mode !== 'drawing') return;
    state.activePointer = ev.pointerId;
    scene.setPointerCapture(ev.pointerId);
    sampleOnDrag(p, fail, win);
    ev.preventDefault();
  });
  scene.addEventListener('pointermove', (ev) => {
    if (state.mode !== 'drawing' || state.activePointer !== ev.pointerId) return;
    sampleOnDrag(position(ev), fail, win);
    ev.preventDefault();
  });
  function release(ev) {
    if (ev.pointerId !== state.activePointer) return;
    state.activePointer = null;
    state.edgeSide = '';
    state.wheelContact = null;
    state.lastInput = { ...START };
    if (state.mode === 'drawing') {
      state.mode = 'ready';
      state.points = [{ ...START }];
      state.keyTaken = false;
      state.switchOn = false;
      state.spoolStates = (LEVELS[state.level].spools || []).map(() => ({
        arc: 0,
        last: null,
        done: false,
      }));
      drawStatic();
      redraw();
      state.slideState = { progress: 0, gripped: false, done: false, tick: 0 };
      state.decoyTriggered = false;
      state.distractedUntil = 0;
      state.guardStates = (LEVELS[state.level].guards || []).map(() => ({ alert: 0, noticed: false }));
      say('Draw in one motion to reach the treasure!', true, 2500);
      status('↻ You let go! Start at the glove and draw in ONE motion.');
    }
  }
  scene.addEventListener('pointerup', release);
  scene.addEventListener('pointercancel', release);
}

export { bindPointerControls };
