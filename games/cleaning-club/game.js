
'use strict';
const $=id=>document.getElementById(id);
const W=960,H=620, scene=$('scene'), svg=$('sceneArt'), dirty=$('dirtCanvas'), ctx=dirty.getContext('2d',{willReadFrequently:true}), fx=$('fxCanvas'), fctx=fx.getContext('2d');
const levels=[
{title:'Bathtub Bliss',sub:'Soften the soap scum, brush the grout and polish the taps.',palette:['#d9f5f7','#bcdfe3','#b7edf1'],zones:[[480,390,280,130],[720,235,140,145],[250,280,130,150],[390,505,180,55]],emoji:'🛁'},
{title:'Vanity Mirror Magic',sub:'Wipe cloudy fingerprints from the beautiful vanity.',palette:['#f9e6ef','#e9cedd','#f4d9e9'],zones:[[475,220,170,180],[450,445,285,90],[245,305,130,90],[725,410,110,90]],emoji:'🪞'},
{title:'Cosy Bedroom Reset',sub:'Fresh sheets, polished furniture and soft cushions.',palette:['#fcebdc','#dabdb8','#ffe5ed'],zones:[[475,430,300,110],[730,350,120,130],[240,410,135,105],[510,240,150,90]],emoji:'🛏️'},
{title:'Rainbow Toy Room',sub:'Tidy the playroom and reveal its colourful treasures.',palette:['#e4edfc','#bcd7d3','#f7e6f0'],zones:[[470,410,300,110],[230,275,155,175],[735,310,165,165],[465,520,220,60]],emoji:'🧸'},
{title:'Kitchen Sparkle Party',sub:'Clear the counters, cooktop and kitchen sink.',palette:['#e8f1df','#c7d7c5','#f2f6ec'],zones:[[470,370,295,125],[710,460,155,110],[255,420,140,100],[540,215,170,85]],emoji:'🍽️'},
{title:'Puppy Spa Day',sub:'A warm bubble bath for a very happy pup.',palette:['#f2e8fb','#d6c6e0','#faf0ff'],zones:[[485,420,280,115],[690,345,135,115],[260,425,130,110],[470,245,150,90]],emoji:'🐶'},
{title:'Colourful Art Studio',sub:'Clean up paint splashes around the creative studio.',palette:['#fff0dd','#dfc2b6','#fcefe6'],zones:[[480,280,220,200],[300,430,140,110],[680,415,170,130],[460,515,180,70]],emoji:'🎨'},
{title:'Secret Garden Corner',sub:'Polish the shelves and bring the greenhouse to life.',palette:['#e2efdc','#c1d6ba','#f0f5e4'],zones:[[465,360,270,135],[700,265,145,145],[245,405,145,125],[530,525,175,65]],emoji:'🪴'},
{title:'Sweet Treat Café',sub:'Make the bakery counter deliciously spotless.',palette:['#ffe5ea','#d5bcb3','#fff2e5'],zones:[[485,400,315,115],[265,280,140,140],[700,270,140,150],[490,520,175,60]],emoji:'🧁'},
{title:'Crystal Palace Finale',sub:'Reveal a glittering palace fit for royalty.',palette:['#e7e6fc','#c3cee6','#e9e4ff'],zones:[[475,410,310,125],[255,295,135,165],[710,285,135,175],[490,520,220,65]],emoji:'💎'}
];
const S={level:0,unlocked:1,tool:'sponge',down:false,done:false,started:0,elapsed:0,previous:null,actionAt:0,layers:{},initial:{},progress:0,fx:[],animation:0,lastProgress:0,editing:0};
try{S.unlocked=Math.max(1,Math.min(10,Number(localStorage.getItem('familyArcadeCleaningUnlocked'))||1))}catch(e){}
const R=(x,y,w,h,c,r=0,stroke='',sw=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`;
const E=(x,y,rx,ry,c,stroke='',sw=1)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`;
const P=(d,c,stroke='',sw=1)=>`<path d="${d}" fill="${c}" ${stroke?`stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`:''}/>`;
const L=(x1,y1,x2,y2,c='#fff',sw=4)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
const T=(x,y,t,size=25,c='#574d6c',weight='bold')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="ui-rounded,system-ui,sans-serif" font-weight="${weight}" font-size="${size}" fill="${c}">${t}</text>`;
const sparkle=(x,y,c='#fff8d4')=>P(`M${x} ${y-14}L${x+4} ${y-4}L${x+14} ${y}L${x+4} ${y+4}L${x} ${y+14}L${x-4} ${y+4}L${x-14} ${y}L${x-4} ${y-4}Z`,c);
function plant(x,y,s=1){return `<g transform="translate(${x},${y}) scale(${s})">${P('M-17 -7Q-55 -69 -12 -111Q-25 -66 -5 -32Q-4 -102 41 -127Q15 -72 12 -31Q38 -78 65 -63Q44 -17 17 -8','#77b892','#599d83',3)}${P('M-26 -7L26 -7L19 43Q0 58 -19 43Z','#ca9390','#f5d9d0',4)}${E(0,-7,26,8,'#d7aa9d')}${L(0,-11,3,-90,'#6e9e78',3)}</g>`}
function framed(x,y,w,h,inner='#bde9f2'){return `<g>${R(x-10,y-10,w+20,h+20,'#ffffff',13)}${R(x,y,w,h,inner,7,'#d8c1a8',3)}${L(x+w/2,y,x+w/2,y+h,'#fff',8)}${L(x,y+h/2,x+w,y+h/2,'#fff',8)}${E(x+w*.22,y+h*.2,15,15,'#ffffff99')}</g>`}
function drawer(x,y,w,h,color='#e7babb'){return `${R(x,y,w,h,color,13,'#ffffff8c',3)}${L(x+10,y+h*.47,x+w-10,y+h*.47,'#fff9',4)}${E(x+w/2,y+h*.28,10,5,'#cf9b79')}${E(x+w/2,y+h*.73,10,5,'#cf9b79')}`}
function flower(x,y,s=1,c='#ffb5c5'){return `<g transform="translate(${x} ${y}) scale(${s})">${L(0,0,0,37,'#66a785',4)}${E(-10,22,12,5,'#76b993')}${E(9,29,11,5,'#76b993')}${[0,72,144,216,288].map(a=>E(Math.sin(a*Math.PI/180)*12,Math.cos(a*Math.PI/180)*12,10,13,c)).join('')}${E(0,0,7,7,'#ffdc7c')}</g>`}
function cup(x,y,c='#b9dce9',s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${R(-24,-26,48,46,c,7,'#ffffffab',3)}${P('M24 -18Q55 -19 47 7Q45 20 24 15','none',c,7)}${E(0,-26,25,6,'#fff8')}</g>`}
function leaves(x,y){return `<g>${L(x,y+26,x,y-24,'#69a57c',4)}${E(x-13,y-14,16,7,'#70ac86')}${E(x+15,y-27,17,7,'#9acfa0')}${E(x-9,y+5,12,6,'#80b591')}</g>`}
function baseScene(i){const l=levels[i],wall=l.palette[0],floor=l.palette[1];let a=`<defs>
<linearGradient id="wall" x1="0" y1="0" x2=".95" y2="1"><stop stop-color="${wall}"/><stop offset="1" stop-color="${l.palette[2]}"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${floor}"/><stop offset="1" stop-color="#b9aec4"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ecffff"/><stop offset=".45" stop-color="#c4e9f8"/><stop offset="1" stop-color="#91cde6"/></linearGradient>
<linearGradient id="ceramic" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="#ffffff"/><stop offset=".55" stop-color="#f2f9fb"/><stop offset="1" stop-color="#b9cfe1"/></linearGradient>
<linearGradient id="pinkglass"><stop stop-color="#fff8fa"/><stop offset="1" stop-color="#f2c4dc"/></linearGradient>
<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e9bc99"/><stop offset="1" stop-color="#bb8a78"/></linearGradient>
<filter id="shadow" x="-35%" y="-35%" width="170%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#564867" flood-opacity=".22"/></filter>
</defs>${R(0,0,960,445,'url(#wall)')}${R(0,445,960,175,'url(#floor)')}${R(0,440,960,10,'#ffffff90')}${L(0,563,960,563,'#ffffff25',3)}`;
for(let x=0;x<960;x+=93){a+=L(x,452,x-14,620,'#ffffff22',2)}
for(let y=36;y<410;y+=100){a+=`${E(56+(y%27),y,5,5,'#ffffff50')}${E(912+(y%33),y+15,4,4,'#ffffff50')}`}
return a}
const advancedLevels = [{...bathtubLevel, artwork:bathtubArtwork},vanityLevel,bedroomLevel,playroomLevel,
  kitchenLevel,puppyLevel,artStudioLevel,gardenLevel,cafeLevel,palaceLevel];
const scenePaintings = [
  'assets/scenes/bath.webp', 'assets/scenes/vanity.webp',
  'assets/scenes/bedroom.webp', 'assets/scenes/playroom.webp',
  'assets/scenes/kitchen.webp', 'assets/scenes/puppy.webp', 'assets/scenes/artstudio.webp',
  'assets/scenes/garden.webp', 'assets/scenes/cafe.webp', 'assets/scenes/palace.webp'
];

function renderScene() {
  svg.innerHTML = advancedLevels[S.level].artwork();
  svg.setAttribute('aria-label',levels[S.level].title+' illustrated scene');

  const painting = $('scenePainting');
  scene.classList.remove('has-painting');
  painting.classList.add('hidden');
  const file = scenePaintings[S.level];
  if (!file) {
    painting.removeAttribute('src');
    return;
  }
  const url = new URL(file, document.baseURI).href;
  painting.src = url;
  // Keep the matching SVG visible until the current level's painting decodes.
  const ready = painting.decode().catch(error => {
    // These painted rooms use local JPEGs on browsers without WebP support.
    if (S.level < 4 || scenePaintings[S.level] !== file || painting.src !== url) throw error;
    painting.src = url.replace(/\.webp$/,'.jpg');
    return painting.decode();
  });
  ready.then(() => {
    if (scenePaintings[S.level] !== file || ![url,url.replace(/\.webp$/,'.jpg')].includes(painting.src)) return;
    svg.querySelector('.puppy-celebration')?.setAttribute('href',painting.src);
    scene.classList.add('has-painting');
    painting.classList.remove('hidden');
  }).catch(() => {});
}
function seeded(n){let k=n|0;return ()=>{k^=k<<13;k^=k>>>17;k^=k<<5;return (k>>>0)/4294967296}}
function newLayer(){const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;return {canvas,ctx:canvas.getContext('2d',{willReadFrequently:true})}}
function paintBlob(c,x,y,rx,ry,random,kind){const angle=random()*Math.PI*2;const points=11;let p=[];for(let j=0;j<points;j++){const th=j*Math.PI*2/points;const jitter=.73+random()*.5;p.push([Math.cos(th)*rx*jitter,Math.sin(th)*ry*jitter])}
c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo((p[0][0]+p[points-1][0])/2,(p[0][1]+p[points-1][1])/2);for(let j=0;j<points;j++){const a=p[j],b=p[(j+1)%points];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}c.closePath();
const pal={dust:['#a99ab5','#b9aebc'],stain:['#ae7954','#d1a177'],grime:['#74897f','#627b75']}[kind];const grad=c.createRadialGradient(-rx*.2,-ry*.3,2,0,0,rx*1.35);grad.addColorStop(0,pal[0]+'a0');grad.addColorStop(.65,pal[1]+'89');grad.addColorStop(1,pal[0]+'23');c.fillStyle=grad;c.fill();c.strokeStyle=kind==='stain'?'#89594425':'#66586c22';c.lineWidth=1;c.stroke();
for(let j=0;j<11;j++){let px=(random()*2-1)*rx*.74,py=(random()*2-1)*ry*.7;if(px*px/(rx*rx)+py*py/(ry*ry)>.7)continue;c.beginPath();c.ellipse(px,py,1.5+random()*5,1+random()*3,random()*6,0,Math.PI*2);c.fillStyle=j%3?'#594b5840':'#ffffff33';c.fill()}
if(kind==='grime'){for(let j=0;j<4;j++){c.beginPath();c.moveTo(-rx*.6,ry*(random()-.5));c.bezierCurveTo(-rx*.1,ry*(random()-.5),rx*.25,ry*(random()-.5),rx*.68,ry*(random()-.5));c.strokeStyle='#496b6540';c.lineWidth=1.5+random()*1.5;c.stroke()}}
if(kind==='stain'){for(let j=0;j<3;j++){const dx=rx*(random()*1.2-.6);c.beginPath();c.moveTo(dx,ry*.5);c.quadraticCurveTo(dx+4,ry*.8,dx+1,ry*(1+random()*.25));c.strokeStyle='#bd916961';c.lineWidth=4;c.stroke()}}
c.restore()}
function createDirt(){const rand=seeded(S.level*7189+2299);S.layers={};const kinds=['stain','grime','dust'];for(const kind of kinds){const layer=newLayer();const c=layer.ctx;const zones=levels[S.level].zones;const count=10+Math.floor(S.level/2);for(let i=0;i<count;i++){const z=zones[(i+Math.floor(rand()*zones.length))%zones.length];let x=z[0]+(rand()-.5)*z[2],y=z[1]+(rand()-.5)*z[3];x=Math.max(35,Math.min(W-35,x));y=Math.max(35,Math.min(H-35,y));const size=22+rand()*35;paintBlob(c,x,y,size*(.9+rand()*.5),size*(.48+rand()*.37),rand,kind);
if(rand()>.48){paintBlob(c,x+rand()*40-20,y+rand()*40-20,7+rand()*16,5+rand()*14,rand,kind)}}S.layers[kind]=layer}
S.initial={};for(const kind of kinds)S.initial[kind]=measure(S.layers[kind].ctx);redraw();S.progress=0;displayProgress(0)}
function measure(c){const data=c.getImageData(0,0,W,H).data;let total=0;const step=7;for(let y=3;y<H;y+=step)for(let x=3;x<W;x+=step){total+=data[(y*W+x)*4+3]}return total}
function redraw(){ctx.clearRect(0,0,W,H);for(const k of ['stain','grime','dust'])ctx.drawImage(S.layers[k].canvas,0,0)}
function displayProgress(p){const rounded=Math.min(100,Math.round(p));$('progressLabel').textContent='✨ '+rounded+'% clean';$('fill').style.width=rounded+'%';$('meter').setAttribute('aria-valuenow',rounded)}
function checkProgress(force=false){const now=performance.now();if(!force&&now-S.lastProgress<200)return;S.lastProgress=now;let original=0,left=0;for(const k of ['stain','grime','dust']){original+=S.initial[k];left+=measure(S.layers[k].ctx)}S.progress=original?Math.max(0,Math.min(1,(original-left)/original)):0;displayProgress(S.progress*100);
if(S.progress>=.925&&!S.done)complete()}
const spec={sponge:{icon:'🧽',radius:37,power:.092,step:13,match:'stain'},brush:{icon:'🪥',radius:22,power:.158,step:9,match:'grime'},spray:{icon:'🫧',radius:52,power:.087,step:20,match:'dust'}};
function erasePoint(x,y){const tool=spec[S.tool];for(const k of ['stain','grime','dust']){const c=S.layers[k].ctx;const strength=tool.power*(k===tool.match?1:.075);c.save();c.globalCompositeOperation='destination-out';const grad=c.createRadialGradient(x,y,2,x,y,tool.radius);grad.addColorStop(0,`rgba(0,0,0,${strength})`);grad.addColorStop(.62,`rgba(0,0,0,${strength*.64})`);grad.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=grad;c.beginPath();c.arc(x,y,tool.radius,0,Math.PI*2);c.fill();c.restore()}}
function fxParticle(x,y){if(S.fx.length>80)S.fx.splice(0,S.fx.length-80);const rand=Math.random;const kind=S.tool;for(let i=0;i<(kind==='spray'?3:1);i++){S.fx.push({x:x+(rand()-.5)*28,y:y+(rand()-.5)*28,start:performance.now(),life:kind==='spray'?1100:550,rad:kind==='spray'?6+rand()*12:10+rand()*7,kind,drift:(rand()-.5)*18})}}
function drawFX(){fctx.clearRect(0,0,W,H);const now=performance.now();S.fx=S.fx.filter(a=>now-a.start<a.life);for(const q of S.fx){const p=(now-q.start)/q.life;fctx.save();fctx.globalAlpha=(1-p)*.75;if(q.kind==='spray'){fctx.strokeStyle='#fff';fctx.fillStyle='#e3fbffd0';fctx.lineWidth=2.5;fctx.beginPath();fctx.arc(q.x+q.drift*p,q.y-20*p,q.rad*(.7+p*.5),0,Math.PI*2);fctx.fill();fctx.stroke()}else if(q.kind==='sponge'){fctx.fillStyle='#e6ffffa0';fctx.beginPath();fctx.ellipse(q.x,q.y,q.rad*1.8,q.rad*.35,-.35,0,Math.PI*2);fctx.fill()}else{fctx.strokeStyle='#ffffffd0';fctx.lineWidth=2;for(let n=-1;n<2;n++){fctx.beginPath();fctx.moveTo(q.x-8,q.y+n*5);fctx.lineTo(q.x+12,q.y+n*5-3);fctx.stroke()}}fctx.restore()}
if(S.fx.length||S.down)S.animation=requestAnimationFrame(drawFX);else S.animation=0}
function animateFX(){if(!S.animation)S.animation=requestAnimationFrame(drawFX)}
function cleanPoint(x,y){if(S.done)return;erasePoint(x,y);fxParticle(x,y)}
function refreshDirt(){redraw();checkProgress();animateFX()}
function sceneCoordinates(e){const b=dirty.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*H,px:e.clientX-b.left,py:e.clientY-b.top}}
function moveCursor(p){const c=$('cursor');c.classList.remove('hidden');c.textContent=spec[S.tool].icon;c.style.left=p.px+'px';c.style.top=p.py+'px'}
function stroke(e){const p=sceneCoordinates(e);moveCursor(p);if(!S.previous){cleanPoint(p.x,p.y);S.previous=p;refreshDirt();return}const prev=S.previous;const distance=Math.hypot(p.x-prev.x,p.y-prev.y);const steps=Math.min(24,Math.max(1,Math.ceil(distance/spec[S.tool].step)));for(let n=1;n<=steps;n++){const t=n/steps;cleanPoint(prev.x+(p.x-prev.x)*t,prev.y+(p.y-prev.y)*t)}S.previous=p;refreshDirt()}
let holdInterval=null;
let legacyPointer;
function legacyAudioMaterial(tool) {
  if (S.level === 1 || S.level === 9) return 'glass';
  return tool === 'brush' || tool === 'spray' ? 'dust' : 'porcelain';
}

dirty.addEventListener('pointerdown', event => {
  if (S.done) return;
  if (surface) surface.pointerDown(event,S.tool);
  else {
    if (S.down || event.button !== 0) return;
    event.preventDefault();
    legacyPointer = event.pointerId;
    S.down = true;
    if (!S.started) S.started = performance.now();
    S.previous = null;
    cleaningAudio.begin(event.pointerId,S.tool,sceneCoordinates(event),legacyAudioMaterial(S.tool),event.timeStamp);
    stroke(event);
    if (S.down) holdInterval = setInterval(() => {
      if (S.previous) { cleanPoint(S.previous.x,S.previous.y); refreshDirt(); }
    },75);
  }
  if (surface ? surface.pointer === event.pointerId : S.down) {
    try { dirty.setPointerCapture(event.pointerId); } catch { /* The pointer can end before capture. */ }
  }
});
dirty.addEventListener('pointermove', event => {
  if (surface) surface.pointerMove(event);
  else if (S.down && legacyPointer === event.pointerId) {
    event.preventDefault();
    cleaningAudio.move(event.pointerId,sceneCoordinates(event),legacyAudioMaterial(S.tool),event.timeStamp);
    stroke(event);
  }
});
function endStroke(withFoam = false) {
  if (!S.down) return;
  S.down = false;
  legacyPointer = undefined;
  S.previous = null;
  clearInterval(holdInterval);
  holdInterval = null;
  cleaningAudio.end(withFoam);
  $('cursor').classList.add('hidden');
  checkProgress(true);
}
for (const type of ['pointerup','pointercancel','lostpointercapture']) {
  dirty.addEventListener(type,event => {
    if (surface) surface.pointerUp(event);
    else if (legacyPointer === event.pointerId) endStroke(type === 'pointerup');
  });
}
function clock(){if(S.done)return;if(surface)S.elapsed=surface.time;else if(S.started)S.elapsed=Math.floor((performance.now()-S.started)/1000);$('timeLabel').textContent='⏱ '+Math.floor(S.elapsed/60)+':'+String(S.elapsed%60).padStart(2,'0')}
setInterval(clock,400);
const finaleBadgeKey = 'familyArcadeCleaningFinaleCompleted';
function finaleEarned() {
  if (savedSetting(finaleBadgeKey) === 'true') return true;
  try { return JSON.parse(savedSetting(palaceLevel.saveKey))?.completed === true; }
  catch { return false; }
}

function levelButtons() {
  const finalBadge = finaleEarned();
  $('collectionSummary').textContent = (S.unlocked-1+Number(finalBadge))+' / 10 rooms cleaned';
  const buttons = levels.map((level,i) => {
    const button = document.createElement('button');
    const earned = i === 9 ? finalBadge : i+1 < S.unlocked;
    button.textContent = i+1;
    button.disabled = i>=S.unlocked;
    button.classList.toggle('current',i===S.level);
    button.classList.toggle('earned',earned);
    if (i===S.level) button.setAttribute('aria-current','step');
    button.setAttribute('aria-label','Level '+(i+1)+', '+level.title+
      (button.disabled ? ', locked' : earned ? ', completed' : ''));
    button.onclick = () => { S.level=i;loadLevel(); };
    return button;
  });
  $('levelList').replaceChildren(...buttons);
}

let surface;
const recordedAudio = new RecordedFoley(bathtubRecordings,cleaningAudio.muted,cleaningAudio.volume,message => {
  const warning = $('audioWarning');
  const visible = Boolean(advancedLevels[S.level] && message);
  warning.textContent = visible ? 'Cleaning Club audio: ' + message : '';
  warning.classList.toggle('hidden', !visible);
});

function stopCleaningAudio() {
  recordedAudio.stopAll();
  cleaningAudio.cancel();
}

function setCleaningAudio(muted, volume) {
  recordedAudio.set(muted,volume);
  cleaningAudio.set(muted,volume,{activate:!surface});
  if (surface) recordedAudio.unlock();
}

const toolButtons = [...document.querySelectorAll('[data-tool]')];
const toolNotes = {
  sponge: 'Wipes and polishes', brush: 'Scrubs the grout', spray: 'Softens soap scum'
};
const legacyNotes = {sponge: 'Sticky stains', brush: 'Stubborn grime', spray: 'Dust and smudges'};
const legacyHints = {
  sponge: 'Slowly wipe over the brown marks.',
  brush: 'Use short strokes on the green grime.',
  spray: 'Sweep foam over the purple dust.'
};

function selectTool(tool) {
  if (tool !== S.tool) stopCleaningAudio();
  S.tool = tool;
  surface?.scheduleHint();
  for (const button of toolButtons) {
    const selected = button.dataset.tool === tool;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  }
  if (surface?.ready) updateSurfaceProgress(S.progress * 100, surface.layers);
  else if (!advancedLevels[S.level]) $('tip').textContent = legacyHints[tool];
}

function updateSurfaceProgress(progress, layers) {
  S.progress = progress / 100;
  svg.classList.toggle('polished', progress === 100);
  displayProgress(Math.floor(progress));
  const active = layers.filter(layer => layer.remaining > cleanThreshold && surface.available(layer));
  const matching = active.find(layer => [layer.material.tool, layer.material.prepare].includes(S.tool));
  const hint = progress === 100 ? 'All clean!' : (matching || active[0])?.material.action;
  if (hint && $('tip').textContent !== hint) $('tip').textContent = hint;
  layers.forEach((layer, index) => {
    const item = $('tasks').children[index];
    const complete = layer.remaining <= cleanThreshold;
    const state = complete ? 'Done' : surface.available(layer) ? 'To clean' : 'After scrubbing';
    item.classList.toggle('checked', complete);
    item.classList.toggle('locked', !surface.available(layer));
    if (item.lastElementChild.textContent !== state) item.lastElementChild.textContent = state;
  });
}

function loadLevel(replay = false) {
  for (const menu of gameMenus) menu.open = false;
  setComparison(false);
  stopCleaningAudio();
  recordedAudio.reportStatus();
  surface?.dispose(!replay);
  surface = null;
  endStroke();
  S.done = false;
  S.started = 0;
  S.elapsed = 0;
  S.lastProgress = 0;
  S.fx = [];
  cancelAnimationFrame(S.animation);
  S.animation = 0;
  fctx.clearRect(0, 0, W, H);
  $('cursor').classList.add('hidden');
  $('finish').classList.add('hidden');
  svg.classList.remove('polished');
  $('timeLabel').textContent = '⏱ 0:00';
  const level = levels[S.level];
  $('levelTitle').textContent = level.title;
  const advanced = advancedLevels[S.level];
  $('levelDescription').textContent = advanced?.description || level.sub;
  $('levelTag').textContent = 'Level ' + (S.level + 1) + ' of 10';
  const notes = advanced ? advanced.notes || toolNotes : legacyNotes;
  for (const button of toolButtons) {
    button.querySelector('small').textContent = notes[button.dataset.tool];
  }
  $('tasks').replaceChildren();
  renderScene();
  levelButtons();
  if (advanced) {
    displayProgress(0);
    $('tip').textContent = advanced.layers[0].action;
    for (const material of advanced.layers) {
      const item = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'task-dot';
      dot.style.setProperty('--material', material.color);
      dot.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = material.label;
      item.append(dot, label, document.createElement('small'));
      $('tasks').append(item);
    }
    selectTool('spray');
    surface = new SurfaceCleaning(advanced, {
      audio: recordedAudio,
      progress: updateSurfaceProgress,
      finish() { S.elapsed = surface.time; complete(); }
    });
  } else {
    createDirt();
    selectTool('sponge');
  }
}

function complete() {
  stopCleaningAudio();
  S.done = true;
  S.down = false;
  clearInterval(holdInterval);
  holdInterval = null;
  if (!surface) S.elapsed = S.started ? Math.floor((performance.now()-S.started)/1000) : 0;
  $('cursor').classList.add('hidden');
  displayProgress(100);
  const advanced = advancedLevels[S.level];
  $('finishTitle').textContent = advanced?.finishTitle || (S.level === 0 ? 'Bathtub sparkling!' : S.level === 9 ? 'Ultimate sparkle champion!' : 'So satisfying!');
  $('finishMessage').textContent = advanced?.finishMessage || (S.level === 0 ?
    'The porcelain is glossy and the taps are shining. Lovely work!' :
    'A lovely clean makeover! Take your time and enjoy the next one.');
  $('next').textContent = S.level === 9 ? 'Choose a level' : 'Next makeover →';
  $('again').textContent = S.level === 9 ? 'Replay this level' : 'Clean this scene again';
  $('finish').classList.remove('hidden');
  S.unlocked = Math.max(S.unlocked, Math.min(10, S.level+2));
  if (S.level === 9) saveSetting(finaleBadgeKey,'true');
  saveSetting('familyArcadeCleaningUnlocked', String(S.unlocked));
  levelButtons();
  surface?.save();
}

function setComparison(open) {
  if (open && !S.done) return;
  const before = $('beforeCanvas');
  if (open) {
    surface.drawOriginalDirt(before);
    $('compareRange').value = 50;
    moveComparison();
  } else if (before.width !== 1) {
    before.width = 1;
    before.height = 1;
  }
  before.classList.toggle('hidden',!open);
  $('compareDivider').classList.toggle('hidden',!open);
  $('comparisonPanel').classList.toggle('hidden',!open);
  scene.classList.toggle('comparing',open);
  if (S.done) $('finish').classList.toggle('hidden',open);
}

function moveComparison() {
  const percent = Number($('compareRange').value);
  scene.style.setProperty('--before-width',percent+'%');
  $('compareRange').setAttribute('aria-valuetext',percent+'% before, '+(100-percent)+'% after');
}
$('compareRange').oninput = moveComparison;
$('openComparison').onclick = () => { setComparison(true); $('compareRange').focus(); };
$('closeComparison').onclick = () => { setComparison(false); $('openComparison').focus(); };

function updateAudioControls() {
  $('sound').textContent = cleaningAudio.muted ? 'Sound off' : 'Sound on';
  $('sound').setAttribute('aria-pressed', !cleaningAudio.muted);
  $('volume').value = Math.round(cleaningAudio.volume*100);
}

$('next').onclick = () => {
  if (S.level === 9) {
    $('levelMenu').open = true;
    $('levelMenu').querySelector('summary').focus();
    return;
  }
  S.level++;
  loadLevel();
};
$('again').onclick = () => {
  surface?.resetSavedProgress();
  loadLevel(true);
};
for (const button of toolButtons) button.onclick = () => selectTool(button.dataset.tool);
$('sound').onclick = () => {
  setCleaningAudio(!cleaningAudio.muted, cleaningAudio.volume);
  saveSetting('familyArcadeCleaningMuted', String(cleaningAudio.muted));
  updateAudioControls();
};
$('volume').oninput = () => {
  setCleaningAudio(cleaningAudio.muted, Number($('volume').value)/100);
  saveSetting('familyArcadeCleaningVolume', $('volume').value);
};
function cancelCleaningInput() {
  stopCleaningAudio();
  if (surface?.pointer !== undefined) surface.pointerUp({pointerId:surface.pointer});
  else endStroke();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelCleaningInput();
    surface?.clearHint();
  } else surface?.scheduleHint();
});
window.addEventListener('pagehide', event => {
  cancelCleaningInput();
  surface?.clearHint();
  surface?.save();
  if (!event.persisted) recordedAudio.dispose();
});
window.addEventListener('blur', cancelCleaningInput);
// Some touch browsers grant audio activation on release. This also primes
// audio after a fresh navigation when the saved preference is already on.
dirty.addEventListener('touchend', () => {
  const audio = surface ? recordedAudio : cleaningAudio;
  if (audio.context?.state !== 'running') audio.unlock();
}, {passive:true});
const gameMenus = [$('levelMenu'),$('taskMenu')];
for (const menu of gameMenus) {
  menu.querySelector('summary').addEventListener('click', () => {
    if (!menu.open) for (const other of gameMenus) if (other !== menu) other.open = false;
  });
}
document.addEventListener('pointerdown', event => {
  for (const menu of gameMenus) if (menu.open && !menu.contains(event.target)) menu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (scene.classList.contains('comparing')) $('closeComparison').click();
  for (const menu of gameMenus) {
    if (!menu.open) continue;
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
updateAudioControls();
loadLevel();
