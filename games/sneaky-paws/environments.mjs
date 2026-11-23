// The illustrated frieze and floor markings are paint. Gameplay coordinates
// and solid silhouettes are supplied by the board renderer separately.
const rooms = [
  {
    name: 'Dispatch warehouse',
    floor: ['#f9ecd8', '#fff8e7', '#e9bfa0'],
    wall: '#88536b',
    ink: '#57344f',
    light: '#ffd391',
    mark: '#ba7957',
    material: ['#eab076', '#b26b49', '#8677a3', '#54496f'],
  },
  {
    name: 'Photon transit',
    floor: ['#d5e5fc', '#f3faff', '#afc9eb'],
    wall: '#364e90',
    ink: '#273266',
    light: '#a1ebff',
    mark: '#5889c0',
    material: ['#98b4ec', '#5667aa', '#819acd', '#414d89'],
  },
  {
    name: 'Night watch',
    floor: ['#eadde9', '#fff3ea', '#d0b7de'],
    wall: '#5a4e78',
    ink: '#3f345b',
    light: '#ffdfa7',
    mark: '#9178a1',
    material: ['#dbac9a', '#9e6881', '#a296c2', '#675681'],
  },
  {
    name: 'Surveillance office',
    floor: ['#d3eee8', '#f0fff5', '#abcbd7'],
    wall: '#306a7a',
    ink: '#234963',
    light: '#a9fce1',
    mark: '#619a9a',
    material: ['#91bfd2', '#50759c', '#8bb6c2', '#476681'],
  },
  {
    name: 'Bullion reserve',
    floor: ['#f1dfc7', '#fff6e7', '#e3c49a'],
    wall: '#855666',
    ink: '#53364f',
    light: '#ffe39e',
    mark: '#b08053',
    material: ['#e4ba75', '#a87555', '#aa98a6', '#655573'],
  },
  {
    name: 'Invention laboratory',
    floor: ['#d6ece0', '#f5f9df', '#b9dac8'],
    wall: '#426d70',
    ink: '#294e5d',
    light: '#deef9f',
    mark: '#779777',
    material: ['#b3c39b', '#63876e', '#9faec5', '#516889'],
  },
  {
    name: 'Checkpoint seven',
    floor: ['#d7e4f6', '#f1f4ff', '#c3c9e7'],
    wall: '#50587e',
    ink: '#343957',
    light: '#ffd595',
    mark: '#7080ab',
    material: ['#b1aacb', '#726c9b', '#8d9ec5', '#4c5987'],
  },
  {
    name: 'Power control',
    floor: ['#d5f0ea', '#effdf7', '#b3d7dc'],
    wall: '#31677b',
    ink: '#254965',
    light: '#c9f9b9',
    mark: '#548f9b',
    material: ['#95bdd0', '#557fa0', '#9ab4c5', '#4a6385'],
  },
  {
    name: 'Clockwork workshop',
    floor: ['#f2e2d8', '#fff4df', '#e1bdaf'],
    wall: '#80556c',
    ink: '#533a58',
    light: '#ffce91',
    mark: '#b88267',
    material: ['#d9ad85', '#946454', '#b19eaf', '#6a5879'],
  },
  {
    name: 'Moonlight gallery',
    floor: ['#d9def5', '#f4eefb', '#bbbde3'],
    wall: '#44436e',
    ink: '#292b55',
    light: '#c8e5ff',
    mark: '#8387b8',
    material: ['#b6a3d1', '#766496', '#9ca7ce', '#515686'],
  },
];

const group = (x, y, content) => `<g transform="translate(${x} ${y})">${content}</g>`;
const dot = (x, y, color, r = 2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const star = (x, y, color) =>
  group(x, y, `<path d="M0-7Q1-1 7 0Q1 1 0 7Q-1 1-7 0Q-1-1 0-7Z" fill="${color}"/>`);

function lamp(x, color) {
  return group(
    x,
    17,
    `<path d="M0-17V0" stroke="#292745" stroke-width="4"/><path d="M-22 11L-49 60H49L22 11Z" fill="${color}" opacity=".19"/><ellipse cy="11" rx="22" ry="5" fill="${color}"/><path d="M-22 10Q-17-5 0-5T22 10Z" fill="#423657" stroke="#292745" stroke-width="2"/>`,
  );
}

function monitor(x, y, color, signal) {
  return group(
    x,
    y,
    `<rect width="75" height="40" rx="7" fill="#232c4a" stroke="#a4b6cf" stroke-opacity=".75" stroke-width="2"/><rect x="5" y="5" width="65" height="27" rx="4" fill="${color}" opacity=".2"/><g class="env-signal" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round">${signal}</g><path d="M34 40v4m-10 0h27" stroke="#23314b" stroke-width="4" stroke-linecap="round"/>${dot(65, 36, color, 1.3)}`,
  );
}

const waveform = '<path d="M9 23h12l6-10 8 13 8-16 8 11h13"/>';
const plan = '<path d="M14 10h43v17H14Zm13 0v9h17v8m0-8h13"/><circle cx="23" cy="23" r="2"/>';
const scope = '<circle cx="38" cy="18" r="10"/><path d="M20 18h36m-18-12v24m0-12 7-6"/>';

function gear(x, y, r, color) {
  return group(
    x,
    y,
    `<g class="env-gear"><circle r="${r}" fill="#36425e" stroke="${color}" stroke-width="6" stroke-dasharray="8 4"/><circle r="${r - 5}" fill="none" stroke="${color}" opacity=".8"/><path d="M${5 - r} 0H${r - 5}M0 ${5 - r}V${r - 5}" stroke="${color}" stroke-width="4"/><circle r="4" fill="#f5dbc0"/></g>`,
  );
}

function gauge(x, y, color) {
  return group(
    x,
    y,
    `<circle r="15" fill="#253d55" stroke="${color}" stroke-width="2"/><path d="M-9 4A10 10 0 1 1 9 4m-9 0 5-8" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`,
  );
}

function parcels(x, y) {
  return group(
    x,
    y,
    `<path d="M-7 34h80v5H-7m9 0v5m26-5v5m28-5v5" fill="none" stroke="#55374d" stroke-width="4"/><rect x="0" y="9" width="30" height="24" rx="3" fill="#e6a565"/><rect x="32" y="0" width="34" height="33" rx="3" fill="#bc7887"/><path d="M10 10v22M46 1v31" stroke="#ffdd9e" stroke-width="5"/><path d="M18 25h8m25 0h9" stroke="#fff2cb" stroke-width="3"/>`,
  );
}

const vignettes = [
  (c) =>
    `${lamp(292, c.light)}${lamp(501, c.light)}${lamp(720, c.light)}${parcels(332, 19)}${parcels(551, 19)}<path d="M327 65h84m135 0h84" stroke="#5a3d53" stroke-width="4"/>`,
  (c) =>
    `<path d="M249 56h63l27-32h327l29 32h62" fill="none" stroke="#b3d6fa" stroke-width="3" opacity=".5"/>${monitor(344, 14, c.light, waveform)}${monitor(486, 14, '#ecb1e9', scope)}${monitor(584, 14, c.light, plan)}<g class="env-signal" stroke="#ffce8d" stroke-width="6"><path d="M268 24h24m407 0h24"/></g>`,
  (c) =>
    `<path d="M278 60h430m-413 0v10m395-10v10" stroke="#392e55" stroke-width="6"/>${lamp(658, c.light)}${monitor(335, 14, '#a8e6dc', waveform)}${monitor(430, 14, '#b7b5ff', plan)}<path d="M527 43h17v12h-17zm17 2h5v6h-5" fill="#ebadc9" stroke="#463755" stroke-width="2"/><circle cx="589" cy="31" r="15" fill="#e7d4ed" stroke="#423657" stroke-width="3"/><path d="M589 20v12l7 3" stroke="#755b8d" fill="none" stroke-width="2"/>`,
  (c) =>
    `<path d="M281 58h434" stroke="#27445d" stroke-width="8"/>${monitor(297, 13, c.light, plan)}${monitor(388, 13, '#a9dbfb', scope)}${monitor(479, 13, c.light, waveform)}${monitor(570, 13, '#a9dbfb', plan)}<path d="M674 28h27v17h-27zm27 4 13-5v19l-13-5z" fill="#b1d9e6" stroke="#244863" stroke-width="2"/>`,
  (c) =>
    `<path d="M290 65V38a40 40 0 0 1 80 0v27m215 0V38a40 40 0 0 1 80 0v27" fill="#a67579" stroke="#d7a673" stroke-width="5"/><path d="M315 64V37a15 15 0 0 1 30 0v27m265 0V37a15 15 0 0 1 30 0v27" fill="#534059" stroke="#e7be8a" stroke-width="3"/><circle cx="477" cy="34" r="28" fill="#a79bae" stroke="#f3ca87" stroke-width="4"/><circle cx="477" cy="34" r="17" fill="#5a4a68" stroke="#f3ca87" stroke-width="2"/><path d="M461 34h32m-16-16v32m-11-27 22 22m0-22-22 22" stroke="#f6d899" stroke-width="3"/>${star(409, 28, c.light)}${star(546, 45, c.light)}`,
  (c) =>
    `<path d="M268 56h44V21h364v32h67" fill="none" stroke="#30565a" stroke-width="13"/><path d="M268 53h44V18h364v32h67" fill="none" stroke="#93c5aa" stroke-width="4"/>${gear(372, 38, 20, c.light)}${gear(414, 49, 14, '#9bdad0')}${gauge(503, 40, c.light)}${gauge(548, 40, '#a7e8c8')}${monitor(589, 17, '#b9edb5', waveform)}`,
  (c) =>
    `<path d="M285 65V23h52v42m86 0V23h52v42m86 0V23h52v42" fill="none" stroke="#a4a6cb" stroke-width="8"/><path d="M286 51h49m88 0h52m86 0h52" stroke="#303c61" stroke-width="7"/><g class="env-signal">${dot(311, 29, c.light, 5)}${dot(449, 29, '#a8e9da', 5)}${dot(587, 29, c.light, 5)}</g><path d="M663 33h50m-15-11 16 11-16 11" fill="none" stroke="#f7d49c" stroke-width="4" stroke-linecap="round"/>`,
  (c) =>
    `${monitor(292, 15, c.light, waveform)}${monitor(383, 15, '#a6e1f9', plan)}${gauge(508, 33, c.light)}${gauge(549, 33, '#a6e1f9')}<path d="M595 18h102v33H595z" fill="#24495e" stroke="#78a7b5" stroke-width="2"/><path d="M610 36h12m11 0h12m11 0h12m11 0h9" stroke="#c3e7ad" stroke-width="7" stroke-linecap="round" class="env-signal"/>`,
  (c) =>
    `<path d="M263 21h470" stroke="#d1a58d" stroke-width="4"/><path d="M451 20v38m117-38v38m-117 1h117" stroke="#463958" stroke-width="4"/>${gear(325, 36, 23, c.light)}${gear(373, 48, 18, '#efaa96')}${gear(450, 42, 17, '#e4c5a2')}${gear(568, 42, 17, '#e4c5a2')}${gear(704, 38, 24, c.light)}`,
  (c) =>
    `<path d="M263 60h473" stroke="#999bca" stroke-width="3"/><path d="M454 59V24q25-38 50 0v35Z" fill="#292f61" stroke="#9f9acb" stroke-width="3"/><path d="M481 19a12 12 0 1 0 8 19 13 13 0 0 1-8-19Z" fill="${c.light}"/><path d="M458 56L410 112h206L500 56Z" fill="#d4e6ff" opacity=".17"/><path d="M301 56V27h70v29m224 0V27h70v29" fill="#6578a3" stroke="#b8acd4" stroke-width="2"/><path d="m322 37 8-7h12l9 7-15 14z" fill="#c8b3ec"/><path d="M617 46q12-7 20-16l10 15z" fill="#ffda94"/>${star(517, 26, c.light)}${star(684, 22, c.light)}`,
];

// Low-contrast markings read as paint beneath the arm, even at phone scale.
const floorGraphics = [
  '<path d="M52 146h162v74H52zm0 37h162m-133-37v74m105-74v74M520 446h180" stroke-dasharray="10 8"/>',
  '<path d="M30 315h137l38-38h81m199 132h101l24 24h141M40 330h130m475 119h98"/>',
  '<path d="M40 126h134v224H40zm11 12h112v200H51zm15 16h82m-82 169h82" stroke-dasharray="4 6"/>',
  '<path d="M37 265h110m-110 12h89m531 155h85m-66-16h66M47 136v28m0-28h28m639 120v-28m0 28h-28"/>',
  '<path d="M382 399l51-30 51 30-51 30zm18 0 33-19 33 19-33 19zM57 129h108m450 325h110" stroke-width="4"/>',
  '<path d="M46 151h112l20 20v110l-20 20H46m484 143h111v-57h104m-96 11h96" stroke-width="4" stroke-dasharray="13 8"/>',
  '<path d="M209 365h353m-353 13h353m-251-40 27 13-27 13m28-26 27 13-27 13M613 412h94" stroke-width="3"/>',
  '<path d="M41 142h125l29 29h45v48m100 27h45v108h45m181 98h132M41 154h119m492 309h91"/>',
  '<path d="M50 250h170m-170 11h170m328 174h189m-189 11h189M58 250v11m20-11v11m20-11v11m20-11v11m20-11v11m20-11v11m20-11v11"/>',
  '<path d="M53 144h125v185H53zm10 10h105v165H63zm34 81 19-27 19 27-19 27zM625 457h110m-91 7h73"/>',
];

function environment(index) {
  const room = rooms[index];
  const [edge, middle, shade] = room.floor;
  const tiles = Array.from({ length: 10 }, (_, i) => `M${i * 86} 77L${(i - 4.5) * 104 + 390} 510`).join(
    ' ',
  );
  return `<defs>
    <linearGradient id="env-floor" x2="0" y2="1"><stop stop-color="${edge}"/><stop offset=".45" stop-color="${middle}"/><stop offset="1" stop-color="${shade}"/></linearGradient>
    <linearGradient id="env-wall" x2="0" y2="1"><stop stop-color="${room.ink}"/><stop offset="1" stop-color="${room.wall}"/></linearGradient>
    <radialGradient id="env-light"><stop stop-color="${room.light}" stop-opacity=".55"/><stop offset="1" stop-color="${room.light}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="780" height="510" fill="url(#env-floor)"/>
  <path d="${tiles} M0 132H780 M0 222H780 M0 345H780 M0 474H780" fill="none" stroke="${room.mark}" stroke-opacity=".13" stroke-width="2"/>
  <path d="M34 112V471H746V112 M50 462h138m394 0h148" fill="none" stroke="${room.mark}" stroke-opacity=".28" stroke-width="2"/>
  <g fill="none" stroke="${room.mark}" stroke-width="2.5" opacity=".26">${floorGraphics[index]}</g>
  <ellipse cx="90" cy="421" rx="126" ry="94" fill="url(#env-light)"/>
  <ellipse cx="670" cy="195" rx="176" ry="145" fill="url(#env-light)"/>
  <path d="M0 13H780V77H0Z" fill="${room.ink}" opacity=".19" transform="translate(0 6)"/>
  <path d="M0 0H780V73Q390 81 0 73Z" fill="url(#env-wall)"/>
  <path d="M0 73Q390 81 780 73" fill="none" stroke="${room.light}" stroke-opacity=".53" stroke-width="3"/>
  ${vignettes[index](room)}
  <g transform="translate(${index === 4 ? 26 : 35} 21)" font-family="ui-rounded,system-ui,sans-serif">
    <rect width="${index === 4 ? 138 : 202}" height="34" rx="9" fill="${room.ink}" stroke="${room.light}" stroke-opacity=".55" stroke-width="2"/>
    <rect x="5" y="5" width="24" height="24" rx="6" fill="${room.light}"/>
    <text x="17" y="21" text-anchor="middle" fill="${room.ink}" font-weight="900" font-size="12">${index + 1}</text>
    <text x="40" y="22" fill="#fff7ee" font-weight="800" font-size="${index === 4 ? 12 : 14}">${room.name}</text>
  </g>
  <g class="env-dust" opacity=".5">${dot(248, 103, room.mark, 1.7)}${dot(617, 94, room.mark, 1.4)}${dot(674, 467, room.mark, 2)}${dot(104, 300, room.mark, 1.6)}</g>`;
}

function obstacle({ x, y, w, h, type }, index) {
  const crate = type === 'crate';
  const [wood, woodShade, metal, metalShade] = rooms[index].material;
  const id = `env-material-${x}-${y}`;
  const rivets = [
    [8, 8],
    [w - 8, 8],
    [8, h - 8],
    [w - 8, h - 8],
  ]
    .map(([cx, cy]) => dot(cx, cy, '#fff5dd', 1.65))
    .join('');
  const face = crate
    ? `<rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="7" fill="${woodShade}" opacity=".4"/>
        <path d="M12 ${h - 13}L${w - 12} 13" stroke="${woodShade}" stroke-width="11"/>
        <path d="M12 ${h - 16}L${w - 15} 13" stroke="${wood}" stroke-width="3"/>
        <path d="M${w / 2} 9v${h - 18}" stroke="${woodShade}" stroke-width="2" opacity=".65"/>
        <path d="M16 ${h - 14}h${Math.min(22, w - 32)}" stroke="#fff0c8" stroke-width="3" stroke-dasharray="3 3"/>
        <rect x="13" y="13" width="24" height="11" rx="2" fill="#fff2cf"/>
        <path d="M17 16h8m-8 4h13" stroke="${woodShade}" stroke-width="1.4" opacity=".9"/>`
    : `<rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="7" fill="${metalShade}" opacity=".46"/>
        <path d="M11 ${h / 2}h${w - 22}" stroke="${metalShade}" stroke-width="3"/>
        <path d="M15 16h${Math.min(26, w - 33)}m-${Math.min(26, w - 33)} 5h${Math.min(26, w - 33)}" stroke="#e8eefb" stroke-width="2.5" opacity=".75"/>
        <rect x="${w - 21}" y="${h / 2 - 10}" width="8" height="21" rx="4" fill="#eef2f7" stroke="${metalShade}" stroke-width="1.6"/>
        <path d="M15 ${h - 16}h${Math.min(19, w - 31)}" stroke="#d2dded" stroke-width="3" stroke-dasharray="2 3" opacity=".6"/>`;
  return group(
    x,
    y,
    `<defs><linearGradient id="${id}" x2=".72" y2="1"><stop stop-color="${crate ? wood : metal}"/><stop offset="1" stop-color="${crate ? woodShade : metalShade}"/></linearGradient></defs>
    <rect x="5" y="7" width="${w}" height="${h}" rx="12" fill="#403657" opacity=".14"/>
    <rect width="${w}" height="${h}" rx="12" fill="url(#${id})" stroke="#423653" stroke-width="5"/>
    <rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="9" fill="none" stroke="#fff5e5" stroke-width="2" opacity=".5"/>
    ${face}<g opacity=".67">${rivets}</g>`,
  );
}

export { environment, obstacle };
