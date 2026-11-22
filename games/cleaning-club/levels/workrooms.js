'use strict';

const workroomDeposits = {
  grease: ['#6c451d','#d5a648',.84],
  sauce: ['#8c3221','#df8051',.90],
  water: ['#456971','#f6e3b5',.65],
  grout: ['#484630','#b8ae7c',.87],
  mud: ['#60432d','#b59266',.92],
  paw: ['#62442f','#ae9069',.84],
  fur: ['#765747','#ffe5b2',.75],
  soap: ['#6c8179','#fff1d1',.69],
  coral: ['#9e3f49','#eb8b73',.93],
  teal: ['#296469','#79b5a5',.91],
  violet: ['#64517e','#c39ccb',.90],
  glue: ['#8d7955','#fff0bb',.79],
  shavings: ['#654834','#e6bc7b',.83],
  soil: ['#6f5137','#e1c08d',.72],
  icing: ['#aa496a','#ffd4bb',.85],
  crumbs: ['#885232','#f0bb75',.67],
  fingerprint: ['#4d7580','#f6f5db',.62],
  sugar: ['#a47b42','#fff2cf',.70],
  mineral: ['#7c829d','#fff6e9',.80],
  tarnish: ['#69543b','#d7b879',.80]
};

function paintWorkroomDeposit(ctx, random, kind) {
  const [base, edge, opacity] = workroomDeposits[kind];
  const phase = random()*Math.PI*2;
  const fog = ctx.createRadialGradient(-.24,-.18,.04,0,0,1);
  fog.addColorStop(0,base);
  fog.addColorStop(.52,base+'e5');
  fog.addColorStop(.83,base+'9b');
  fog.addColorStop(1,base+'00');
  ctx.globalAlpha = opacity;
  ctx.fillStyle = fog;

  if (kind === 'paw') {
    const pads = [[-.03,.36,.49,.39],[-.63,-.21,.18,.24],[-.24,-.52,.20,.27],[.19,-.54,.19,.28],[.58,-.25,.18,.23]];
    for (const [x,y,rx,ry] of pads) {
      ctx.beginPath();
      ctx.ellipse(x,y,rx,ry,x*.4,0,Math.PI*2);
      ctx.fill();
    }
    return;
  }

  ctx.beginPath();
  for (let i=0;i<=44;i++) {
    const theta=i*Math.PI/22;
    const radius=.92+.125*Math.cos(theta*5+phase)+.065*Math.sin(theta*11-phase);
    const x=Math.cos(theta)*radius, y=Math.sin(theta)*radius;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  if (kind!=='water') ctx.fill();
  ctx.clip();
  ctx.lineCap='round';
  for (let i=0;i<115;i++) {
    const theta=random()*Math.PI*2;
    const radius=Math.pow(random(),.76);
    const x=Math.cos(theta)*radius, y=Math.sin(theta)*radius;
    const size=.012+random()*.044;
    ctx.globalAlpha=.26+random()*.56;
    ctx.strokeStyle=i%4 ? edge : base;
    ctx.fillStyle=ctx.strokeStyle;
    ctx.beginPath();
    if (kind==='fur' || kind==='shavings') {
      ctx.lineWidth=size*.45;
      ctx.moveTo(x,y);
      ctx.quadraticCurveTo(x+size*2,y-size*2,x+size*3,y+size*.65);
      ctx.stroke();
    } else {
      ctx.ellipse(x,y,size,size*(.57+random()),theta,0,Math.PI*2);
      ctx.fill();
    }
  }
  if (kind === 'mineral' || kind === 'icing') {
    // Crystalline streaks follow gravity; icing catches light along the fold.
    const count = kind === 'mineral' ? 11 : 4;
    for (let i=0;i<count;i++) {
      const offset = (i-(count-1)/2)*(.98/count);
      ctx.globalAlpha = .32+random()*.39;
      ctx.strokeStyle = edge;
      ctx.lineWidth = .028+random()*.047;
      ctx.beginPath();
      if (kind === 'mineral') {
        ctx.moveTo(offset,-.77+random()*.37);
        ctx.bezierCurveTo(offset+.12,-.28,offset-.07,.21,offset+.08,.59+random()*.24);
      } else {
        ctx.moveTo(-.71,offset+.12);
        ctx.bezierCurveTo(-.4,offset-.35,.28,offset+.27,.71,offset-.13);
      }
      ctx.stroke();
    }
  }
  if (kind === 'fingerprint') {
    for (let i=0;i<10;i++) {
      const radius = .92-i*.077;
      ctx.globalAlpha = .36+random()*.4;
      ctx.strokeStyle = i%4 ? edge : base;
      ctx.lineWidth = .017+random()*.022;
      ctx.beginPath();
      ctx.ellipse(-.09+i*.009,.045,radius,radius*.78,-.17,-.86+random()*.9,3.4+random()*.68);
      ctx.stroke();
    }
  }
  if (['water','grease','glue','soap','sugar'].includes(kind)) {
    for (let i=0;i<5;i++) {
      ctx.globalAlpha=.40+random()*.43;
      ctx.strokeStyle=i%2 ? base : edge;
      ctx.lineWidth=.045+random()*.06;
      const radius=.90-i*.115;
      ctx.beginPath();
      ctx.ellipse(-.03,-.03,radius,radius*.81,-.1,-.4+random()*.9,3.3+random()*2);
      ctx.stroke();
    }
  }
}

function paintRaisedMud(ctx, random) {
  ctx.beginPath();
  ctx.ellipse(0,0,.93,.86,0,0,Math.PI*2);
  ctx.clip();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#4f3725a3';
  ctx.lineWidth = .105;
  ctx.beginPath();
  ctx.moveTo(-.72,.30);
  ctx.bezierCurveTo(-.43,.79,.29,.89,.75,.29);
  ctx.stroke();
  for (let i=0;i<22;i++) {
    const theta = random()*Math.PI*2;
    const radius = .28+random()*.51;
    const x = Math.cos(theta)*radius, y = Math.sin(theta)*radius;
    const grain = .024+random()*.04;
    ctx.fillStyle = i%3 ? '#dabb835e' : '#4d332771';
    ctx.beginPath();
    ctx.ellipse(x,y,grain,grain*1.38,.37,0,Math.PI*2);
    ctx.fill();
  }
}

function workroomDirt(details, zone, marks) {
  const layer = dirtLayer(details,zone,marks,paintWorkroomDeposit);
  return details.crusted ? thickenDirt(layer,.43,surfaceDirt(zone,marks,paintRaisedMud)) : layer;
}

const kitchenStove = cleaningZone('M113 303H453Q460 304 462 315L479 387Q480 394 469 395H91Q81 394 82 385Z','chrome');
const kitchenCounter = cleaningZone('M90 289H857L912 405Q911 418 889 420H66Q40 418 41 403Z M113 302H453Q460 302 463 313L482 389Q482 396 470 398H91Q79 397 80 386Z M519 305H824L864 387L860 397H502L495 388Z','porcelain');
const kitchenSink = cleaningZone('M519 308H821Q832 309 837 324L862 385Q863 393 849 393H510Q498 393 500 384Z','chrome');
const kitchenTiles = cleaningZone('M22 178H903V194H22Z M22 241H904V258H22Z M301 197H314V240H301Z M510 197H524V240H510Z','grout');

const kitchenLevel = {
  artwork: () => polishGlints([[433,375,9],[784,376,12],[571,331,7]]),
  dirtVersion:3, idleHints:true, seed:51972, saveKey:'familyArcadeKitchenSparkleProgress1',
  description:'Lift stovetop grease, work the tile seams and polish the sink.',
  finishTitle:'Kitchen sparkling!',
  finishMessage:'The stovetop gleams and the sink is ready for the next recipe.',
  notes:{spray:'Loosens thick grease',sponge:'Wipes and polishes',brush:'Scrubs sauce and grout'},
  audioMaterial:zoneMaterial([kitchenStove,kitchenSink,kitchenCounter,kitchenTiles],'dust'),
  layers:[
    workroomDirt({id:'grease',effectKind:'grease',label:'Stovetop grease',color:'#a07533',weight:.34,tool:'sponge',prepare:'spray',action:'Foam the amber grease on the stovetop, then wipe through it.'},kitchenStove,
      [['grease',169,350,47,20,.12],['grease',255,372,51,15,-.12],['grease',361,350,49,22,.28],['grease',421,373,32,13,-.06]]),
    workroomDirt({id:'sauce',label:'Dried sauce',color:'#ac4832',weight:.20,tool:'brush',action:'Brush the baked-on reddish drops from the ceramic countertop.'},kitchenCounter,
      [['sauce',105,405,28,10],['sauce',311,406,34,10,.13],['sauce',474,302,20,9,.08],['sauce',482,400,26,12,-.27]]),
    workroomDirt({id:'grout',label:'Tile grime',color:'#716141',weight:.22,tool:'brush',action:'Trace the dark buildup along the tile seams.'},kitchenTiles,
      [['grout',121,186,45,7],['grout',293,186,47,6],['grout',430,249,50,7],['grout',775,249,49,7],['grout',307,222,7,15]]),
    workroomDirt({id:'water',label:'Sink water marks',color:'#778b8c',weight:.24,tool:'sponge',action:'Glide the sponge around the sink lip and across the cloudy rings.'},kitchenSink,
      [['water',534,345,23,19,-.45],['water',623,371,45,15],['water',725,346,35,20,.48],['water',810,372,32,15,-.32]])
  ]
};

const puppyBasin = cleaningZone('M132 293Q129 254 221 248H744Q819 250 834 290L806 447Q794 493 749 509H230Q177 501 162 439Z','porcelain');
const puppyFloor = cleaningZone('M0 514H960V620H0Z M236 514H725L754 597H205Z','stone');
const puppyEdges = cleaningZone('M78 339H145V467H78Z M829 350H907V476H829Z M153 493H195V553H153Z M782 498H825V554H782Z','grout');

const puppyLevel = {
  artwork: () => `
    <defs>
      <radialGradient id="puppy-tilt-edge"><stop offset=".69" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
      <mask id="puppy-head" maskUnits="userSpaceOnUse" x="640" y="92" width="244" height="174">
        <ellipse cx="762" cy="179" rx="122" ry="86" fill="url(#puppy-tilt-edge)"/>
      </mask>
    </defs>
    <g class="polish-glints" mask="url(#puppy-head)">
      <image class="puppy-celebration" width="960" height="620"/>
    </g>
    ${polishGlints([[377,329,8],[738,350,9]])}`,
  dirtVersion:4, idleHints:true, seed:60391, saveKey:'familyArcadePuppySpaProgress1',
  description:'Wipe muddy tracks, brush the washing station, and rinse away the soap film.',
  finishTitle:'A happy, clean puppy!',
  finishMessage:'The basin is bright again. Look at that happy little head tilt!',
  notes:{spray:'Softens cloudy soap',sponge:'Wipes muddy paw prints',brush:'Lifts mud and fur'},
  audioMaterial:zoneMaterial([puppyBasin,puppyFloor,puppyEdges],'dust'),
  layers:[
    workroomDirt({id:'paws',label:'Muddy paw prints',color:'#926344',weight:.24,tool:'sponge',action:'Wipe the puppy’s muddy tracks across the tiled floor.'},puppyFloor,
      [['paw',99,581,25,24,-.38],['paw',164,544,25,23,.21],['paw',169,595,23,20,-.24],['paw',839,548,26,25,.16],['paw',899,594,25,20,-.44]]),
    workroomDirt({id:'mud',effectKind:'mud',crusted:true,label:'Thick basin mud',color:'#8e654c',weight:.31,tool:'brush',action:'Brush the thicker mud off the front of the wash basin.'},puppyBasin,
      [['mud',263,388,47,15,.22],['mud',341,419,48,15,-.19],['mud',450,447,53,19,.06],['mud',601,416,46,19,-.09],['mud',727,451,46,14,-.38]]),
    workroomDirt({id:'fur',effectKind:'fiber',label:'Loose fur and dust',color:'#b99672',weight:.20,tool:'brush',action:'Brush the tufts caught along the outside edges.'},puppyEdges,
      [['fur',115,365,24,15,.8],['fur',125,452,23,11,-.2],['fur',179,516,17,15,.48],['fur',864,397,28,15,-.44],['fur',802,526,16,12,-.4]]),
    workroomDirt({id:'soap',label:'Cloudy soap film',color:'#b0a58b',weight:.25,tool:'sponge',prepare:'spray',action:'Soften the cloudy soap with foam, then wipe along the basin lip.'},puppyBasin,
      [['soap',281,313,52,10,.14],['soap',405,323,54,11],['soap',549,319,51,11,-.12],['soap',690,318,55,11,-.12]])
  ]
};

const studioWood = cleaningZone('M112 308H847L898 491Q903 515 877 521H83Q57 515 61 491Z M590 353L810 347L844 458L616 474Z','wood');
const studioJarEdge = cleaningZone('M103 319H430L442 366H93Z','wood');

const artStudioLevel = {
  artwork: () => polishGlints([[262,413,11],[499,453,8],[545,341,7]]),
  dirtVersion:3, idleHints:true, seed:71503, saveKey:'familyArcadeArtStudioProgress1',
  description:'Soften dried paint, sweep away pencil shavings and wipe the worktable.',
  finishTitle:'Ready to make art!',
  finishMessage:'The wood grain shows again, and there’s room for the next masterpiece.',
  notes:{spray:'Softens dried paint',sponge:'Wipes pigment and glue',brush:'Lifts flakes and shavings'},
  audioMaterial:zoneMaterial([studioWood,studioJarEdge],'dust'),
  layers:[
    workroomDirt({id:'paint',effectKind:'paint',label:'Dried paint',color:'#a75765',weight:.30,tool:'brush',prepare:'spray',sampleResidue:true,action:'Foam the raised paint patches, then brush away the softened flakes.'},studioWood,
      [['coral',265,374,47,18,-.2],['teal',404,404,48,19,.23],['violet',536,369,40,15,-.38]]),
    workroomDirt({id:'pigment',effectKind:'paint',label:'Paint smears',color:'#ad626e',weight:.24,tool:'sponge',sampleResidue:true,action:'Sponge away the thin coloured smears on the front of the table.'},studioWood,
      [['teal',206,460,47,16,-.25],['coral',352,472,50,14,.16],['violet',489,474,44,15,-.18]]),
    workroomDirt({id:'glue',label:'Sticky glue',color:'#bda56f',weight:.18,tool:'sponge',action:'Wipe the pale glue rings from the table beside the paper.'},studioWood,
      [['glue',542,431,29,16,.4],['glue',741,488,41,13,-.18],['glue',832,485,27,11,.22]]),
    workroomDirt({id:'shavings',label:'Pencil shavings',color:'#a18263',weight:.16,tool:'brush',action:'Use the brush to gather the curls and dust.'},studioWood,
      [['shavings',137,424,32,17,.3],['shavings',607,483,37,14,-.22],['shavings',442,338,37,13,.05]]),
    workroomDirt({id:'jars',label:'Marks by the jars',color:'#a3696b',weight:.12,tool:'brush',sampleResidue:true,action:'Brush the small paint crumbs just in front of the jars.'},studioJarEdge,
      [['violet',167,345,26,9],['coral',231,344,28,9,.14],['teal',325,349,32,10,-.16]])
  ]
};
