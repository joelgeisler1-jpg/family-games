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
function surfaceDirt(zone, marks, paintMark) {
  return (ctx, random) => {
    ctx.save();
    ctx.clip(zone.path,'evenodd');
    for (const [kind,x,y,rx,ry,angle=0] of marks) {
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(angle);
      ctx.scale(rx,ry);
      if (paintMark) {
        paintMark(ctx,random,kind);
        ctx.restore();
        continue;
      }
      const [dark,light] = dirtColors[kind];
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

function dirtLayer({id,label,color,weight,tool,prepare,after,action}, zone, marks, paintMark) {
  const legacyDraw = surfaceDirt(zone,marks);
  return { id,label,color,weight,tool,prepare,after,action,
    draw:paintMark ? surfaceDirt(zone,marks,paintMark) : legacyDraw,legacyDraw,effectAreas:[zone] };
}

function polishGlints(points) {
  return `<g class="polish-glints" fill="#fffbed">${points.map(([x,y,r]) =>
    `<path d="M${x} ${y-r}q${r*.16} ${r*.84} ${r} ${r}q${-r*.84} ${r*.16} ${-r} ${r}q${-r*.16} ${-r*.84} ${-r} ${-r}q${r*.84} ${-r*.16} ${r} ${-r}Z"/>`
  ).join('')}</g>`;
}

function ovalOutline(cx,cy,rx,ry) {
  return `M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${rx*2} 0a${rx} ${ry} 0 1 0 ${-rx*2} 0Z`;
}

// The room marks share the clipping and save path above, with distinct
// deposits for porous fibres, polished wood, and smooth plastic.
function paintRoomDirt(ctx, random, kind) {
  const [body, grain, opacity] = {
    dust: ['#79634d','#fbe5ba','b8'],
    lint: ['#827479','#fff0dc','a7'],
    ring: ['#875132','#e2a977','52'],
    smudge: ['#694535','#e5b589','b8'],
    print: ['#526c72','#fff1d4','86'],
    sticky: ['#994733','#f5b478','cf'],
    residue: ['#594a38','#ceb68a','ca'],
    mud: ['#73543b','#bb966d','e3'],
    grime: ['#504a37','#a79d6f','dc']
  }[kind];
  const phase = random()*Math.PI*2;
  const wash = ctx.createRadialGradient(-.22,-.14,.085,0,0,1);
  wash.addColorStop(0,body+opacity);
  wash.addColorStop(.56,body+(kind === 'ring' ? '20' : '91'));
  wash.addColorStop(.83,body+'39');
  wash.addColorStop(1,body+'00');
  ctx.fillStyle = wash;
  ctx.beginPath();
  for (let i=0;i<=48;i++) {
    const angle = i*Math.PI/24;
    const edge = .92+.10*Math.sin(5*angle+phase)+.07*Math.cos(9*angle-phase);
    const x = edge*Math.cos(angle), y = edge*Math.sin(angle);
    if (!i) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.clip();
  ctx.lineCap = 'round';

  if (kind === 'ring') {
    for (const [radius,start,end,width,alpha] of [[.82,-.6,1.17,.112,'d4'],[.76,1.5,3.64,.058,'b9'],[.86,3.82,5.44,.08,'ba'],[.69,-.34,2.68,.037,'a4']]) {
      ctx.strokeStyle = (radius < .7 ? grain : body)+alpha;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.ellipse(-.04,.035,radius,radius*.9,.06,start,end);
      ctx.stroke();
    }
  } else if (kind === 'print') {
    for (let i=0;i<9;i++) {
      const radius = .86-i*.077;
      ctx.strokeStyle = i%3 ? grain+'98' : body+'b7';
      ctx.lineWidth = .026+random()*.02;
      ctx.beginPath();
      ctx.ellipse(-.14+i*.014,.04,radius,radius*.79,-.15,-.82+random()*.8,3.3+random()*.7);
      ctx.stroke();
    }
  } else {
    for (let i=0;i<142;i++) {
      const angle = random()*Math.PI*2;
      const radius = Math.pow(random(),.76);
      const x = Math.cos(angle)*radius, y = Math.sin(angle)*radius;
      const size = .011+random()*.040;
      const dense = Math.sin(x*13+y*4+phase)+Math.cos(y*9-x*2) > -.1;
      ctx.fillStyle = i%4 ? grain+(dense ? 'cb' : '65') : body+'b8';
      ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath();
      if (kind === 'lint' || kind === 'smudge') {
        ctx.lineWidth = size*.58;
        ctx.moveTo(x,y);
        ctx.quadraticCurveTo(x+size*1.15,y-size*1.4,x+size*(2+random()),y+size*.78);
        ctx.stroke();
      } else {
        ctx.ellipse(x,y,size,size*(.72+random()),angle,0,Math.PI*2);
        ctx.fill();
      }
    }
    if (kind === 'sticky') {
      ctx.strokeStyle = grain+'c7';
      ctx.lineWidth = .048;
      ctx.beginPath();
      ctx.moveTo(-.72,-.23);
      ctx.bezierCurveTo(-.47,-.58,.06,-.52,.47,-.24);
      ctx.stroke();
    }
  }
}
