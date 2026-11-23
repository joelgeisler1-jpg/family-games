import { companionSVG } from './companion-art.mjs';
import { setThiefExpression } from './thief.mjs';
import { $ } from './dom.mjs';
import { state } from './state.mjs';

// Mission guides live in the story dock.
const CHARACTERS = [
  { name: 'Pippin', role: 'Fox Scout', type: 'fox' },
  { name: 'Zap', role: 'Robot Hacker', type: 'robot' },
  { name: 'Dozer', role: 'Sleepy Bear', type: 'bear' },
  { name: 'Pico', role: 'Night Owl', type: 'owl' },
  { name: 'Moxie', role: 'Vault Raccoon', type: 'raccoon' },
  { name: 'Ziggy', role: 'Gecko Acrobat', type: 'gecko' },
  { name: 'Bop', role: 'Bunny DJ', type: 'bunny' },
  { name: 'Waddles', role: 'Penguin Engineer', type: 'penguin' },
  { name: 'Cosmo', role: 'Midnight Cat', type: 'cat' },
  { name: 'Nova', role: 'Museum Dragon', type: 'dragon' },
];
let moodTimer = 0;
function setMood(mood, duration = 0) {
  setThiefExpression(mood);
  const portrait = $('characterArt');
  if (!portrait) return;
  if (moodTimer) {
    clearTimeout(moodTimer);
    moodTimer = 0;
  }
  const moods = { ready: '✨', thinking: '🤔', alert: '😲', oops: '💧', happy: '🥳', clever: '😎' };
  portrait.dataset.mood = mood;
  const reaction = $('characterReaction');
  if (reaction) reaction.textContent = moods[mood] || '✨';
  if (duration) moodTimer = setTimeout(() => setMood('ready'), duration);
}
function showCharacter() {
  const c = CHARACTERS[state.level];
  $('characterArt').innerHTML =
    companionSVG(c.type) + '<span class="reaction" id="characterReaction" aria-hidden="true">✨</span>';
  $('characterArt').setAttribute('aria-label', `${c.name} the ${c.role}`);
  setMood('ready');
}

export { CHARACTERS, setMood, showCharacter };
