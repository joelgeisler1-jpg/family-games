'use strict';

const surfaceFinishes = {
  porcelain: { sheen:'#f0fff6', moisture:'#548981', width:25 },
  glass: { sheen:'#f4fff5', moisture:'#548a92', width:26 },
  chrome: { sheen:'#fffae0', moisture:'#777354', width:13 },
  stone: { sheen:'#fff7e5', moisture:'#a47774', width:23 },
  wood: { sheen:'#ffe0a6', moisture:'#8e532d', width:22 },
  fabric: { sheen:'#fff3db', moisture:'#695d79', width:13 },
  plastic: { sheen:'#eaf7ff', moisture:'#697e92', width:22 },
  grout: { sheen:'#fff3d5', moisture:'#6c6547', width:11 }
};

class CleaningEffects {
  constructor(context, areas) {
    this.ctx = context;
    this.areas = areas;
    this.marks = [];
  }

  areaAt(x,y) {
    return this.areas.find(area => this.ctx.isPointInPath(area.path,x,y,area.rule || 'evenodd'));
  }

  endStroke() {
    this.previous = null;
  }

  add(tool, x, y, area, residue) {
    const now = performance.now();
    if (tool === 'sponge') {
      // Foam is visual and transient. The separate preparation mask keeps
      // its existing gameplay effect after the visible bubbles dissipate.
      for (const mark of this.marks) {
        if (mark.tool === 'spray' && !mark.wiped && Math.hypot(mark.x-x,mark.y-y)<43) {
          mark.wiped = now;
          mark.pushX = this.previous ? (x-this.previous.x)*.4 : 0;
          mark.pushY = this.previous ? (y-this.previous.y)*.4 : 0;
        }
      }
    }
    if (!area || (tool === 'brush' && !residue)) {
      this.endStroke();
      return;
    }
    const still = reducedMotion.matches;
    const previous = this.previous;
    const connected = previous?.tool === tool && previous.area === area &&
      Math.hypot(previous.x-x,previous.y-y) < 27;
    const mark = {
      tool,x,y,area,fromX:connected ? previous.x : x,fromY:connected ? previous.y : y,
      since:now, life:tool === 'spray' ? 2250 : tool === 'sponge' ? 1170 : 550,
      residue, still
    };
    if (tool === 'spray') {
      mark.bubbles = Array.from({length:6},(_,i) => ({
        x:(Math.random()-.5)*36, y:(Math.random()-.5)*28,
        r:i === 5 ? 1.5 : 2+Math.random()*5
      }));
    } else if (residue && !still && (!connected || !previous.particles)) {
      mark.particles = Array.from({length:tool === 'brush' ? 4 : 3},() => ({
        x:(Math.random()-.5)*14, y:(Math.random()-.5)*13, r:.8+Math.random()*1.4
      }));
    }
    if (still) mark.life = tool === 'spray' ? 1300 : 420;
    this.previous = mark;
    this.marks.push(mark);
    if (this.marks.length > 76) this.marks.shift();
  }

  draw(now) {
    this.ctx.clearRect(0,0,W,H);
    this.marks = this.marks.filter(mark => (!mark.wiped || now-mark.wiped < 140) && now-mark.since < mark.life);
    // Marks on the same material share a clip operation.
    for (const area of this.areas) {
      if (!this.marks.some(mark => mark.area === area)) continue;
      this.ctx.save();
      this.ctx.clip(area.path,area.rule || 'evenodd');
      for (const mark of this.marks) if (mark.area === area) this.drawMark(mark,now);
      this.ctx.restore();
    }
    return this.marks.length > 0;
  }

  drawMark(mark,now) {
    const {ctx} = this;
    const {x,y,fromX,fromY,area,tool,residue,still} = mark;
    const age = Math.max(0,(now-mark.since)/mark.life);
    const wipe = mark.wiped ? Math.min(1,Math.max(0,(now-mark.wiped)/140)) : 0;
    const fade = (1-age)**1.3*(1-wipe);
    const finish = surfaceFinishes[area.material] || surfaceFinishes.stone;
    const dx = x-fromX, dy = y-fromY;
    const length = Math.hypot(dx,dy) || 1;
    const nx = -dy/length, ny = dx/length;
    ctx.lineCap = 'round';

    if (tool === 'spray') {
      const moisture = ctx.createRadialGradient(x,y,3,x,y,26);
      moisture.addColorStop(0,finish.moisture);
      moisture.addColorStop(1,'transparent');
      ctx.globalAlpha = fade*(residue ? .26 : .12);
      ctx.fillStyle = moisture;
      ctx.fillRect(x-26,y-26,52,52);
      for (const bubble of mark.bubbles) {
        const bx=x+bubble.x+(still ? 0 : (mark.pushX || 0)*wipe);
        const by=y+bubble.y+(still ? 0 : age*3+(mark.pushY || 0)*wipe);
        const radius=bubble.r*(still ? 1 : .85+.35*Math.min(1,age*4));
        ctx.fillStyle='#f7ffe9';
        ctx.strokeStyle='#f8fff5';
        ctx.lineWidth=.75;
        ctx.beginPath();
        ctx.arc(bx,by,radius,0,Math.PI*2);
        ctx.globalAlpha=fade*.35;
        ctx.fill();
        ctx.globalAlpha=fade*.63;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx-radius*.21,by-radius*.23,radius*.30,3.2,4.8);
        ctx.stroke();
      }
    } else if (tool === 'sponge') {
      // Overlapping line segments stay connected even at high pointer speed.
      this.line(mark,0,finish.width,finish.moisture,fade*.075,nx,ny);
      this.line(mark,-finish.width*.17,finish.width*.56,finish.sheen,fade*.095,nx,ny);
      this.line(mark,finish.width*.24,area.material === 'chrome' ? 2.0 : 1.3,finish.sheen,fade*.62,nx,ny);
      if (residue) {
        const film = residue.kind === 'grease' || residue.kind === 'paint';
        this.line(mark,finish.width*.35,film ? 4.6 : 2.4,residue.color,fade*(film ? .34 : .3),nx,ny);
      }
    } else {
      const fabric = area.material === 'fabric';
      for (const offset of [-5,0,5]) {
        this.line(mark,offset,fabric ? 1 : 1.35,finish.sheen,fade*(fabric ? .39 : .52),nx,ny);
      }
    }

    for (const particle of mark.particles || []) {
      const drift = tool === 'brush' ? age*8 : age*4;
      const px = x+particle.x + dx/length*drift + nx*particle.x*age*.6;
      const py = y+particle.y + dy/length*drift + ny*particle.x*age*.6;
      ctx.fillStyle = residue.color;
      ctx.strokeStyle = finish.sheen;
      ctx.globalAlpha = fade*.76;
      ctx.lineWidth = .65;
      ctx.beginPath();
      if (residue.kind === 'mud' || residue.kind === 'paint') {
        const r = particle.r*(residue.kind === 'mud' ? 1.45 : 1);
        ctx.moveTo(px-r,py+.15*r);
        ctx.lineTo(px-.1*r,py-r);
        ctx.lineTo(px+r,py-.44*r);
        ctx.lineTo(px+.63*r,py+.68*r);
        ctx.closePath();
        ctx.fill();
      } else if (residue.kind === 'fiber') {
        ctx.strokeStyle = residue.color;
        ctx.lineWidth = .85;
        ctx.moveTo(px-2,py+1);
        ctx.quadraticCurveTo(px+1,py-3,px+3,py-.5);
      } else {
        ctx.ellipse(px,py,particle.r*(area.material === 'fabric' ? 1.8 : 1),particle.r*.65,.4,0,Math.PI*2);
        ctx.fill();
      }
      ctx.stroke();
    }
  }

  line(mark,offset,width,color,alpha,nx,ny) {
    const {ctx} = this;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(mark.fromX+nx*offset,mark.fromY+ny*offset);
    ctx.lineTo(mark.x+nx*offset+.01,mark.y+ny*offset);
    ctx.stroke();
  }
}
