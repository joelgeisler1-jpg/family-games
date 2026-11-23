import { LEVELS } from './levels.mjs';
import { state } from './state.mjs';

function pendingTasks() {
  let L = LEVELS[state.level],
    todo = [];
  if (L.spools && state.spoolStates.some((p) => !p.done))
    todo.push(`reels ${state.spoolStates.filter((p) => p.done).length}/${state.spoolStates.length}`);
  if (L.slider && !state.slideState.done) todo.push('slide bolt');
  if (L.decoy && !state.decoyTriggered) todo.push('ring bell');
  if (L.switch && !state.switchOn) todo.push('switch');
  if (L.key && !state.keyTaken) todo.push('key');
  return todo;
}
function taskMessage() {
  let todo = pendingTasks();
  return todo.length
    ? '🔒 Still needed: ' + todo.join(' · ')
    : '🔓 All security cleared! Grab the treasure.';
}

export { pendingTasks, taskMessage };
