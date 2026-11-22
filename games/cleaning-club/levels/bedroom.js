'use strict';

const bedsideLeft = 'M57 342Q60 328 85 324H230Q255 324 264 346L279 403Q285 420 262 427H65Q42 421 48 404Z';
const bedsideRight = 'M708 342Q717 325 739 324H882Q902 324 909 344L924 404Q931 424 908 427H706Q685 421 692 402Z';
const bedFoot = 'M260 490Q485 521 697 491L705 531Q707 550 685 557Q482 590 274 556Q253 551 254 533Z';
const quilt = 'M303 343Q484 320 668 344L709 476Q718 498 689 507Q493 535 268 501Q245 494 254 477Z';
const cushions = 'M317 278Q351 262 449 271Q472 276 472 292L473 331Q466 352 443 351L330 348Q309 346 308 329Z M497 292Q497 272 519 269L635 272Q653 279 654 295L661 329Q660 344 641 349L522 351Q504 346 499 330Z';
const bedroomTables = cleaningZone(bedsideLeft+bedsideRight,'wood');
const bedroomTimber = cleaningZone(bedFoot,'wood');
const bedroomFabric = cleaningZone(cushions+quilt,'fabric');

function nightstand(x) {
  return `<g transform="translate(${x} 0)">
    <path d="M58 414H268V527Q237 545 164 541Q90 544 58 526Z" fill="url(#bed-wood-side)" stroke="#986855" stroke-width="4"/>
    <path d="M66 521l-7 38m196-38l7 38" stroke="#86584e" stroke-width="10" stroke-linecap="round"/>
    <rect x="74" y="437" width="177" height="35" rx="8" fill="#e5ae89" stroke="#a96f57" stroke-width="3"/>
    <rect x="74" y="480" width="177" height="35" rx="8" fill="#d69875" stroke="#a96f57" stroke-width="3"/>
    <path d="M139 450q22 13 43 0m-43 42q22 13 43 0" fill="none" stroke="#ffe3aa" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}

function bedroomArtwork() {
  return `
  <defs>
    <linearGradient id="bed-wall" x2="0" y2="1"><stop stop-color="#f6e4d4"/><stop offset="1" stop-color="#deada9"/></linearGradient>
    <linearGradient id="bed-wood" x2=".13" y2="1"><stop stop-color="#f2d2a0"/><stop offset=".48" stop-color="#dda47c"/><stop offset="1" stop-color="#c18466"/></linearGradient>
    <linearGradient id="bed-wood-side" x2="0" y2="1"><stop stop-color="#dca880"/><stop offset="1" stop-color="#a16d5f"/></linearGradient>
    <linearGradient id="bed-quilt" x2=".2" y2="1"><stop stop-color="#b8bddb"/><stop offset="1" stop-color="#777dab"/></linearGradient>
    <linearGradient id="bed-curtain" x2="1" y2=".35"><stop stop-color="#b5adc9"/><stop offset=".45" stop-color="#dad0e2"/><stop offset="1" stop-color="#b39ebd"/></linearGradient>
    <radialGradient id="bed-lamp"><stop stop-color="#fff1c0" stop-opacity=".9"/><stop offset="1" stop-color="#fff1c0" stop-opacity="0"/></radialGradient>
    <pattern id="bed-grain" width="160" height="34" patternUnits="userSpaceOnUse">
      <path d="M-8 7Q42 1 79 7T169 6M-5 17q54 8 90-1t82 0m-174 12q46-9 83-2t91 0" fill="none" stroke="#a4755b" opacity=".37" stroke-width="1.4"/>
      <path d="M32 22q13-7 26 0q-13 6-26 0" fill="none" stroke="#9e7158" opacity=".43"/>
    </pattern>
    <pattern id="bed-stitch" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M-24 24L24-24M0 48L48 0m-24 72l48-48M0 0l48 48M-24 24l48 48M24-24l48 48" fill="none" stroke="#e3dff2" opacity=".45" stroke-width="1.4" stroke-dasharray="3 3"/>
      <path d="M24 19q4 5 0 10q-4-5 0-10Z" fill="#e3dff2" opacity=".6"/>
    </pattern>
    <filter id="bed-shadow"><feGaussianBlur stdDeviation="13"/></filter>
  </defs>
  <path d="M0 0H960V620H0Z" fill="url(#bed-wall)"/>
  <path d="M0 428H960V620H0Z" fill="#d6aa95"/>
  <path d="M0 428H960M0 440H960" stroke="#f4d4bd" stroke-width="7"/>
  <path d="M0 477H960M0 527H960M0 585H960M146 440L45 620M346 440L313 620M588 440L620 620M805 440L931 620" fill="none" stroke="#a57f83" stroke-width="3" opacity=".45"/>
  <circle cx="213" cy="234" r="152" fill="url(#bed-lamp)"/>
  <g transform="translate(58 58)">
    <rect width="247" height="173" rx="12" fill="#b3857f" stroke="#a47270" stroke-width="4"/>
    <rect x="12" y="12" width="223" height="145" rx="6" fill="#a4bccd"/>
    <circle cx="164" cy="48" r="22" fill="#fff4c8"/>
    <path d="M13 124q42-51 101-21q46-39 120-14v70H13Z" fill="#89b0a5"/>
    <path d="M13 138q47-33 93-10q69-36 128-20v51H13Z" fill="#6f9c97"/>
    <path d="M123 12v145M12 82h223" stroke="#f7e5cd" stroke-width="7"/>
    <path d="M-10-1H34Q25 77 57 151Q31 170 1 159Z M258-1h-44q9 78-23 152q26 19 56 8Z" fill="url(#bed-curtain)" stroke="#a891aa" stroke-width="3"/>
    <path d="M-12-4H260" stroke="#a77373" stroke-width="8" stroke-linecap="round"/>
    <path d="M6 116q15 7 35 0m166 0q18 8 35 0" fill="none" stroke="#f4d9a9" stroke-width="5"/>
  </g>
  <g transform="translate(631 71) rotate(5)">
    <rect width="135" height="104" rx="10" fill="#e6ba91" stroke="#a47b69" stroke-width="4"/>
    <rect x="10" y="10" width="115" height="84" rx="4" fill="#fbebd4"/>
    <path d="M31 77q41-55 75-31q-12 37-75 31" fill="#b9bccd"/>
    <path d="M43 70q25-26 48-18" fill="none" stroke="#f9f1db" stroke-width="3"/>
    <circle cx="53" cy="31" r="11" fill="#dab4b4"/>
  </g>
  <ellipse cx="487" cy="561" rx="432" ry="38" fill="#795764" opacity=".31" filter="url(#bed-shadow)"/>
  <ellipse cx="482" cy="555" rx="338" ry="53" fill="#d8a8b3" stroke="#edc5bc" stroke-width="8"/>
  <ellipse cx="482" cy="555" rx="316" ry="44" fill="none" stroke="#f9d9ce" stroke-width="3" stroke-dasharray="3 6"/>
  ${nightstand(0)}
  ${nightstand(645)}
  <path d="${bedsideLeft} ${bedsideRight}" fill="url(#bed-wood)" stroke="#a5765e" stroke-width="4"/>
  <path d="${bedsideLeft} ${bedsideRight}" fill="url(#bed-grain)"/>
  <path d="M296 461V264Q297 207 348 202Q480 167 620 202Q675 206 676 264v197Z" fill="url(#bed-wood-side)" stroke="#93645c" stroke-width="5"/>
  <path d="M313 274q0-46 43-58q125-31 253 0q48 12 49 58v140H313Z" fill="#dec0b9" stroke="#f1d2bd" stroke-width="4"/>
  <path d="M325 256q150-49 322 0M360 220v52m62-66v65m62-71v71m62-65v65m62-51v52" fill="none" stroke="#b98781" opacity=".55" stroke-width="2"/>
  <path d="M284 340q185-42 396 0l31 148q-4 31-43 36H287q-39-15-38-40Z" fill="#fff2dc" stroke="#bda4b5" stroke-width="4"/>
  <path d="${cushions}" fill="#e9c7d2" stroke="#b68fa9" stroke-width="3"/>
  <path d="M321 292q20-14 119-12m-116 51q51 14 127 4m59-43q40-15 125-9m-116 52q71 10 127-4" fill="none" stroke="#fff0ed" opacity=".88" stroke-width="3" stroke-linecap="round"/>
  <path d="${quilt}" fill="url(#bed-quilt)" stroke="#77779b" stroke-width="4"/>
  <path d="${quilt}" fill="url(#bed-stitch)"/>
  <path d="M289 371q188-32 389-3l11 23q-192-29-409 1Z" fill="#d5a9bf" stroke="#eac1cd" stroke-width="3"/>
  <path d="M267 486q217 38 426 2" fill="none" stroke="#e8def2" stroke-width="3" stroke-dasharray="3 4"/>
  <path d="M273 547v35m408-34v34" stroke="#93645c" stroke-width="14" stroke-linecap="round"/>
  <path d="${bedFoot}" fill="url(#bed-wood)" stroke="#a47560" stroke-width="4"/>
  <path d="${bedFoot}" fill="url(#bed-grain)"/>
  <path d="M282 516q194 32 393 0m-392 22q198 35 394-3" fill="none" stroke="#ffe0ae" stroke-width="3" opacity=".8"/>
  <g transform="translate(126 359)">
    <ellipse rx="41" ry="10" fill="#aa7964" opacity=".45"/>
    <ellipse cy="-4" rx="34" ry="8" fill="#b58b70" stroke="#f3d0a0" stroke-width="3"/>
    <path d="M0-8v-58" stroke="#b48870" stroke-width="7" stroke-linecap="round"/>
    <path d="M-36-55l13-56q23-13 47 0l13 56q-38 17-73 0Z" fill="#f6ddac" stroke="#b38a7e" stroke-width="3"/>
    <path d="M-22-106l-7 50m25-53v60m19-57l10 50" stroke="#fff1d1" stroke-width="3"/>
  </g>
  <g transform="translate(825 365)">
    <path d="M-32 2l4-14l63-6l2 15Z" fill="#a6adbe" stroke="#7e8298" stroke-width="2"/>
    <path d="M-29-13l8-14l55-4v13Z" fill="#c799aa" stroke="#956a86" stroke-width="2"/>
    <path d="M-22-17l50-4m-54 17l56-4" stroke="#fae8cf" stroke-width="2"/>
  </g>
  ${polishGlints([[216,388,10],[779,393,9],[594,527,12],[425,434,8]])}`;
}

const bedroomLint = [['dust',355,314,29,18],['dust',568,310,41,18],['dust',341,421,43,24],['dust',447,457,48,20],['dust',570,416,44,20],['dust',652,468,40,22]];

const bedroomBuildup = {
  dust: [bedroomTables,[['dust',113,407,37,14],['dust',830,407,31,15]]],
  rings: [bedroomTables,[['ring',157,401,32,17],['ring',792,401,34,18]]],
  marks: [bedroomTimber,[['grime',352,535,45,8,.18],['grime',565,540,45,8,-.13]]],
  lint: [bedroomFabric,[['lint',380,434,37,17,.2],['lint',610,436,40,16,-.1]]]
};

const bedroomLevel = {
  dirtVersion: 3, idleHints: true,
  artwork: bedroomArtwork, seed: 28683, saveKey: 'familyArcadeCosyBedroomProgress1',
  description: 'Lift timber dust, soften drink rings and brush the quilt and cushions.',
  finishTitle: 'Cosy and clean!',
  finishMessage: 'Warm timber grain shows through and the quilt is ready for a cosy evening.',
  notes: {spray:'Loosens drink rings',sponge:'Wipes the bedside tables',brush:'Cleans grooves and fabric'},
  audioMaterial: zoneMaterial([bedroomTimber,bedroomTables,bedroomFabric],'dust'),
  layers: [
    dirtLayer({id:'dust',label:'Timber dust',color:'#a58b78',weight:.28,tool:'sponge',action:'Wipe the dusty tops of both bedside tables with the sponge.'},bedroomTables,
      [['dust',86,392,35,22],['dust',206,374,51,22],['dust',229,406,32,15],['dust',737,368,39,21],['dust',862,388,45,21],['dust',906,412,22,12]],paintRoomDirt),
    dirtLayer({id:'rings',label:'Drink rings',color:'#ac765c',weight:.21,tool:'sponge',prepare:'spray',action:'Foam the drink rings on the tables, then sponge them away.'},bedroomTables,
      [['ring',156,399,29,16],['ring',791,400,31,17],['ring',877,353,22,13]],paintRoomDirt),
    dirtLayer({id:'marks',label:'Footboard grooves',color:'#9d7783',weight:.22,tool:'brush',action:'Use the detail brush along the wooden footboard grooves.'},bedroomTimber,
      [['smudge',301,527,37,12],['smudge',397,542,51,13],['smudge',521,541,48,12],['smudge',642,525,51,12]],paintRoomDirt),
    {
      ...dirtLayer({id:'lint',label:'Lint on fabric',color:'#978ba6',weight:.29,tool:'brush',action:'Brush the lint from the cushions and quilt.'},bedroomFabric,
        bedroomLint.map(([, ...geometry]) => ['lint',...geometry]),paintRoomDirt),
      legacyDraw: surfaceDirt(bedroomFabric,bedroomLint)
    }
  ].map(layer => {
    const [zone,marks] = bedroomBuildup[layer.id];
    return thickenDirt(layer,.69,surfaceDirt(zone,marks,paintRoomDirt));
  })
};
