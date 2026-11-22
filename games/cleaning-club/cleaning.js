'use strict';

const cleaningTools = {
  spray: { radius: 57, spacing: 20 },
  sponge: { radius: 36, spacing: 11, strength: .76 },
  brush: { radius: 17, spacing: 6, strength: .78 }
};
const cleanThreshold = .055;
const progressKey = 'familyArcadeBathtubBlissProgress1';
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

class SurfaceCleaning {
  constructor(level, callbacks) {
    this.level = level;
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
    this.effects = [];
    this.active = true;
    this.ready = false;
    this.lastCheck = 0;
    this.lastEffect = 0;
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
      const saved = JSON.parse(savedSetting(progressKey));
      if (saved?.masks?.length === this.layers.length + 1) {
        const images = await Promise.all(saved.masks.map(imageFromSave));
        if (!this.active) return;
        if (images.every(image => image?.width === W && image.height === H)) {
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
  }

  save() {
    clearTimeout(this.saveTimer);
    if (!this.ready || !this.changed) return;
    saveSetting(progressKey, JSON.stringify({
      elapsed: this.elapsed + (this.started ? Math.floor((performance.now()-this.started)/1000) : 0),
      masks: [...this.layers, this.foam].map(({canvas}) => canvas.toDataURL())
    }));
    this.changed = false;
  }

  dispose(save = true) {
    if (save) this.save();
    clearTimeout(this.saveTimer);
    cancelAnimationFrame(this.frame);
    this.active = false;
    fctx.clearRect(0, 0, W, H);
  }

  get time() {
    return this.elapsed + (this.started ? Math.floor((performance.now()-this.started)/1000) : 0);
  }

  available(layer) {
    return (layer.material.after || []).every(id =>
      this.layers.find(item => item.material.id === id).remaining <= cleanThreshold);
  }

  pointerDown(event, tool) {
    if (!this.ready || this.finished || this.pointer !== undefined || event.button !== 0) return;
    this.pointer = event.pointerId;
    this.strokeTool = tool;
    this.previous = sceneCoordinates(event);
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
      const spacing = cleaningTools[tool].spacing;
      let offset = this.distanceToStamp;
      for (; offset <= distance; offset += spacing) {
        this.apply(previous.x+dx*offset/distance, previous.y+dy*offset/distance, tool);
      }
      this.distanceToStamp = offset - distance;
      this.previous = next;
    }
    this.renderSoon();
  }

  pointerUp(event) {
    if (event.pointerId !== this.pointer) return;
    this.pointer = undefined;
    this.update();
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 850);
    this.renderSoon();
  }

  apply(x, y, tool) {
    const {radius, strength} = cleaningTools[tool];
    if (x < -radius || x > W+radius || y < -radius || y > H+radius) return;
    if (tool === 'spray') radialStamp(this.foam.ctx, x, y, radius, .93);
    for (const layer of this.layers) {
      if (layer.material.tool !== tool || !this.available(layer)) continue;
      const {ctx, material} = layer;
      ctx.globalCompositeOperation = 'destination-out';
      radialStamp(ctx, x, y, radius, material.prepare ? .13 : strength);
      if (material.prepare) {
        const size = radius * 2;
        this.stamp.clearRect(0, 0, size, size);
        radialStamp(this.stamp, radius, radius, radius, strength);
        this.stamp.globalCompositeOperation = 'destination-in';
        this.stamp.drawImage(this.foam.canvas, radius-x, radius-y);
        this.stamp.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.scratch, 0, 0, size, size, x-radius, y-radius, size, size);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    const now = performance.now();
    if (now-this.lastEffect > 34 && !reducedMotion.matches) {
      this.lastEffect = now;
      this.effects.push({ x, y, tool, start: now, drift: Math.random()*12-6 });
    }
    this.changed = true;
    this.needsDraw = true;
    cleaningAudio.play(tool);
  }

  renderSoon() {
    if (!this.frame) this.frame = requestAnimationFrame(now => {
      this.frame = 0;
      if (!this.finished && now-this.lastCheck > 180) this.update();
      if (this.needsDraw) this.draw();
      this.drawEffects(now);
      if (this.effects.length) this.renderSoon();
    });
  }

  draw() {
    this.needsDraw = false;
    ctx.clearRect(0, 0, W, H);
    for (const layer of this.layers) ctx.drawImage(layer.canvas, 0, 0);
  }

  drawEffects(now) {
    fctx.clearRect(0, 0, W, H);
    this.effects = this.effects.filter(effect => now-effect.start < (effect.tool === 'spray' ? 1550 : 650));
    for (const {x,y,tool,start,drift} of this.effects) {
      const foam = tool === 'spray';
      const fade = 1-(now-start)/(foam ? 1550 : 650);
      fctx.save();
      fctx.globalAlpha = fade * (foam ? .7 : .48);
      fctx.fillStyle = foam ? '#fcfff6' : tool === 'brush' ? '#b5a281' : '#ecfff7';
      fctx.strokeStyle = '#fffdf6';
      fctx.lineWidth = 1.2;
      const count = tool === 'sponge' ? 1 : 4;
      for (let i = 0; i < count; i++) {
        fctx.beginPath();
        const rise = (1-fade)*12;
        const radius = foam ? 5+i*1.8 : tool === 'brush' ? 1.4 : 19;
        fctx.ellipse(x+i*7-10+drift, y+i*5-rise, radius, foam ? radius : 2.9, -.25, 0, Math.PI*2);
        fctx.fill();
        if (foam) fctx.stroke();
      }
      fctx.restore();
    }
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
      this.pointer = undefined;
      for (const layer of this.layers) layer.ctx.clearRect(0, 0, W, H);
      this.draw();
      this.callbacks.finish();
    }
  }
}
