import { COLORS, LEVELS, STAR_RADIUS, canMove, findMatch, isComplete } from './logic.mjs';

const ns = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const board = $('board');
const make = (name, attrs, parent) => {
  const el = document.createElementNS(ns,name);
  for(const [k,v] of Object.entries(attrs||{})) el.setAttribute(k,v);
  parent?.append(el);
  return el;
};
const storageKey='familyArcadeStarPostUnlocked';
let unlocked=1;
try { unlocked=Math.max(1,Math.min(LEVELS.length,Number(localStorage.getItem(storageKey))||1)); } catch {}
let index=0, delivered=[], positions=new Map(), selected=null, pointer=null;
const color = id => COLORS.find(c=>c.id===id) || COLORS[0];
const resetSelection=()=>{selected=null;pointer=null;};
function position(e) {
  const pt=board.createSVGPoint(); pt.x=e.clientX;pt.y=e.clientY;
  const matrix=board.getScreenCTM();
  return matrix ? pt.matrixTransform(matrix.inverse()) : null;
}
function say(message){$('status').textContent=message;}
function generateBackground() {
  const layer=$('background');layer.replaceChildren();
  for(let i=0;i<65;i++){
    const x=(i*173+59)%960,y=(i*113+77)%560;
    make('circle',{cx:x,cy:y,r:i%7===0?2.1:1, class:'sparkle'},layer);
  }
  make('path',{d:'M0 497Q200 454 400 499T960 486V560H0Z',fill:'#302b5480'},layer);
}
function draw(){
  const level=LEVELS[index], clouds=$('clouds'), targets=$('targets'), stars=$('stars');
  clouds.replaceChildren();targets.replaceChildren();stars.replaceChildren();
  for(const c of level.clouds){
    make('rect',{x:c.x,y:c.y,width:c.w,height:c.h,rx:50,class:'cloud'},clouds);
    for(let i=0;i<3;i++) make('circle',{cx:c.x+30+i*(c.w-60)/2,cy:c.y+24,r:25,fill:'#b4b9d440'},clouds);
  }
  for(const star of level.stars){
    const col=color(star.id), done=delivered.includes(star.id), to=star.to;
    const home=make('g',{class:'target',role:'button',tabindex:'0',
      'aria-label':col.label+' star home'+(done?', delivered':'')},targets);
    make('circle',{cx:to[0],cy:to[1],r:39,fill:col.color,opacity:done?.33:.09},home);
    make('circle',{cx:to[0],cy:to[1],r:36,fill:'none',stroke:col.color,'stroke-width':done?5:3,'stroke-dasharray':done?'0':'7 7'},home);
    make('text',{x:to[0],y:to[1]+5,class:'target-label'},home).textContent=done?'✓':'✦';
    home.addEventListener('click',()=>deliver(star.id));
    home.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();deliver(star.id);}});
    if(done)continue;
    const p=positions.get(star.id)||star.from;
    const group=make('g',{transform:`translate(${p[0]} ${p[1]})`,class:'star-grab',
      role:'button',tabindex:'0','aria-label':col.label+' star. Tap to select, then tap its home.'},stars);
    make('circle',{r:35,fill:col.color,opacity:.27,filter:'url(#glow)'},group);
    make('circle',{r:30,fill:col.color,stroke:selected===star.id?'#fff':'#ffffff91','stroke-width':selected===star.id?5:2},group);
    make('text',{y:2,class:'star-symbol'},group).textContent='★';
    group.addEventListener('pointerdown',e=>{
      if(pointer!==null)return;
      e.preventDefault(); selected=star.id; pointer=e.pointerId;
      try{group.setPointerCapture(e.pointerId);}catch{}
      say(col.label+' star selected. Drag it home or tap its matching circle.');
      draw();
    });
    group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selected=star.id;say(col.label+' selected; activate its matching home.');draw();}});
  }
  $('progress').textContent=delivered.length+' / '+level.stars.length+' ✦';
}
function deliver(id) {
  if(selected!==id||delivered.includes(id))return;
  delivered.push(id);resetSelection();
  if(isComplete(LEVELS[index],delivered)) {
    if(index+2>unlocked){unlocked=Math.min(LEVELS.length,index+2);try{localStorage.setItem(storageKey,String(unlocked));}catch{}}
    updateLevelMenu();
    $('finishTitle').textContent=index===LEVELS.length-1?'All stars delivered!':'Lovely work!';
    $('finishMessage').textContent=index===LEVELS.length-1?'The sky is shining because of you.':'Every little star is safe at home.';
    $('next').textContent=index===LEVELS.length-1?'Play again ↻':'Next delivery →';
    $('finish').classList.remove('hidden');say('Level complete!');
  } else say('Wonderful! '+delivered.length+' star'+(delivered.length===1?'':'s')+' delivered.');
  draw();
}
function release(e) {
  if(pointer!==e.pointerId)return;
  const p=position(e);
  const id=selected;
  pointer=null;
  if(p&&id&&findMatch(id,p,LEVELS[index],delivered)) { deliver(id);return; }
  // Keep a selected star active for tap-to-target users.
  if(id) say('Tap the matching glowing circle, or drag the star onto it.');
  draw();
}
board.addEventListener('pointermove',e=>{
  if(pointer!==e.pointerId||!selected)return;
  const p=position(e);
  if(!p)return;
  if(canMove(p.x,p.y,LEVELS[index].clouds)) {
    positions.set(selected,[p.x,p.y]);
    const group=$('stars').querySelector('[aria-label^="'+color(selected).label+' star"]');
    group?.setAttribute('transform',`translate(${p.x} ${p.y})`);
  }
});
board.addEventListener('pointerup',release);
board.addEventListener('pointercancel',e=>{if(pointer===e.pointerId){pointer=null;draw();}});
window.addEventListener('blur',()=>{pointer=null;draw();});
function updateLevelMenu(){
  const select=$('levelSelect');select.replaceChildren();
  LEVELS.forEach((l,i)=>{
    const option=document.createElement('option');
    option.value=String(i);option.textContent=(i+1)+'. '+l.name+(i>=unlocked?' 🔒':'');
    option.disabled=i>=unlocked;select.append(option);
  });select.value=String(index);
}
function load(i){
  index=i;delivered=[];positions=new Map();resetSelection();
  $('counter').textContent='LEVEL '+(i+1)+' / '+LEVELS.length;
  $('levelTitle').textContent=LEVELS[i].name;
  $('subtitle').textContent=LEVELS[i].subtitle;
  $('finish').classList.add('hidden');
  say('Drag a star to its matching glowing circle. Or tap the star, then the circle.');
  updateLevelMenu();draw();
}
$('restart').addEventListener('click',()=>load(index));
$('next').addEventListener('click',()=>load(index===LEVELS.length-1?0:index+1));
$('levelSelect').addEventListener('change',e=>{const i=Number(e.target.value);if(i<unlocked)load(i);});
generateBackground();load(0);
