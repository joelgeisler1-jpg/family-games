import { NS } from './constants.mjs';

const bodies = {
  fox: `<path class="character-tail" d="M66 90Q100 92 93 59Q82 78 65 75Z" fill="#ed8249"/><path d="M85 74q5-7 8-15l1 17z" fill="#fff3da" stroke="none"/>
    <path d="M28 76q20-20 44 0l-5 19q-14 12-33 0Z" fill="#e98549"/><path d="M33 77l17 8 17-8-6 13H40Z" fill="#64d9b3"/>
    <path d="M24 39L18 9q13 2 26 15h15Q73 10 83 9l-6 30q10 15-5 25L50 74 27 62q-12-10-3-23Z" fill="#f4a15a"/>
    <path d="m26 30-3-14 15 10m36 4 3-14-14 10" fill="#f9c4bb"/><path d="M25 52q13-3 25 9 12-11 25-9l-4 12-21 9-21-11Z" fill="#fff1d9" stroke="none"/>`,
  robot: `<path d="M24 81h52v14l-11 5H32l-8-6Z" fill="#67b8c8"/><path d="M41 87h18" stroke="#f5cc70" stroke-width="5"/>
    <path d="M50 22V10" fill="none"/><circle class="companion-accent" cx="50" cy="10" r="6" fill="#ffd477"/>
    <rect x="14" y="34" width="72" height="22" rx="8" fill="#f9cd74"/><rect x="20" y="22" width="60" height="53" rx="14" fill="#83e3df"/>
    <rect x="27" y="29" width="46" height="38" rx="10" fill="#d9f8f6"/><path d="M23 34v15m55-13v13" fill="none" stroke="#529bb4"/>`,
  bear: `<path d="M25 82q11-13 25-9 15-7 25 9l-5 15H31Z" fill="#b77d65"/><path d="M30 80q9 17 28 16l6-18Z" fill="#879bdd"/>
    <circle cx="25" cy="24" r="12" fill="#b67d62"/><circle cx="75" cy="24" r="12" fill="#b67d62"/>
    <path d="M18 44q2-26 32-26 32 0 32 27T50 75Q18 74 18 44Z" fill="#d29979"/>
    <path d="M18 32Q28 12 67 19l10 9Q50 23 18 37Z" fill="#788cc9"/><circle class="companion-accent" cx="74" cy="19" r="6" fill="#fff0b8"/>
    <ellipse cx="50" cy="58" rx="17" ry="12" fill="#ffe1bd" stroke="none"/>`,
  owl: `<path d="M23 75q6-11 27-9 20-2 28 9l-13 21-29 2Z" fill="#9b83c2"/>
    <path d="M26 74q-8 13 0 18m49-18q8 13 0 18" fill="none" stroke="#59466f" stroke-width="6"/>
    <path d="M21 41L16 15q12 1 22 14 14-7 24 0 10-13 23-14l-7 26q11 30-28 35-39-4-29-35Z" fill="#bd9dde"/>
    <circle cx="37" cy="45" r="14" fill="#fff1d7" stroke="none"/><circle cx="63" cy="45" r="14" fill="#fff1d7" stroke="none"/>
    <path d="m45 55 5-4 6 4-6 9Z" fill="#f4ba58"/><path d="M44 77l6 5 6-5m-18 9 6 4m18-4-6 4" stroke="#e3c4ed" fill="none"/>`,
  raccoon: `<path class="character-tail" d="M67 87q35 13 26-15-5-6-14-1l-12 5Z" fill="#aab4c9"/><path d="M80 74l-3 17m12-18-3 17" stroke="#58647d" stroke-width="5"/>
    <path d="M26 80q22-13 49 0l-5 16H32Z" fill="#8695b1"/><path d="m40 79 10 17 10-17" fill="#62c7ad"/>
    <path d="M23 37 20 14q16 1 24 13h14q13-12 23-13l-3 24q6 32-28 36-37-4-27-37Z" fill="#b5bfd3"/>
    <path d="M23 43q13-16 27-4 16-12 27 4-11 17-27 9-17 8-27-9Z" fill="#5b6580" stroke="none"/>
    <path d="M36 57q14-7 28 0l-6 10H42Z" fill="#eee8df" stroke="none"/>`,
  gecko: `<path class="character-tail" d="M60 87q33 18 38-8 2-13-9-15 4 16-15 12Z" fill="#61bb95"/>
    <path d="M30 80q18-13 41 0l-7 17H34Z" fill="#6bc59d"/><path d="M38 83q12-5 25 0l-4 13H42Z" fill="#e0eda4"/>
    <path d="M20 51q-2-21 16-24 13 1 14 10 5-12 17-10 16 4 13 24l4 6q-5 19-34 19-26-1-34-18Z" fill="#92dcad"/>
    <path d="M21 56q12-6 29 0 18-6 29 0-8 15-29 16-20-1-29-16Z" fill="#d9f0b0" stroke="none"/>
    <path d="M24 50h3m45 0h3M49 44h3" stroke="#4a9d84" stroke-width="3"/>`,
  bunny: `<path d="M27 82q18-12 45 0l-7 16H34Z" fill="#d582c2"/><path d="M37 89l13-7 13 7-13 7Z" fill="#ffe5a0"/>
    <path d="M27 40Q13 5 25 4q10-1 18 20l14 2Q65 2 77 6q11 4-4 33Z" fill="#ec9dd0"/><path d="M27 13l8 17m39-16-9 18" stroke="#ffcfe6" stroke-width="4"/>
    <ellipse cx="50" cy="51" rx="31" ry="25" fill="#f5bbdf"/><path d="M21 47q-4-20 29-24 32 3 31 24" fill="none" stroke="#7764b2" stroke-width="5"/>
    <rect x="14" y="42" width="11" height="18" rx="5" fill="#f8cb72"/><rect x="75" y="42" width="11" height="18" rx="5" fill="#f8cb72"/>`,
  penguin: `<path d="M23 83q15-47 27-43 12-4 27 43l-10 13H32Z" fill="#557bad"/>
    <path d="M25 72 15 90m59-18 11 18" stroke="#45658e" stroke-width="8"/><path d="M32 94h11m14 0h11" stroke="#eaab57" stroke-width="7"/>
    <path d="M22 44q0-22 28-22 29 0 29 22l-2 18q-7 24-27 24-21 0-27-24Z" fill="#526da0"/>
    <path d="M26 55q1-23 24-17 25-6 25 17-1 26-25 27-24-2-24-27Z" fill="#fff4de" stroke="none"/>
    <path d="M22 30l6-12q22-13 44 0l7 12Z" fill="#f8cd70"/><path d="M44 15v10m-20 5h52" stroke="#8c6e62"/><path d="m43 57 7-4 7 4-7 8Z" fill="#f5ad57"/>`,
  cat: `<path class="character-tail" d="M72 88q26 5 20-23" fill="none" stroke="#7978aa" stroke-width="9"/>
    <path d="M27 80q19-14 45 0l-4 17H31Z" fill="#7978aa"/><path d="m39 80 11 13 11-13" fill="#a298d6"/><path d="m47 87 3-4 3 4-3 5Z" fill="#ffd885"/>
    <path d="M21 39V12l22 15h14l22-15v27q10 34-29 36-40-3-29-36Z" fill="#9692c7"/>
    <path d="M28 30V20l13 8m31 2V20l-13 8" fill="#f3b6cc" stroke="none"/><path d="M31 58l-13-3m13 9-12 2m49-8 14-3m-14 8 13 2" stroke="#f6e6f7" fill="none"/>`,
  dragon: `<path class="character-tail" d="M69 87q26 19 25-8l-7 4-11-8Z" fill="#9d77c9"/>
    <path d="M29 75 7 51q12-4 29 5m38 20 19-25q-13-4-28 5" fill="#8fd6c6"/>
    <path d="M28 79q19-12 45 0l-6 18H33Z" fill="#ac8ada"/><path d="m39 82 11 10 11-10" fill="#fada91"/>
    <path d="M25 36 18 10l16 12 9 5h15l8-5 15-12-7 26q12 31-24 39-36-6-25-39Z" fill="#c3a1ee"/>
    <path d="M29 54q19-8 42 0l-5 13-16 6-16-6Z" fill="#eed0fc" stroke="none"/>
    <path d="M44 55h1m10 0h1" stroke="#8b5ca8" stroke-width="3"/>`,
};

function expression(mood, eyes, mouth, marks = '') {
  return `<g class="companion-face" data-expression="${mood}">${eyes}${mouth}${marks}</g>`;
}

function companionSVG(type) {
  const pupils = (r, y = 4.5) =>
    `<g class="character-eye" fill="#302440"><ellipse cx="38" cy="45" rx="${r}" ry="${y}"/><ellipse cx="62" cy="45" rx="${r}" ry="${y}"/><path d="M37 43h.3m24 0h.3" stroke="white" stroke-width="1.8"/></g>`;
  const mouth = (d) => `<path d="${d}" fill="none" stroke="#633953" stroke-width="2.5"/>`;
  const beak = type === 'owl' || type === 'penguin';
  const smile = beak ? '' : mouth('M44 60q6 6 12 0');
  const faces = [
    expression('ready', pupils(3.7), smile),
    expression('thinking', pupils(3.4, 3.6), beak ? '' : mouth('M46 62h8'), mouth('M33 37l9-3')),
    expression(
      'alert',
      pupils(5.2, 5.6),
      beak ? '' : '<ellipse cx="50" cy="62" rx="4.2" ry="5" fill="#783857"/>',
      mouth('M33 35l8-2m18 0 8 2'),
    ),
    expression('oops', pupils(3.4), beak ? '' : mouth('M44 65q6-7 12 0'), mouth('M33 38l8-4m18 0 8 4')),
    expression('clever', pupils(3.6, 3.4), beak ? '' : mouth('M44 61q9 4 13-3'), mouth('M59 36l8 1')),
    expression(
      'happy',
      mouth('M33 47q5-8 10 0m14 0q5-8 10 0'),
      beak ? '' : '<path d="M43 59h14q-7 16-14 0Z" fill="#9e4466" stroke="#633953" stroke-width="1.3"/>',
    ),
  ].join('');
  return `<svg xmlns="${NS}" viewBox="0 0 100 106" aria-hidden="true">
    <ellipse cx="50" cy="100" rx="29" ry="4" fill="#362743" opacity=".18"/>
    <g class="character-bob" stroke-linejoin="round" stroke-linecap="round">
      <g stroke="#493957" stroke-width="2.7">${bodies[type]}</g>
      ${faces}
    </g>
  </svg>`;
}

export { companionSVG };
