'use strict';

const vanityGlass = cleaningZone(ovalOutline(480,235,179,176),'glass');
const vanityFrame = cleaningZone(ovalOutline(480,235,205,202)+ovalOutline(480,235,181,178),'chrome');
const vanityTop = cleaningZone('M138 442Q160 427 203 424H760Q801 426 824 447L850 477Q862 491 831 497H133Q102 494 115 475Z','stone');

function vanityBottle(x,y,color,cap,width,height) {
  return `<g transform="translate(${x} ${y})">
    <ellipse cy="3" rx="${width*.67}" ry="7" fill="#76546c" opacity=".22"/>
    <rect x="${-width/2}" y="${-height}" width="${width}" height="${height}" rx="12" fill="${color}" stroke="#987689" stroke-width="2"/>
    <rect x="${-width*.23}" y="${-height-18}" width="${width*.46}" height="20" rx="3" fill="${cap}" stroke="#aa805d" stroke-width="2"/>
    <path d="M${-width*.32} ${-height+14}v${height-28}" stroke="#fff6f1" stroke-width="4" stroke-linecap="round" opacity=".72"/>
    <ellipse cy="${-height*.47}" rx="${width*.27}" ry="12" fill="#fff4dc" stroke="#dbafb4"/>
    <path d="M-6 ${-height*.47}q6 -8 12 0q-6 8 -12 0Z" fill="#b783a9"/>
  </g>`;
}

function vanityArtwork() {
  return `
  <defs>
    <linearGradient id="vanity-wall" x2="0" y2="1"><stop stop-color="#fae9eb"/><stop offset="1" stop-color="#d9aebd"/></linearGradient>
    <linearGradient id="vanity-gold"><stop stop-color="#a37248"/><stop offset=".23" stop-color="#ebc783"/><stop offset=".55" stop-color="#fff0b9"/><stop offset=".77" stop-color="#d5a36a"/><stop offset="1" stop-color="#926043"/></linearGradient>
    <linearGradient id="vanity-glass" x2=".35" y2="1"><stop stop-color="#edf8ed"/><stop offset=".55" stop-color="#b3cfd4"/><stop offset="1" stop-color="#8cb1bd"/></linearGradient>
    <linearGradient id="vanity-stone" x2="0" y2="1"><stop stop-color="#fff9ed"/><stop offset="1" stop-color="#ecd5d7"/></linearGradient>
    <linearGradient id="vanity-wood" x2="0" y2="1"><stop stop-color="#c48fa2"/><stop offset="1" stop-color="#8d5e79"/></linearGradient>
    <pattern id="vanity-paper" width="72" height="84" patternUnits="userSpaceOnUse">
      <path d="M36 15q-18 14 0 33q18-19 0-33Zm0 33v20m0-9q-14 0-17-10q13 0 17 10m0 0q14 0 17-10q-13 0-17 10" fill="none" stroke="#fff8ea" stroke-width="1.8" opacity=".45"/>
      <circle cx="4" cy="7" r="2" fill="#b17f9b" opacity=".35"/>
    </pattern>
    <clipPath id="vanity-reflection"><path d="${vanityGlass.outline}"/></clipPath>
    <filter id="vanity-shadow"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  <path d="M0 0H960V620H0Z" fill="url(#vanity-wall)"/>
  <path d="M0 0H960V464H0Z" fill="url(#vanity-paper)"/>
  <path d="M0 463H960V620H0Z" fill="#e4c3ae"/>
  <path d="M0 456H960M0 467H960" stroke="#fff1d9" stroke-width="6"/>
  <path d="M0 533H960M0 584H960M164 471L45 620M393 471L369 620M567 471L593 620M796 471L916 620" fill="none" stroke="#af8183" opacity=".48" stroke-width="3"/>
  <ellipse cx="483" cy="582" rx="402" ry="30" fill="#76546c" opacity=".3" filter="url(#vanity-shadow)"/>
  <ellipse cx="486" cy="246" rx="208" ry="204" fill="#875f78" opacity=".32" filter="url(#vanity-shadow)"/>
  <ellipse cx="480" cy="235" rx="205" ry="202" fill="url(#vanity-gold)" stroke="#a87756" stroke-width="3"/>
  <ellipse cx="480" cy="235" rx="196" ry="192" fill="none" stroke="#fff2c4" stroke-width="2" stroke-dasharray="1 5"/>
  <ellipse cx="480" cy="235" rx="186" ry="183" fill="none" stroke="#956348" stroke-width="3"/>
  <g clip-path="url(#vanity-reflection)">
    <path d="M295 55H665V415H295Z" fill="url(#vanity-glass)"/>
    <path d="M327 352V152a89 89 0 0 1 178 0v200Z" fill="#f9eed0" opacity=".72"/>
    <path d="M337 342V154a79 79 0 0 1 158 0v188Z" fill="#cce8df"/>
    <circle cx="451" cy="145" r="32" fill="#fff8d8"/>
    <path d="M334 277q58-84 107-40q31-44 57-26v137H334Z" fill="#9fc6b7"/>
    <path d="M329 318q65-80 110-29q29-43 59-28v89H329Z" fill="#7fafa9"/>
    <path d="M415 71v278M334 195h164" stroke="#f9f4dc" stroke-width="7" opacity=".85"/>
    <path d="M558 363q10-82 70-131m-54 77q44-5 54-28q-34-4-54 28m20-28q-20-20-14-43q27 14 14 43m21-23q30-3 43-26q-26-9-43 26" fill="#79a99c" stroke="#76a69f" stroke-width="3" opacity=".7"/>
    <path d="M290 300L477 49h38L318 337Zm126 104L654 83l13 16l-221 314Z" fill="#fff" opacity=".25"/>
    <path d="M295 317L493 48m-40 351L661 115" stroke="#ffffec" stroke-width="2" opacity=".55"/>
  </g>
  <path d="${vanityGlass.outline}" fill="none" stroke="#ffedba" stroke-width="3"/>
  <path d="M456 43q24-29 48 0q-24 13-48 0Zm8 382q16 27 32 0" fill="url(#vanity-gold)" stroke="#aa7452" stroke-width="2"/>
  <g transform="translate(108 208)">
    <path d="M0 18V6Q76-69 152 6v12Z" fill="#b88697" stroke="#9c657d" stroke-width="3"/>
    <path d="M12 14Q76-36 140 14V189H12Z" fill="#efc7cc" stroke="#ba879b" stroke-width="3"/>
    <path d="M12 90h128M50 24v165m46-165v165" stroke="#faf0de" stroke-width="4" opacity=".6"/>
    <path d="M-6 184H158v13H-6Z" fill="#bd8798"/>
  </g>
  <g transform="translate(773 136)" stroke-linejoin="round">
    <path d="M31-45q22 17 0 35q-22-18 0-35" fill="url(#vanity-gold)" stroke="#b68062" stroke-width="2"/>
    <path d="M31-10v31q0 31 25 36v49" fill="none" stroke="#b1856f" stroke-width="6"/>
    <path d="M27 111q29 13 58 0L73 71H39Z" fill="#ffe5b3" stroke="#bb9372" stroke-width="3"/>
    <path d="M40 82h32m-37 20h43" stroke="#fff4d2" opacity=".8" stroke-width="3"/>
  </g>
  <path d="M151 483H812L803 561Q738 584 684 557H278Q213 584 160 561Z" fill="url(#vanity-wood)" stroke="#8d5d76" stroke-width="4"/>
  <path d="M173 519l-10 75q8 8 18 0l28-74m542 0l28 74q10 8 18 0l-10-75" fill="#a67386" stroke="#885b74" stroke-width="4"/>
  <path d="M215 505H745V548H215Z" fill="#bb899e" stroke="#ebbdc3" stroke-width="3"/>
  <path d="M371 509v35m218-35v35" stroke="#93627a" stroke-width="3"/>
  <path d="M277 523q15 14 30 0m157 0q16 14 32 0m157 0q15 14 30 0" fill="none" stroke="url(#vanity-gold)" stroke-width="6" stroke-linecap="round"/>
  <path d="${vanityTop.outline}" fill="url(#vanity-stone)" stroke="#b9889f" stroke-width="4"/>
  <path d="M131 480q155-21 219-4q85 18 161-8q76-23 144-15m-370-5q43 21 99 11q49-11 81-7m190 22q78 7 156-13" fill="none" stroke="#c4a8b4" opacity=".65" stroke-width="2"/>
  ${vanityBottle(182,455,'#d89db3','url(#vanity-gold)',47,69)}
  ${vanityBottle(234,459,'#b7b9db','url(#vanity-gold)',37,48)}
  ${vanityBottle(749,455,'#acd0bd','url(#vanity-gold)',50,73)}
  ${vanityBottle(798,462,'#e5a6a6','url(#vanity-gold)',31,49)}
  <g transform="translate(682 467)">
    <ellipse rx="37" ry="8" fill="#9e7487" opacity=".32"/>
    <path d="M-34-4q34 16 68 0v-11h-68Z" fill="#b783a4" stroke="#90617f" stroke-width="2"/>
    <ellipse cy="-15" rx="34" ry="10" fill="#e2a8bd" stroke="#fff2dc" stroke-width="2"/>
    <ellipse cy="-15" rx="22" ry="5" fill="#eac2c5"/>
  </g>
  ${polishGlints([[618,130,15],[315,257,11],[532,319,9],[586,456,8]])}`;
}

function paintVanityDirt(ctx, random, kind) {
  const [dark,light] = {
    powder: ['#8d6278','#fff0e5'],
    residue: ['#695238','#dec48e'],
    print: ['#345e66','#f2e9c6'],
    streak: ['#496c73','#f1f9e8']
  }[kind];
  const oil = kind === 'print' || kind === 'streak';
  const base = ctx.createRadialGradient(-.18,-.12,.04,0,0,1);
  base.addColorStop(0,dark+(oil ? '96' : 'c2'));
  base.addColorStop(.55,dark+(oil ? '6a' : '95'));
  base.addColorStop(1,dark+'00');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(0,0,1,.92,0,0,Math.PI*2);
  ctx.fill();
  ctx.lineCap = 'round';

  if (kind === 'print') {
    for (let i=0;i<10;i++) {
      const r = .89-i*.071;
      const start = -.89+random()*.96;
      ctx.strokeStyle = i%3 === 0 ? light+'b4' : dark+'9e';
      ctx.lineWidth = .019+random()*.017;
      ctx.beginPath();
      ctx.ellipse(-.12+i*.012,.08,r,r*.81,-.08,start,Math.PI*(1.01+random()*.43));
      ctx.stroke();
    }
  } else if (kind === 'streak') {
    for (let i=0;i<11;i++) {
      const y = (i-5)*.122;
      const start = -.88+random()*.32;
      const end = .88-random()*.38;
      ctx.strokeStyle = i%3 ? light+'b6' : dark+'8f';
      ctx.lineWidth = .034+random()*.037;
      ctx.beginPath();
      ctx.moveTo(start,y+.13);
      ctx.bezierCurveTo(start*.47,y-.24,end*.45,y-.15,end,y);
      ctx.stroke();
    }
  } else {
    for (let i=0;i<150;i++) {
      const angle = random()*Math.PI*2;
      const radius = Math.pow(random(),.76);
      const x = Math.cos(angle)*radius, y = Math.sin(angle)*radius;
      const size = .009+random()*.04;
      ctx.fillStyle = i%3 ? light+'b0' : dark+'b8';
      ctx.beginPath();
      ctx.ellipse(x,y,size,size*(.52+random()),angle,0,Math.PI*2);
      ctx.fill();
    }
  }
}

function vanityDirt(settings, zone, marks) {
  return dirtLayer(settings,zone,marks,paintVanityDirt);
}

const vanityLevel = {
  dirtVersion: 2, idleHints: true,
  artwork: vanityArtwork, seed: 15931, saveKey: 'familyArcadeVanityMirrorProgress1',
  description: 'Brush away powder, soften fingerprints and reveal the garden reflected in the mirror.',
  finishTitle: 'A mirror full of light!',
  finishMessage: 'The glass is clear, and the gold frame shines around the garden reflection.',
  notes: {spray:'Softens fingerprints',sponge:'Wipes and polishes glass',brush:'Lifts powder and residue'},
  audioMaterial: zoneMaterial([vanityGlass,vanityFrame,vanityTop],'dust'),
  layers: [
    vanityDirt({id:'powder',label:'Powder dust',color:'#aa8497',weight:.21,tool:'brush',action:'Brush the powder off the vanity top.'},vanityTop,
      [['powder',303,465,44,17],['powder',421,457,45,18],['powder',516,478,52,15],['powder',607,457,43,18]]),
    vanityDirt({id:'prints',label:'Fingerprints',color:'#718f9b',weight:.31,tool:'sponge',prepare:'spray',action:'Foam the cloudy fingerprints, then wipe with the sponge.'},vanityGlass,
      [['print',359,214,32,42,-.5],['print',419,257,28,38,-.45],['print',534,173,35,43,.5],['print',575,225,31,37,.38],['print',500,303,42,35,-.3]]),
    vanityDirt({id:'frame',label:'Frame residue',color:'#aa8351',weight:.22,tool:'brush',action:'Trace the darker patches along the gold rim with the brush.'},vanityFrame,
      [['residue',333,103,34,15,-.85],['residue',474,40,42,13],['residue',625,101,34,15,.85],['residue',676,231,34,13,1.56],['residue',380,396,32,13,.55],['residue',290,274,40,13,1.35]]),
    vanityDirt({id:'streaks',label:'Glass streaks',color:'#8aa5ac',weight:.26,tool:'sponge',after:['prints'],action:'Follow the pale diagonal streaks with the sponge to polish the glass.'},vanityGlass,
      [['streak',405,162,63,14,-.77],['streak',445,213,72,15,-.77],['streak',541,264,78,17,-.77],['streak',466,337,65,16,-.77]])
  ]
};
