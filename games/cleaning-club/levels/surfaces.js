'use strict';

// Each zone owns the same outline for illustration, dirt clipping and Foley.
function cleaningZone(outline, material) {
  return { outline, material, path: new Path2D(outline) };
}

function zoneMaterial(zones, fallback) {
  return (ctx, {x,y}) => zones.find(zone => ctx.isPointInPath(zone.path,x,y,'evenodd'))?.material || fallback;
}

const dirtColors = {
  powder: ['#a78b9c', '#f9e9e0'],
  dust: ['#93847e', '#e9d6bb'],
  print: ['#5c8190', '#fff8e3'],
  streak: ['#748e9d', '#f5ffff'],
  residue: ['#89714f', '#e9cc98'],
  ring: ['#855944', '#e7ba8b'],
  smudge: ['#84667e', '#eac9cc'],
  sticky: ['#c56675', '#ffcd99']
};

// Marks are authored in scene coordinates. Their masks remain independent,
// allowing foam, wiping and brushing to affect only the intended dirt.
function surfaceDirt(zone, marks) {
  return (ctx, random) => {
    ctx.save();
    ctx.clip(zone.path,'evenodd');
    for (const [kind,x,y,rx,ry,angle=0] of marks) {
      const [dark,light] = dirtColors[kind];
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(angle);
      ctx.scale(rx,ry);
      const fade = ctx.createRadialGradient(-.15,-.12,.02,0,0,1);
      fade.addColorStop(0,dark+'a6');
      fade.addColorStop(.69,dark+'76');
      fade.addColorStop(1,dark+'00');
      ctx.fillStyle = fade;
      ctx.beginPath();
      ctx.ellipse(0,0,1,1,0,0,Math.PI*2);
      ctx.fill();
      if (kind === 'ring' || kind === 'print' || kind === 'streak') {
        const count = kind === 'ring' ? 2 : 6;
        for (let i=0;i<count;i++) {
          ctx.beginPath();
          const r = .83-i*(kind === 'ring' ? .10 : .12);
          ctx.ellipse(0,0,r,r,-.04,kind === 'ring' ? -.2 : .3,Math.PI*(kind === 'ring' ? 1.86 : 1.67));
          ctx.strokeStyle = i%2 ? light+'73' : dark+'91';
          ctx.lineWidth = .028+i*.005;
          ctx.stroke();
        }
      } else {
        for (let i=0;i<68;i++) {
          const theta = random()*Math.PI*2;
          const r = Math.sqrt(random())*.96;
          const size = .012+random()*.048;
          ctx.fillStyle = i%4 ? light+'83' : dark+'72';
          ctx.beginPath();
          ctx.ellipse(Math.cos(theta)*r,Math.sin(theta)*r,size,size*(.48+random()),theta,0,Math.PI*2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();
  };
}

function dirtLayer({id,label,color,weight,tool,prepare,after,action}, zone, marks) {
  return { id,label,color,weight,tool,prepare,after,action,draw:surfaceDirt(zone,marks) };
}

function polishGlints(points) {
  return `<g class="polish-glints" fill="#fffbed">${points.map(([x,y,r]) =>
    `<path d="M${x} ${y-r}q${r*.16} ${r*.84} ${r} ${r}q${-r*.84} ${r*.16} ${-r} ${r}q${-r*.16} ${-r*.84} ${-r} ${-r}q${r*.84} ${-r*.16} ${r} ${-r}Z"/>`
  ).join('')}</g>`;
}

function ovalOutline(cx,cy,rx,ry) {
  return `M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${rx*2} 0a${rx} ${ry} 0 1 0 ${-rx*2} 0Z`;
}
