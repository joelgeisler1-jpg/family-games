'use strict';

const cleaningTools = {
  spray: { radius: 57, spacing: 20 },
  sponge: { radius: 36, spacing: 11, strength: .76 },
  brush: { radius: 17, spacing: 6, strength: .78 }
};
const cleanThreshold = .055;
const bathtubProgressKey = 'familyArcadeBathtubBlissProgress1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function savedSetting(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Storage can be disabled. */ }
}

function radialStamp(ctx, x, y, radius, strength) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(0,0,0,${strength})`);
  gradient.addColorStop(.55, `rgba(0,0,0,${strength*.85})`);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(x-radius, y-radius, radius*2, radius*2);
}

function imageFromSave(url) {
  if (typeof url !== 'string' || !url.startsWith('data:image/png;base64,')) return Promise.resolve(null);
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

// Reinforce a deposit through its existing edge profile, with optional
// authored buildup in corners or where material naturally accumulates.
function thickenDirt(layer, opacity, buildup) {
  return {
    ...layer,
    previousDraw:layer.draw,
    draw(ctx,random) {
      layer.draw(ctx,random);
      ctx.save();
      ctx.globalAlpha=opacity;
      ctx.drawImage(ctx.canvas,0,0);
      ctx.restore();
      buildup?.(ctx,random);
    }
  };
}

class SurfaceCleaning {
  constructor(level, callbacks) {
    this.level = level;
    this.progressKey = level.saveKey || bathtubProgressKey;
    this.dirtVersion = level.dirtVersion;
    this.audio = callbacks.audio;
    this.callbacks = callbacks;
    this.foam = newLayer();
    this.sample = document.createElement('canvas');
    this.sample.width = Math.ceil(W/6);
    this.sample.height = Math.ceil(H/6);
    this.sampleCtx = this.sample.getContext('2d', {willReadFrequently: true});
    const random = seeded(level.seed);
    this.layers = level.layers.map(material => {
      const layer = { ...newLayer(), material };
      material.draw(layer.ctx, random);
      layer.original = this.measure(layer.canvas);
      layer.remaining = 1;
      return layer;
    });
    this.scratch = document.createElement('canvas');
    this.scratch.width = this.scratch.height = cleaningTools.spray.radius * 2;
    this.stamp = this.scratch.getContext('2d');
    this.effects = new CleaningEffects(fctx,[...new Set(level.layers.flatMap(layer => layer.effectAreas || []))]);
    this.active = true;
    this.ready = false;
    this.lastCheck = 0;

    this.frame = 0;
    this.elapsed = 0;
    queueMicrotask(() => this.restore());
    this.draw();
  }

  measure(canvas) {
    const {width, height} = this.sample;
    this.sampleCtx.globalCompositeOperation = 'copy';
    this.sampleCtx.drawImage(canvas, 0, 0, width, height);
    const {data} = this.sampleCtx.getImageData(0, 0, width, height);
    let total = 0;
    for (let i = 3; i < data.length; i += 4) total += data[i];
    return total;
  }

  async restore() {
    try {
      const saved = JSON.parse(savedSetting(this.progressKey));
      if (this.level.saveKey && saved?.completed === true) {
        for (const layer of this.layers) layer.ctx.clearRect(0,0,W,H);
        this.elapsed = Number.isFinite(saved.elapsed) ? Math.max(0,saved.elapsed) : 0;
      } else if (saved?.masks?.length === this.layers.length + 1) {
        const images = await Promise.all(saved.masks.map(imageFromSave));
        if (!this.active) return;
        if (images.every(image => image?.width === W && image.height === H)) {
          // Old masks already contain the player's exact strokes. Measure them
          // against their original baseline and keep their texture until replay.
          if (this.level.dirtVersion && saved.dirtVersion !== this.level.dirtVersion) {
            this.dirtVersion = saved.dirtVersion;
            const random = seeded(this.level.seed);
            for (const layer of this.layers) {
              layer.ctx.clearRect(0,0,W,H);
              const originalDraw = saved.dirtVersion === 2 ? layer.material.previousDraw || layer.material.draw : layer.material.legacyDraw || layer.material.draw;
              originalDraw(layer.ctx,random);
              layer.original = this.measure(layer.canvas);
            }
          }
          [...this.layers, this.foam].forEach(({ctx}, index) => {
            ctx.clearRect(0, 0, W, H);
            ctx.drawImage(images[index], 0, 0);
          });
          this.elapsed = Number.isFinite(saved.elapsed) ? Math.max(0, saved.elapsed) : 0;
        }
      }
    } catch { /* An invalid save falls back to the original dirt. */ }
    if (!this.active) return;
    this.ready = true;
    this.draw();
    this.update();
    this.scheduleHint();
  }

  save() {
    clearTimeout(this.saveTimer);
    if (!this.ready || !this.changed) return;
    const save = { elapsed:this.time, dirtVersion:this.dirtVersion };
    if (this.level.saveKey && this.finished) save.completed = true;
    else save.masks = [...this.layers,this.foam].map(({canvas}) => canvas.toDataURL());
    saveSetting(this.progressKey,JSON.stringify(save));
    this.changed = false;
  }

  resetSavedProgress() {
    saveSetting(this.progressKey,'');
  }

  dispose(save = true) {
    if (save) this.save();
    clearTimeout(this.saveTimer);
    cancelAnimationFrame(this.frame);
    this.active = false;
    this.clearHint();
    fctx.clearRect(0, 0, W, H);
  }

  get time() {
    return this.elapsed + (this.started ? Math.floor((performance.now()-this.started)/1000) : 0);
  }

  available(layer) {
    return (layer.material.after || []).every(id =>
      this.layers.find(item => item.material.id === id).remaining <= cleanThreshold);
  }

  clearHint() {
    clearTimeout(this.hintTimer);
    if (this.level.idleHints) $('dirtHint').classList.add('hidden');
  }

  scheduleHint() {
    this.clearHint();
    if (!this.level.idleHints || !this.ready || !this.active || this.finished || document.hidden || this.pointer !== undefined) return;
    this.hintTimer = setTimeout(() => this.showHint(),9000);
  }

  showHint() {
    if (document.hidden || !this.active || this.finished || this.pointer !== undefined) return;
    const available = this.layers.filter(layer => this.available(layer) && layer.remaining > cleanThreshold);
    const matching = available.filter(({material}) => [material.tool,material.prepare].includes(S.tool));
    const {width,height} = this.sample;
    let strongest = 0;
    let point;
    for (const layer of matching.length ? matching : available) {
      this.sampleCtx.drawImage(layer.canvas,0,0,width,height);
      const {data} = this.sampleCtx.getImageData(0,0,width,height);
      // Select a compact region of the *remaining* mask, including thin seams.
      for (let y=0;y<height;y+=6) for (let x=0;x<width;x+=6) {
        let score=0, sumX=0, sumY=0;
        for (let j=y;j<Math.min(y+9,height);j++) for (let i=x;i<Math.min(x+9,width);i++) {
          const alpha=data[(j*width+i)*4+3];
          score+=alpha;
          sumX+=(i+.5)*alpha;
          sumY+=(j+.5)*alpha;
        }
        if (score <= strongest) continue;
        strongest=score;
        point={x:sumX/score/width,y:sumY/score/height};
      }
    }
    if (!point) return;
    const hint = $('dirtHint');
    hint.style.left = point.x*100+'%';
    hint.style.top = point.y*100+'%';
    hint.classList.remove('hidden');
    this.hintTimer = setTimeout(() => this.clearHint(),4200);
  }

  pointerDown(event, tool) {
    if (!this.ready || this.finished || this.pointer !== undefined || event.button !== 0) return;
    this.clearHint();
    this.pointer = event.pointerId;
    this.strokeTool = tool;
    this.previous = sceneCoordinates(event);
    this.audioTime = event.timeStamp;
    this.audioDistance = 0;
    this.audio.startGesture(tool,this.level.audioMaterial?.(ctx,this.previous));
    this.distanceToStamp = cleaningTools[tool].spacing;
    this.started ||= performance.now();
    this.apply(this.previous.x, this.previous.y, tool);
    this.renderSoon();
  }

  pointerMove(event) {
    if (event.pointerId !== this.pointer) return;
    const tool = this.strokeTool;
    const events = event.getCoalescedEvents?.();
    for (const point of events?.length ? events : [event]) {
      const next = sceneCoordinates(point);
      const previous = this.previous;
      const dx = next.x - previous.x;
      const dy = next.y - previous.y;
      const distance = Math.hypot(dx, dy);
      this.audioDistance += distance;
      const spacing = cleaningTools[tool].spacing;
      let offset = this.distanceToStamp;
      for (; offset <= distance; offset += spacing) {
        this.apply(previous.x+dx*offset/distance, previous.y+dy*offset/distance, tool);
      }
      this.distanceToStamp = offset - distance;
      this.previous = next;
    }
    const elapsed = event.timeStamp-this.audioTime;
    if (elapsed >= 24 && this.audioDistance > 0) {
      this.audio.updateGesture({
        tool,
        speed:this.audioDistance*1000/elapsed,
        material:this.level.audioMaterial?.(ctx,this.previous)
      });
      this.audioTime = event.timeStamp;
      this.audioDistance = 0;
    }
    this.renderSoon();
  }

  pointerUp(event) {
    if (event.pointerId !== this.pointer) return;
    this.pointer = undefined;
    this.effects.endStroke();
    if (event.type === 'pointerup') this.audio.endGesture();
    else this.audio.stopAll();
    this.update();
    this.scheduleHint();
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 850);
    this.renderSoon();
  }

  apply(x, y, tool) {
    const {radius, strength} = cleaningTools[tool];
    const power = this.dirtVersion === 3 && strength ? strength+.09 : strength;
    if (x < -radius || x > W+radius || y < -radius || y > H+radius) return;
    let area = this.effects.areaAt(x,y);
    let residue;
    let strongest = 0;
    if (tool === 'spray') radialStamp(this.foam.ctx, x, y, radius, .93);
    for (const layer of this.layers) {
      const {ctx, material} = layer;
      const eligible = (material.tool === tool || material.prepare === tool) && this.available(layer);
      if (!eligible) continue;
      if (material.effectAreas?.length) {
        const contact = this.dirtContact(layer,x,y);
        if (contact && contact.strength > strongest) {
          const contactArea = material.effectAreas?.find(candidate =>
            fctx.isPointInPath(candidate.path,contact.x,contact.y,candidate.rule || 'evenodd'));
          if (contactArea) {
            strongest = contact.strength;
            residue = {color:contact.color || material.color, kind:material.effectKind};
            area = contactArea;
          }
        }
      }
      if (material.tool !== tool) continue;
      ctx.globalCompositeOperation = 'destination-out';
      radialStamp(ctx, x, y, radius, material.prepare ? .13 : power);
      if (material.prepare) {
        const size = radius * 2;
        this.stamp.clearRect(0, 0, size, size);
        radialStamp(this.stamp, radius, radius, radius, power);
        this.stamp.globalCompositeOperation = 'destination-in';
        this.stamp.drawImage(this.foam.canvas, radius-x, radius-y);
        this.stamp.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.scratch, 0, 0, size, size, x-radius, y-radius, size, size);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    this.effects.add(tool,x,y,area,residue);
    this.changed = true;
    this.needsDraw = true;
  }

  dirtContact(layer,x,y) {
    const left = Math.max(0,Math.floor(x)-6), top = Math.max(0,Math.floor(y)-6);
    const width = Math.min(W,Math.floor(x)+7)-left;
    const height = Math.min(H,Math.floor(y)+7)-top;
    if (width <= 0 || height <= 0) return null;
    const {data} = layer.ctx.getImageData(left,top,width,height);
    let strength = 21;
    let contact;
    for (let j=0;j<height;j++) for (let i=0;i<width;i++) {
      const alpha = data[(j*width+i)*4+3];
      if (alpha <= strength) continue;
      strength = alpha;
      const offset=(j*width+i)*4;
      const color=layer.material.sampleResidue ? `rgb(${data[offset]}, ${data[offset+1]}, ${data[offset+2]})` : undefined;
      contact = {x:left+i,y:top+j,strength,color};
    }
    return contact;
  }

  renderSoon() {
    if (!this.frame) this.frame = requestAnimationFrame(now => {
      this.frame = 0;
      if (!this.finished && now-this.lastCheck > 180) this.update();
      if (this.needsDraw) this.draw();
      if (this.effects.draw(now)) this.renderSoon();
    });
  }

  draw() {
    this.needsDraw = false;
    ctx.clearRect(0, 0, W, H);
    for (const layer of this.layers) ctx.drawImage(layer.canvas, 0, 0);
  }

  update() {
    if (this.finished) return;
    this.lastCheck = performance.now();
    let removed = 0;
    for (const layer of this.layers) {
      layer.remaining = this.measure(layer.canvas) / layer.original;
      removed += (1-layer.remaining)*layer.material.weight;
    }
    const allClean = this.layers.every(layer => layer.remaining <= cleanThreshold);
    this.callbacks.progress(allClean ? 100 : Math.min(99, removed*100), this.layers);
    if (allClean) {
      this.elapsed = this.time;
      this.started = null;
      this.finished = true;
      this.clearHint();
      this.pointer = undefined;
      for (const layer of this.layers) layer.ctx.clearRect(0, 0, W, H);
      this.draw();
      this.callbacks.finish();
    }
  }
}
