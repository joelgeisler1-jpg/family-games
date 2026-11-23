import { NS } from './constants.mjs';
import { $ } from './dom.mjs';
import { state } from './state.mjs';

// Ten stage-specific playable heroes, in the speech portrait and on the thief.
const CHARACTERS = [
  { name: 'Pippin', role: 'Fox Scout', type: 'fox', color: '#F79C48' },
  { name: 'Zap', role: 'Robot Hacker', type: 'robot', color: '#5BC9C7' },
  { name: 'Dozer', role: 'Sleepy Bear', type: 'bear', color: '#B88769' },
  { name: 'Pico', role: 'Night Owl', type: 'owl', color: '#BA8ED7' },
  { name: 'Moxie', role: 'Vault Raccoon', type: 'raccoon', color: '#9BA5B9' },
  { name: 'Ziggy', role: 'Gecko Acrobat', type: 'gecko', color: '#75C981' },
  { name: 'Bop', role: 'Bunny DJ', type: 'bunny', color: '#F0A3C4' },
  { name: 'Waddles', role: 'Penguin Engineer', type: 'penguin', color: '#5C86AE' },
  { name: 'Cosmo', role: 'Midnight Cat', type: 'cat', color: '#69719F' },
  { name: 'Nova', role: 'Museum Dragon', type: 'dragon', color: '#B38BDE' },
];
function characterSVG(c, hero = false) {
  // All shapes use one coordinate system. The hero reuses the same look at a smaller size.
  const common = `<ellipse cx="50" cy="102" rx="29" ry="4" fill="#372f5550"/><ellipse cx="50" cy="77" rx="27" ry="28" fill="${c.color}" stroke="#38334f" stroke-width="2.8"/><path d="M28 93L25 103M71 93L76 103" stroke="#38334f" stroke-width="7" stroke-linecap="round"/><path d="M26 71L15 84M74 71L86 84" stroke="#38334f" stroke-width="6" stroke-linecap="round"/>`;
  const eyes = `<g class="character-eye" fill="#2b2a42"><ellipse cx="40" cy="47" rx="3.2" ry="5.3"/><ellipse cx="62" cy="47" rx="3.2" ry="5.3"/></g><path d="M46 59q5 5 10 0" stroke="#76526b" stroke-width="2.7" fill="none" stroke-linecap="round"/>`;
  const faces = {
    fox: `<path class="character-tail" d="M76 81Q105 62 92 48Q94 72 69 67" fill="#F79C48" stroke="#38334f" stroke-width="3"/><path d="M24 32L20 6L41 19 59 19 80 6L76 32" fill="#F79C48" stroke="#38334f" stroke-width="3"/><path d="M26 27L23 14L38 23M74 27L77 14L62 23" fill="#ffe1c7"/><ellipse cx="50" cy="46" rx="30" ry="28" fill="#F79C48" stroke="#38334f" stroke-width="3"/><path d="M28 53Q50 85 73 53L60 49L50 57L39 49Z" fill="#fff2e8"/>${eyes}<circle cx="50" cy="56" r="4" fill="#392e40"/><path d="M38 76l13 10 13 -10" stroke="#fff7dc" stroke-width="5" fill="none"/>`,
    robot: `<path d="M50 16V5M44 5h12" stroke="#40506c" stroke-width="4"/><circle cx="50" cy="7" r="6" fill="#ffd268" stroke="#40506c" stroke-width="2"/><rect x="18" y="19" width="64" height="58" rx="13" fill="#74dce0" stroke="#3a4c63" stroke-width="3"/><rect x="26" y="31" width="48" height="34" rx="9" fill="#effaff" stroke="#3a4c63" stroke-width="2"/><rect x="32" y="42" width="14" height="11" rx="3" fill="#44659b"/><rect x="55" y="42" width="14" height="11" rx="3" fill="#44659b"/><path d="M43 59h16" stroke="#6789a7" stroke-width="3"/><circle cx="15" cy="42" r="6" fill="#ffd474"/><circle cx="85" cy="42" r="6" fill="#ffd474"/><rect x="39" y="79" width="23" height="10" rx="4" fill="#f5d16b"/>`,
    bear: `<circle cx="24" cy="26" r="13" fill="#b88769" stroke="#493444" stroke-width="3"/><circle cx="75" cy="26" r="13" fill="#b88769" stroke="#493444" stroke-width="3"/><circle cx="24" cy="26" r="6" fill="#eac6a9"/><circle cx="75" cy="26" r="6" fill="#eac6a9"/><circle cx="50" cy="48" r="31" fill="#b88769" stroke="#493444" stroke-width="3"/><path d="M20 28Q41 5 77 22L83 32Q47 22 20 37Z" fill="#7aa3ce"/><circle cx="75" cy="17" r="7" fill="#fff4ce"/><ellipse cx="50" cy="60" rx="16" ry="11" fill="#f6debe"/>${eyes}<ellipse cx="50" cy="54" rx="5" ry="3.6" fill="#44313b"/><text x="79" y="13" font-size="15" fill="#6d70ac" font-weight="900">z</text>`,
    owl: `<path d="M22 34L14 9L39 21L60 21L85 9L77 34" fill="#aa85cf" stroke="#483d66" stroke-width="3"/><ellipse cx="50" cy="48" rx="33" ry="34" fill="#ba8ed7" stroke="#483d66" stroke-width="3"/><circle cx="37" cy="43" r="16" fill="#fff2dd"/><circle cx="64" cy="43" r="16" fill="#fff2dd"/><circle cx="38" cy="44" r="8" fill="#f3bf76"/><circle cx="63" cy="44" r="8" fill="#f3bf76"/><circle cx="38" cy="44" r="4" fill="#25263d"/><circle cx="63" cy="44" r="4" fill="#25263d"/><path d="M46 55L54 55L50 65Z" fill="#f7bb55"/><path d="M26 19L39 9L52 15" fill="none" stroke="#fae7ac" stroke-width="4"/>`,
    raccoon: `<path class="character-tail" d="M80 82Q107 98 88 57" fill="none" stroke="#8c929d" stroke-width="15" stroke-linecap="round"/><path d="M87 64l11 7M89 77l12 5" stroke="#434c66" stroke-width="6"/><path d="M26 32L20 13L40 25L60 25L80 13L74 32" fill="#9ba5b9" stroke="#414659" stroke-width="3"/><ellipse cx="50" cy="48" rx="31" ry="29" fill="#9ba5b9" stroke="#414659" stroke-width="3"/><path d="M25 43Q40 29 51 40Q65 29 77 43Q67 57 52 52Q39 58 25 43Z" fill="#4b5167"/><circle cx="40" cy="44" r="4" fill="white"/><circle cx="62" cy="44" r="4" fill="white"/><path d="M40 60L50 69L60 60" fill="#f5e7dc"/><ellipse cx="50" cy="58" rx="4" ry="3" fill="#3b394c"/>`,
    gecko: `<path class="character-tail" d="M70 81Q101 82 90 52Q89 66 73 66" fill="none" stroke="#65b96f" stroke-width="13" stroke-linecap="round"/><path d="M23 34Q17 9 32 16Q45 3 51 18Q65 3 75 18Q88 10 78 35" fill="#77cf8b" stroke="#396c61" stroke-width="3"/><ellipse cx="50" cy="49" rx="33" ry="26" fill="#86d995" stroke="#396c61" stroke-width="3"/><circle cx="31" cy="29" r="13" fill="#d5fff2" stroke="#396c61" stroke-width="2"/><circle cx="70" cy="29" r="13" fill="#d5fff2" stroke="#396c61" stroke-width="2"/><circle cx="32" cy="28" r="5" fill="#323c51"/><circle cx="70" cy="28" r="5" fill="#323c51"/><path d="M37 59Q50 68 63 57" fill="none" stroke="#437b5a" stroke-width="3"/><circle cx="37" cy="55" r="3" fill="#f9a9b8"/><circle cx="67" cy="55" r="3" fill="#f9a9b8"/>`,
    bunny: `<ellipse cx="35" cy="13" rx="11" ry="27" fill="#f0a3c4" stroke="#633e63" stroke-width="3" transform="rotate(-10 35 13)"/><ellipse cx="67" cy="13" rx="11" ry="27" fill="#f0a3c4" stroke="#633e63" stroke-width="3" transform="rotate(10 67 13)"/><ellipse cx="35" cy="13" rx="5" ry="18" fill="#ffd6e5" transform="rotate(-10 35 13)"/><ellipse cx="67" cy="13" rx="5" ry="18" fill="#ffd6e5" transform="rotate(10 67 13)"/><ellipse cx="50" cy="53" rx="32" ry="28" fill="#f6b8d4" stroke="#633e63" stroke-width="3"/>${eyes}<path d="M48 57L52 57L50 61Z" fill="#da748f"/><rect x="14" y="36" width="13" height="21" rx="6" fill="#f0ca65" stroke="#7c5681" stroke-width="2"/><rect x="73" y="36" width="13" height="21" rx="6" fill="#f0ca65" stroke="#7c5681" stroke-width="2"/><path d="M20 39Q21 13 50 15Q80 13 80 39" stroke="#9271ae" stroke-width="6" fill="none"/>`,
    penguin: `<ellipse cx="50" cy="50" rx="32" ry="38" fill="#405b83" stroke="#333a57" stroke-width="3"/><ellipse cx="50" cy="55" rx="23" ry="27" fill="#fff8ed"/><path d="M18 51L4 72M82 51L96 72" stroke="#405b83" stroke-width="13" stroke-linecap="round"/><path d="M22 26L26 12L74 12L78 26Z" fill="#f6ce65" stroke="#665d67" stroke-width="3"/><rect x="37" y="7" width="27" height="9" rx="4" fill="#ffd981"/>${eyes}<path d="M43 57L58 57L50 67Z" fill="#f7b34e"/><path d="M29 95l-7 6h17m21 0h17l-7 -6" stroke="#f6ac50" stroke-width="6" stroke-linecap="round"/>`,
    cat: `<path class="character-tail" d="M76 89Q112 85 93 49" stroke="#69719f" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M20 36L19 9L40 26L59 26L81 9L79 36" fill="#69719f" stroke="#373957" stroke-width="3"/><ellipse cx="50" cy="49" rx="31" ry="29" fill="#69719f" stroke="#373957" stroke-width="3"/><path d="M23 24L27 15L36 25 M65 25L74 15L76 24" fill="#e9b0be"/><ellipse cx="39" cy="47" rx="5" ry="6" fill="#f0d26e"/><ellipse cx="62" cy="47" rx="5" ry="6" fill="#f0d26e"/><path d="M48 59h6l-3 4Z" fill="#eaa9bb"/><path d="M43 64L24 60M43 68L24 70M58 64L76 60M58 68L76 70" stroke="#e5d6e8" stroke-width="2"/><path d="M43 83l7 8 7 -8" stroke="#ffdd80" stroke-width="3" fill="none"/><path d="M50 9l2 6h7l-5 4 2 6-6 -4-6 4 2 -6-5 -4h7Z" fill="#fff0a7"/>`,
    dragon: `<path class="character-tail" d="M76 86Q111 97 90 62L88 79" fill="none" stroke="#9c70c3" stroke-width="12" stroke-linecap="round"/><path d="M23 67L4 32L32 44M77 67L96 32L69 44" fill="#8bcbba" stroke="#564574" stroke-width="3"/><path d="M24 28L20 7L37 22L51 18L65 22L80 7L76 28" fill="#b38bde" stroke="#594875" stroke-width="3"/><ellipse cx="50" cy="49" rx="31" ry="30" fill="#b38bde" stroke="#594875" stroke-width="3"/><path d="M32 57q18 24 36 0" fill="#eed3fb"/><ellipse cx="40" cy="44" rx="4" ry="6" fill="#343152"/><ellipse cx="62" cy="44" rx="4" ry="6" fill="#343152"/><path d="M46 59h8" stroke="#7b518d" stroke-width="3" stroke-linecap="round"/><circle cx="37" cy="59" r="2" fill="#8f7197"/><circle cx="64" cy="59" r="2" fill="#8f7197"/><path d="M34 80l16 10 16 -10" stroke="#ffdf95" stroke-width="5" fill="none"/>`,
  };
  // The portrait and the smaller, playable character use identical vector artwork.
  return `<svg xmlns="${NS}" viewBox="0 0 100 112" aria-hidden="true"><g class="character-bob">${common}${faces[c.type]}</g></svg>`;
}
let moodTimer = 0;
function setMood(mood, duration = 0) {
  const portrait = $('characterArt');
  if (!portrait) return;
  if (moodTimer) {
    clearTimeout(moodTimer);
    moodTimer = 0;
  }
  const moods = { ready: '✨', thinking: '🤔', alert: '😲', oops: '😵', happy: '🥳', clever: '😎' };
  portrait.dataset.mood = mood;
  const reaction = $('characterReaction');
  if (reaction) reaction.textContent = moods[mood] || '✨';
  if (duration) moodTimer = setTimeout(() => setMood('ready'), duration);
}
function showCharacter() {
  const c = CHARACTERS[state.level];
  $('characterArt').innerHTML =
    characterSVG(c) + '<span class="reaction" id="characterReaction" aria-hidden="true">✨</span>';
  $('characterArt').setAttribute('aria-label', `${c.name} the ${c.role}`);
  // The guide is a separate companion in the story dock. The original thief is unchanged.
  setMood('ready');
}

export { CHARACTERS, setMood, showCharacter };
