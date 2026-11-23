export const COLORS = [
  { id: 'peach', color: '#ffbd9d', label: 'Peach' },
  { id: 'mint', color: '#83e5cc', label: 'Mint' },
  { id: 'lavender', color: '#c3afff', label: 'Lavender' },
  { id: 'gold', color: '#ffe08a', label: 'Gold' },
  { id: 'blue', color: '#91c7ff', label: 'Blue' },
];
const make = (id, from, to) => ({ id, from, to });
export const LEVELS = [
  { name: 'First Delivery', subtitle: 'Help two little stars find their homes.', stars: [
    make('peach', [160,390], [720,190]), make('mint',[280,440],[800,350]),
  ], clouds: [] },
  { name: 'Twinkle Trail', subtitle: 'Three friendly stars are waiting for a home.', stars: [
    make('peach',[160,170],[770,420]), make('mint',[190,440],[680,170]), make('lavender',[360,400],[840,270]),
  ], clouds: [] },
  { name: 'Cloudy Crossing', subtitle: 'Guide your stars around the sleepy cloud.', stars: [
    make('peach',[160,220],[820,180]), make('mint',[190,445],[740,440]), make('lavender',[335,465],[810,325]),
  ], clouds: [{ x:440,y:205,w:150,h:205 }] },
  { name: 'Moonlit Maze', subtitle: 'Two moon clouds make the journey trickier.', stars: [
    make('peach',[110,140],[800,445]), make('mint',[240,195],[760,140]), make('lavender',[170,445],[860,265]), make('gold',[340,455],[650,355]),
  ], clouds: [{x:435,y:120,w:105,h:170},{x:435,y:355,w:135,h:130}] },
  { name: 'Festival of Stars', subtitle: 'Deliver all five stars to light the night sky!', stars: [
    make('peach',[135,160],[790,425]), make('mint',[140,320],[775,140]), make('lavender',[220,445],[865,285]), make('gold',[305,155],[645,440]), make('blue',[330,455],[665,215]),
  ], clouds: [{x:435,y:170,w:100,h:140},{x:450,y:365,w:105,h:120}] },
];
export const TARGET_RADIUS = 44;
export const STAR_RADIUS = 24;
export function insideCloud(x,y,cloud,pad=STAR_RADIUS) {
  return x > cloud.x-pad && x < cloud.x+cloud.w+pad &&
    y > cloud.y-pad && y < cloud.y+cloud.h+pad;
}
export function canMove(x,y,clouds,width=960,height=560) {
  return x >= STAR_RADIUS && x <= width-STAR_RADIUS &&
    y >= STAR_RADIUS && y <= height-STAR_RADIUS &&
    !clouds.some(c => insideCloud(x,y,c));
}
export function findMatch(starId, point, level, delivered) {
  if (delivered.includes(starId)) return false;
  const star = level.stars.find(s=>s.id===starId);
  return Boolean(star && Math.hypot(star.to[0]-point.x,star.to[1]-point.y) <= TARGET_RADIUS);
}
export function isComplete(level,delivered) {
  return level.stars.every(s=>delivered.includes(s.id));
}
