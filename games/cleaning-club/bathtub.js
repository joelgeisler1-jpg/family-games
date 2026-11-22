'use strict';

const tubBowl = 'M143 321C152 273 274 255 472 254C661 253 797 270 819 310C797 356 682 384 477 390C294 391 175 369 143 321Z';
const tubApron = 'M106 329C141 378 301 401 482 399C669 397 809 371 850 327L813 470C793 537 695 561 475 564C261 565 156 538 135 471Z';
const tapPipe = 'M700 285V196C700 147 641 147 641 190V214';

function bathtubArtwork() {
  return `
  <defs>
    <linearGradient id="wall" x2=".85" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#fbefe2"/><stop offset="1" stop-color="#eacabd"/></linearGradient>
    <linearGradient id="tile" x2="0" y2="1"><stop stop-color="#e0eee7"/><stop offset="1" stop-color="#a5c5be"/></linearGradient>
    <linearGradient id="floor" x2="0" y2="1"><stop stop-color="#d6b9a7"/><stop offset="1" stop-color="#e9cfb7"/></linearGradient>
    <linearGradient id="bowl" x2=".15" y2="1"><stop stop-color="#9ab4b5"/><stop offset=".27" stop-color="#d8e6e3"/><stop offset=".7" stop-color="#f8faf0"/><stop offset="1" stop-color="#b6d5cf"/></linearGradient>
    <linearGradient id="porcelain" x2=".17" y2="1"><stop stop-color="#fffbeb"/><stop offset=".31" stop-color="#f0f6ee"/><stop offset=".72" stop-color="#c5dcd3"/><stop offset="1" stop-color="#759f9a"/></linearGradient>
    <linearGradient id="lip" x2="0" y2="1"><stop stop-color="#fffff8"/><stop offset=".66" stop-color="#f9f7e5"/><stop offset="1" stop-color="#9ebbb4"/></linearGradient>
    <linearGradient id="chrome"><stop stop-color="#425b60"/><stop offset=".3" stop-color="#a8c4bd"/><stop offset=".46" stop-color="#fafff2"/><stop offset=".6" stop-color="#c9dbd1"/><stop offset=".79" stop-color="#748d90"/><stop offset="1" stop-color="#435b64"/></linearGradient>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#a9ccd4"/><stop offset="1" stop-color="#f8e9bf"/></linearGradient>
    <linearGradient id="glass-bottle"><stop stop-color="#659d85"/><stop offset=".35" stop-color="#d1e9be"/><stop offset=".65" stop-color="#9ebc90"/><stop offset="1" stop-color="#6b9b86"/></linearGradient>
    <linearGradient id="linen" x2="0" y2="1"><stop stop-color="#eebfae"/><stop offset="1" stop-color="#ba7e78"/></linearGradient>
    <radialGradient id="light"><stop stop-color="#fff8d8" stop-opacity=".45"/><stop offset="1" stop-color="#fff8d8" stop-opacity="0"/></radialGradient>
    <pattern id="tilework" width="104" height="62" patternUnits="userSpaceOnUse">
      <rect width="104" height="62" fill="#9eb5ac"/><rect x="2" y="2" width="100" height="58" rx="6" fill="url(#tile)" stroke="#eaf0df" stroke-width="1.5"/>
      <path d="M10 10H92M12 54H89" stroke="#fffdf2" opacity=".22" stroke-linecap="round"/>
    </pattern>
    <pattern id="matweave" width="8" height="7" patternUnits="userSpaceOnUse"><path d="M0 3H8M2 0v7" stroke="#ffeddd" opacity=".24"/></pattern>
    <clipPath id="window-view"><path d="M98 180V93a94 94 0 0 1 188 0v87Z"/></clipPath>
    <clipPath id="apron-light"><path d="${tubApron}"/></clipPath>
    <filter id="soft-shadow"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  <path fill="url(#wall)" d="M0 0H960V408H0Z"/>
  <path fill="url(#tilework)" d="M0 124H960V413H0Z"/>
  <path d="M0 125H960" stroke="#f7f1df" stroke-width="7"/>
  <path d="M0 406H960" stroke="#7a9c95" stroke-width="14"/>
  <path fill="url(#floor)" d="M0 414H960V620H0Z"/>
  <path d="M0 467H960M0 539H960M167 413L-61 620M375 413L316 620M593 413L660 620M797 413L1030 620" fill="none" stroke="#b18d80" stroke-opacity=".44" stroke-width="3"/>
  <ellipse cx="220" cy="211" rx="371" ry="242" fill="url(#light)"/>
  <path d="M85 181V94a108 108 0 0 1 216 0v87Z" fill="#7a7c70" opacity=".25" transform="translate(6 6)"/>
  <path d="M91 187V93a101 101 0 0 1 202 0v94Z" fill="#f7e7cf" stroke="#cfae95" stroke-width="5"/>
  <g clip-path="url(#window-view)">
    <rect x="98" width="188" height="183" fill="url(#sky)"/>
    <circle cx="230" cy="56" r="24" fill="#fff3d3"/>
    <path d="M93 141Q146 72 222 130T294 121V181H93Z" fill="#97b9a1"/>
    <path d="M89 156Q164 120 207 152T291 116V182H89Z" fill="#749e8d"/>
    <path d="M94 93H292M193 2V184" stroke="#fff3da" stroke-width="8"/>
    <path d="M111 129l39-59M115 151l56-82" stroke="#fffdf2" opacity=".31" stroke-width="5"/>
  </g>
  <rect x="75" y="179" width="235" height="14" rx="6" fill="#f1d6bc" stroke="#caa38d" stroke-width="2"/>
  <g fill="none" stroke-linecap="round">
    <path d="M365 140h172" stroke="#99765a" stroke-width="9"/>
    <path d="M362 133h177" stroke="#dec3a1" stroke-width="11"/>
    <path d="M371 132h159" stroke="#fff1cd" stroke-opacity=".68" stroke-width="2"/>
    <path d="M387 143v17m126-17v17" stroke="#aa9275" stroke-width="5"/>
  </g>
  <g transform="translate(386 133)">
    <path d="M0-28C-1-48-9-58-20-62M5-27Q5-57 23-66M8-28Q20-46 37-47" fill="none" stroke="#618968" stroke-width="3"/>
    <path d="M-13-53q-16-1-15-18q20 0 20 19M13-51q-3-18 14-23q6 16-14 23M22-43q9-14 23-9q-3 15-23 9" fill="#83a779" stroke="#75946a" stroke-width="1.5"/>
    <path d="M-10-34H35L29-4Q12 4-3-4Z" fill="#cf9f86" stroke="#ad7e6a" stroke-width="2"/>
    <path d="M-6-25h37M1-18l4 13m5-13L12-4m6-14v14m7-14l-2 13" stroke="#ffe3c6" opacity=".6" stroke-width="2"/>
  </g>
  <g transform="translate(471 132)">
    <path d="M-13-45q0-7 7-10v-9H6v9q8 4 8 10v38q0 6-7 6H-6q-7 0-7-6Z" fill="url(#glass-bottle)" stroke="#708f79" stroke-width="2"/>
    <rect x="-8" y="-69" width="16" height="9" rx="2" fill="#c8a173" stroke="#a5825e"/>
    <path d="M-7-48v34" stroke="#e9f4d8" stroke-width="2" stroke-linecap="round"/>
    <rect x="-9" y="-35" width="20" height="17" rx="3" fill="#faecd0" opacity=".89"/>
    <path d="M-2-24q-3-8 7-8q0 6-7 8Z" fill="#8fa17e"/>
    <rect x="25" y="-26" width="25" height="24" rx="6" fill="#dca699" stroke="#b98176" stroke-width="2"/>
    <rect x="23" y="-30" width="29" height="8" rx="4" fill="#f1c7a6" stroke="#b88e74"/>
    <path d="M30-16h15m-14 4h13" stroke="#fff1d4" stroke-width="2" stroke-linecap="round"/>
  </g>
  <path d="M756 91h162" stroke="#b8866d" stroke-width="9" stroke-linecap="round"/>
  <path d="M779 91h115l-3 117q-54 14-112 2Z" fill="url(#linen)" stroke="#ad7974" stroke-width="2"/>
  <path d="M793 94v115m14-113v112m65-112v109m9-110v109M782 184q54 7 108-3m-108 12q54 7 108-3" fill="none" stroke="#ffded0" stroke-opacity=".43" stroke-width="3"/>
  <path d="M807 211v8m10-8v8m10-8v8m10-8v8m10-8v8m10-9v8m10-9v8" stroke="#bc8c7d" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="481" cy="543" rx="392" ry="43" fill="#573d48" opacity=".28" filter="url(#soft-shadow)"/>
  <path d="M202 498Q224 501 258 503L244 552Q231 572 205 560L192 552Z M711 500Q742 500 765 493L776 548Q765 570 739 559Z" fill="url(#chrome)" stroke="#6c817e" stroke-width="3"/>
  <path d="${tubApron}" fill="url(#porcelain)" stroke="#799e98" stroke-width="4"/>
  <g clip-path="url(#apron-light)" fill="none">
    <path d="M134 388C341 467 698 454 834 379" stroke="#fcfff3" stroke-opacity=".64" stroke-width="15"/>
    <path d="M151 476C263 558 708 568 810 467" stroke="#709c94" stroke-opacity=".49" stroke-width="7"/>
    <path d="M175 455C254 527 706 545 785 442" stroke="#f9fff6" stroke-opacity=".53" stroke-width="3"/>
    <path d="M199 437C217 475 300 500 418 508" stroke="#fffdf4" stroke-opacity=".43" stroke-width="7" stroke-linecap="round"/>
    <path d="M552 504c72-2 142-14 178-30" stroke="#fffdf4" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>
  </g>
  <path d="M106 316C120 258 261 234 480 236C692 237 835 266 852 308C867 371 710 412 482 415C252 416 93 373 106 316Z" fill="url(#lip)" stroke="#87a9a2" stroke-width="4"/>
  <path d="${tubBowl}" fill="url(#bowl)" stroke="#9cb8b3" stroke-width="3"/>
  <path d="M171 316C202 284 345 267 502 269S746 281 794 309M159 340Q261 405 479 400T836 332" fill="none" stroke="#fffdf1" stroke-opacity=".83" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="504" cy="353" rx="27" ry="10" fill="#71928f" opacity=".36"/>
  <ellipse cx="503" cy="351" rx="20" ry="8" fill="url(#chrome)" stroke="#798f8c" stroke-width="2"/>
  <path d="M495 350h16m-13 4h10" stroke="#637a7c" stroke-width="1.8" stroke-linecap="round"/>
  <ellipse cx="700" cy="287" rx="37" ry="11" fill="#78928d" opacity=".54"/>
  <ellipse cx="700" cy="282" rx="29" ry="11" fill="url(#chrome)" stroke="#5c7d7c" stroke-width="2"/>
  <path d="${tapPipe}" fill="none" stroke="#526e71" stroke-width="31" stroke-linecap="round"/>
  <path d="${tapPipe}" fill="none" stroke="url(#chrome)" stroke-width="26" stroke-linecap="round"/>
  <path d="M693 269v-70c0-38-40-43-49-12" fill="none" stroke="#fffdf2" stroke-opacity=".68" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="641" cy="215" rx="13" ry="6" fill="#526c70"/>
  <path d="M634 214h14" stroke="#aec9c4" stroke-width="2" stroke-linecap="round"/>
  ${[675,752].map((x,i)=>`<g transform="translate(${x} 263)"><ellipse cy="13" rx="24" ry="8" fill="#819a94" opacity=".55"/><ellipse cy="9" rx="22" ry="8" fill="url(#chrome)"/><path d="M-8 8v-25h16V8Z" fill="url(#chrome)" stroke="#668181" stroke-width="2"/><rect x="-21" y="-21" width="42" height="12" rx="6" fill="url(#chrome)" stroke="#668181" stroke-width="2"/><ellipse cy="-16" rx="5" ry="3" fill="${i?'#b9d8dd':'#e5aca1'}"/></g>`).join('')}
  <g class="polish-glints" fill="#fffdf0" stroke="#fff7dc" stroke-linejoin="round">
    <path d="M696 163q2 12 13 14q-11 2-13 14q-2-12-13-14q11-2 13-14Z"/>
    <path d="M770 240q1 8 9 9q-8 1-9 9q-1-8-9-9q8-1 9-9Z" opacity=".8"/>
    <path d="M548 385q2 9 11 11q-9 2-11 11q-2-9-11-11q9-2 11-11Z" opacity=".85"/>
    <circle cx="715" cy="186" r="2" opacity=".7"/>
  </g>
  <path d="M781 577q50-21 141 2l28 38H761Z" fill="#c18e82" opacity=".5"/>
  <path d="M759 571q56-23 152-2l29 40H737Z" fill="#d9a79a" stroke="#ab7b73" stroke-width="2"/>
  <path d="M759 571q56-23 152-2l29 40H737Z" fill="url(#matweave)"/>
  <path d="M759 580q61-21 147-4l19 26H750Z" fill="none" stroke="#f8d5bc" stroke-width="2" stroke-dasharray="2 4"/>
  <g transform="translate(53 405)">
    <ellipse cx="13" cy="93" rx="56" ry="16" fill="#705757" opacity=".17"/>
    <path d="M-36 31Q10 11 55 32L43 91Q10 108-23 92Z" fill="#bd8b69" stroke="#8f6e60" stroke-width="3"/>
    <path d="M-31 45q42 18 81-1m-78 14q37 17 76-1m-73 15q34 15 70-1m-65 14q30 12 61-1" fill="none" stroke="#ebc899" stroke-width="3"/>
    <ellipse cx="10" cy="34" rx="44" ry="15" fill="#96765d" stroke="#ddbd93" stroke-width="4"/>
    <path d="M-25 31Q-13-9 6 4L20 17Q35 1 44 28Q9 49-25 31Z" fill="#f4e3c7" stroke="#bfa088" stroke-width="2"/>
    <path d="M-14 26q13 12 24-7m12 6q7 8 16 1" fill="none" stroke="#d3b197" stroke-width="2"/>
  </g>
  `;
}

function drawScum(ctx, random, surface, [x, y, rx, ry, angle]) {
  ctx.save();
  ctx.clip(new Path2D(surface));
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(rx, ry);
  const stain = ctx.createRadialGradient(-.2, -.18, .12, 0, 0, 1);
  stain.addColorStop(0, '#927958a6');
  stain.addColorStop(.64, '#b79c75aa');
  stain.addColorStop(1, '#a4835b00');
  ctx.fillStyle = stain;
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 74; i++) {
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * .95;
    ctx.fillStyle = i % 3 ? '#fff1d649' : '#765d4146';
    ctx.beginPath();
    ctx.ellipse(Math.cos(a)*r, Math.sin(a)*r, .007+random()*.044, .012+random()*.08, a, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGrout(ctx, random, [x, y, length, vertical]) {
  ctx.save();
  ctx.translate(x,y);
  if (vertical) ctx.rotate(Math.PI / 2);
  ctx.lineCap = 'round';
  for (let i = 2; i < length; i += 4) {
    ctx.strokeStyle = i % 3 ? '#535c3b8c' : '#5d644234';
    ctx.lineWidth = 2 + random() * 5;
    ctx.beginPath();
    ctx.moveTo(i, random()*4-2);
    ctx.quadraticCurveTo(i+4, random()*5-2.5, Math.min(length,i+8), random()*4-2);
    ctx.stroke();
  }
  ctx.restore();
}

function bathtubChromePath() {
  const metal = new Path2D();
  metal.moveTo(685, 282);
  metal.lineTo(685, 196);
  metal.bezierCurveTo(685, 166, 656, 166, 656, 190);
  metal.lineTo(656, 218);
  metal.lineTo(625, 218);
  metal.lineTo(625, 190);
  metal.bezierCurveTo(625, 123, 716, 127, 716, 196);
  metal.lineTo(716, 282);
  metal.closePath();
  metal.ellipse(700, 282, 29, 11, 0, 0, Math.PI * 2);
  for (const x of [675,752]) {
    metal.roundRect(x-21,242,42,12,6);
    metal.rect(x-8,247,16,25);
    metal.ellipse(x,272,22,8,0,0,Math.PI*2);
  }
  return metal;
}

function drawWatermarks(ctx, random) {
  ctx.save();
  ctx.clip(chromeSurface);
  ctx.fillStyle = '#8a81789a';
  ctx.fillRect(623,150,155,144);
  for (let i = 0; i < 88; i++) {
    const x = 627+random()*147;
    const y = 153+random()*140;
    const size = 2+random()*7;
    ctx.beginPath();
    ctx.ellipse(x,y,size,size*.71,random()*2,0,Math.PI*2);
    ctx.fillStyle = '#bcae97a0';
    ctx.fill();
    ctx.strokeStyle = '#fff2cf9a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawChalkScum(ctx, random, surface, [x,y,rx,ry,angle]) {
  ctx.save();
  ctx.clip(new Path2D(surface));
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.scale(rx,ry);
  // A thin, warm deposit around a denser chalk film catches light unevenly.
  const film = ctx.createRadialGradient(-.18,-.1,.06,0,0,1);
  film.addColorStop(0,'#eee6c9e8');
  film.addColorStop(.52,'#e6d8b2d5');
  film.addColorStop(.78,'#a18a619c');
  film.addColorStop(1,'#7d664600');
  ctx.fillStyle = film;
  ctx.beginPath();
  for (let i=0;i<=48;i++) {
    const theta = i*Math.PI/24;
    const edge = .92+.13*Math.sin(theta*5+x*.11)+.09*Math.cos(theta*9+y*.13);
    const px = Math.cos(theta)*edge, py = Math.sin(theta)*edge;
    if (i === 0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.clip();
  for (let i=0;i<175;i++) {
    const theta = random()*Math.PI*2;
    const radius = Math.pow(random(),.75);
    const px = Math.cos(theta)*radius, py = Math.sin(theta)*radius;
    const size = .009+random()*.032;
    const dense = Math.sin(px*11+py*4+x)+Math.cos(py*8-px*2+y) > -.15;
    ctx.fillStyle = dense ? (i%4 ? '#fff8e1a0' : '#ae926d82') : '#ae926d44';
    ctx.beginPath();
    ctx.ellipse(px,py,size,size*(.55+random()),theta,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGroutBuildup(ctx, random, seam) {
  drawGrout(ctx,random,seam);
  const [x,y,length,vertical] = seam;
  ctx.save();
  ctx.translate(x,y);
  if (vertical) ctx.rotate(Math.PI/2);
  ctx.lineCap = 'round';
  for (let i=2;i<length;i+=3) {
    const offset = (random()-.5)*6;
    ctx.strokeStyle = i%4 === 0 ? '#b4a778a3' : '#40432fbd';
    ctx.lineWidth = 1+random()*2.8;
    ctx.beginPath();
    ctx.moveTo(i,offset);
    ctx.lineTo(Math.min(length,i+1+random()*5),offset+(random()-.5)*1.7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTapDeposits(ctx, random) {
  ctx.save();
  ctx.clip(chromeSurface);
  const haze = ctx.createLinearGradient(624,0,773,0);
  haze.addColorStop(0,'#b5a48e97');
  haze.addColorStop(.48,'#a0958594');
  haze.addColorStop(.68,'#d9ceb3b2');
  haze.addColorStop(1,'#9a826db4');
  ctx.fillStyle = haze;
  ctx.fillRect(623,144,155,151);
  ctx.lineCap = 'round';
  // Water runs down the stem and collects around the tap collars.
  for (const [x,y,length] of [[632,183,29],[645,168,28],[696,178,46],[703,206,60],[712,212,54],[675,252,17],[752,253,16]]) {
    ctx.strokeStyle = '#f7e6c6be';
    ctx.lineWidth = 1.5+random()*1.6;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x-2,y+length*.53,x+.6,y+length);
    ctx.stroke();
    ctx.strokeStyle = '#856d549e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x+2,y+4);
    ctx.lineTo(x+2.4,y+length-2);
    ctx.stroke();
  }
  for (const [x,y,width,height] of [[700,283,25,6],[675,274,19,5],[752,274,18,5],[641,214,11,4]]) {
    ctx.strokeStyle = '#f5e6c8ce';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(x,y,width,height,-.02,.18,Math.PI*1.76);
    ctx.stroke();
  }
  for (let i=0;i<115;i++) {
    const x = 628+random()*147, y = 153+random()*136;
    const r = .55+random()*1.7;
    ctx.fillStyle = i%3 ? '#f4e6c3a0' : '#8c765a8f';
    ctx.beginPath();
    ctx.ellipse(x,y,r,r*.62,.42,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

const chromeSurface = bathtubChromePath();
const porcelainSurfaces = [new Path2D(tubBowl), new Path2D(tubApron)];

const scumPatches = [
  [tubBowl, [[203,333,44,15,.18],[289,358,56,14,.17],[421,372,65,11,.03],[568,363,58,17,-.08],[735,329,46,18,-.26],[315,281,70,12,-.1]]],
  [tubApron, [[204,433,50,22,.32],[326,475,67,23,.22],[486,454,71,21,-.1],[636,476,73,20,-.17],[772,421,48,27,-.55],[489,532,66,11,.01]]]
];
const groutSeams = [[10,248,91],[105,248,96],[209,248,103],[319,248,88],[416,248,82],[520,248,75],[108,186,45,true],[311,131,49,true],[416,186,59,true],[520,186,59,true],[568,186,43],[836,248,107],[936,250,64,true],[832,253,38,true],[8,310,91],[104,257,40,true]];

const scumRenderer = paint => (ctx, random) => {
  for (const [surface,patches] of scumPatches) {
    for (const patch of patches) paint(ctx,random,surface,patch);
  }
};
const groutRenderer = paint => (ctx, random) => {
  for (const seam of groutSeams) paint(ctx,random,seam);
};

const groutEffectPath = new Path2D();
for (const [x,y,length,vertical] of groutSeams) {
  groutEffectPath.rect(x-(vertical ? 7 : 0),y-(vertical ? 0 : 7),vertical ? 14 : length,vertical ? length : 14);
}
const tubEffectAreas = porcelainSurfaces.map(path => ({path,material:'porcelain'}));
const groutEffectArea = {path:groutEffectPath,material:'grout',rule:'nonzero'};
const chromeEffectArea = {path:chromeSurface,material:'chrome',rule:'nonzero'};

const bathtubLevel = {
  dirtVersion: 3, idleHints: true,
  audioMaterial(ctx, {x,y}) {
    if (ctx.isPointInPath(chromeSurface,x,y)) return 'chrome';
    if (porcelainSurfaces.some(path => ctx.isPointInPath(path,x,y))) return 'porcelain';
    return y < 413 ? 'grout' : 'dust';
  },
  seed: 4420,
  layers: [
    thickenDirt({
      id: 'scum', label: 'Soap scum', color: '#aa8866', weight: .48,
      tool: 'sponge', prepare: 'spray', action: 'Foam the chalky patches, then wipe with the sponge.',
      draw: scumRenderer(drawChalkScum), legacyDraw: scumRenderer(drawScum), effectAreas:tubEffectAreas
    },.86,(ctx,random) => {
      drawChalkScum(ctx,random,tubBowl,[248,351,58,11,.22]);
      drawChalkScum(ctx,random,tubBowl,[489,375,65,9,-.05]);
      drawChalkScum(ctx,random,tubApron,[566,473,73,13,-.09]);
      drawChalkScum(ctx,random,tubApron,[721,456,57,14,-.4]);
    }),
    thickenDirt({
      id: 'grout', label: 'Dirty grout', color: '#66734d', weight: .32,
      tool: 'brush', action: 'Follow the dark tile seams with the detail brush.',
      draw: groutRenderer(drawGroutBuildup), legacyDraw: groutRenderer(drawGrout), effectAreas:[groutEffectArea]
    },.74),
    thickenDirt({
      id: 'chrome', label: 'Water marks', color: '#798f91', weight: .20,
      tool: 'sponge', after: ['scum','grout'],
      action: 'Glide the sponge over both handles and the curved tap.',
      draw: drawTapDeposits, legacyDraw: drawWatermarks, effectAreas:[chromeEffectArea]
    },.64)
  ]
};
