'use strict';

const audioMaterials = {
  porcelain: { sponge: [1050, 1], brush: [2400, .72], spray: [3300, .95] },
  grout:     { sponge: [1450, .82], brush: [3150, 1], spray: [3500, 1] },
  chrome:    { sponge: [1500, .69], brush: [2550, .65], spray: [3700, .9] },
  glass:     { sponge: [1900, .78], brush: [2650, .64], spray: [3750, .86] },
  dust:      { sponge: [950, .68], brush: [2250, .78], spray: [3100, .94] }
};

// Original synthesized textures. A crossfade occupies the first part of each
// loop, blending the continuation of the last sample into the start.
const textureRate = 24000;
const seamTime = 1.15;
const toolLevel = { sponge: 1.32, brush: 1.4, spray: .86 };

function audioRandom(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

function makeTexture(context, tool) {
  const durations = { sponge: 19, brush: 17, spray: 23 };
  const length = durations[tool]*textureRate;
  const overlap = Math.round(seamTime*textureRate);
  const track = new Float32Array(length+overlap);
  const random = audioRandom(length);
  const bipolar = () => random()*2-1;
  const interval = mean => -Math.log(Math.max(.0001, random()))*mean*textureRate;
  let body = 0;
  let edge = 0;
  let drift = 0;
  for (let i = 0; i < track.length; i++) {
    const air = bipolar();
    body += (air-body)*.041;
    edge += (air-edge)*.27;
    drift += (air-drift)*.0013;
    if (tool === 'sponge') track[i] = (.52*body + .18*(edge-body))*(1+drift*3);
    if (tool === 'brush') track[i] = .17*(edge-body) + .035*body;
    if (tool === 'spray') track[i] = .57*(edge-body) + .055*air + .085*body;
  }

  if (tool === 'sponge') {
    // The sponge changes grip as water moves through its pores. Each tiny
    // slip is a low, downward glide with a damped, irregular edge.
    for (let i = 0; i < track.length; i += 1+Math.round(interval(.14))) {
      const span = Math.round((.018+random()*.047)*textureRate);
      const pitch = 150+random()*480;
      const strength = .018+random()*.041;
      for (let j = 0; j < span && i+j < track.length; j++) {
        const t = j/span;
        const phase = 2*Math.PI*pitch*j/textureRate*(1-.26*t);
        track[i+j] += strength*Math.sin(Math.PI*t)**2*(Math.sin(phase)+.14*Math.sin(2*phase));
      }
    }
  }

  if (tool === 'brush') {
    // Many independent bristle tips catch and release. Their short
    // resonances overlap to give steady friction without a scratch rhythm.
    for (let i = 0; i < track.length; i += 1+Math.round(interval(.0031))) {
      const pitch = 570+random()*2000;
      const damping = .0011+random()*.0029;
      const strength = bipolar()*.11;
      for (let j = 0; j < damping*textureRate*5 && i+j < track.length; j++) {
        const t = j/textureRate;
        track[i+j] += strength*Math.sin(2*Math.PI*pitch*t)*Math.exp(-t/damping);
      }
    }
  }

  const buffer = context.createBuffer(1, length, textureRate);
  const output = buffer.getChannelData(0);
  output.set(track.subarray(0,length));
  for (let i = 0; i < overlap; i++) {
    const angle = Math.PI*i/(2*overlap);
    output[i] = track[length+i]*Math.cos(angle) + track[i]*Math.sin(angle);
  }
  return buffer;
}

function makeFoamTail(context) {
  const random = audioRandom(Math.floor(Math.random()*2147483646)+1);
  const buffer = context.createBuffer(1, textureRate, textureRate);
  const data = buffer.getChannelData(0);
  let offset = .18;
  for (let bubble = 0; bubble < 3; bubble++) {
    offset += .065+random()*.17;
    const pitch = 270+random()*460;
    const start = Math.round(offset*textureRate);
    for (let i = 0; i < .075*textureRate && start+i < data.length; i++) {
      const t = i/textureRate;
      const phase = 2*Math.PI*pitch*t*(1+5*t);
      data[start+i] += .067*Math.min(1,t/.003)*Math.exp(-t/.016)*(Math.sin(phase)+.19*Math.sin(2*phase));
    }
  }
  return buffer;
}

function savedAudio(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function savedVolume() {
  const volume = Number(savedAudio('familyArcadeCleaningVolume') ?? 24);
  return Number.isFinite(volume) ? Math.min(100, Math.max(0,volume))/100 : .24;
}

const cleaningAudio = {
  muted: savedAudio('familyArcadeCleaningMuted') !== 'false',
  volume: savedVolume(),
  buffers: {},
  gesture: null,

  unlock() {
    if (this.muted || this.volume <= 0 || document.hidden) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      if (!this.context || this.context.state === 'closed') {
        this.context = new Audio();
        this.output = this.context.createGain();
        this.output.gain.value = this.volume*.55;
        this.output.connect(this.context.destination);
        this.context.addEventListener('statechange', () => {
          if (this.context.state !== 'running') this.cancel();
        });
      }
      if (this.context.state !== 'running') this.context.resume()?.catch(() => {});
    } catch { /* The game remains playable without Web Audio. */ }
  },

  begin(id, tool, point, material, time) {
    this.end(false);
    this.fadeFoam();
    this.unlock();
    if (!this.context || this.muted || this.volume <= 0 || document.hidden) return;
    const now = this.context.currentTime;
    if (this.voice?.tool !== tool) this.retireVoice();
    if (!this.voice) this.voice = this.createVoice(tool, Math.max(now,this.switchAfter || 0));
    clearTimeout(this.retireTimer);
    this.gesture = {id, tool, point, time, lastMix:time, distance:0, speed:0, started:performance.now()};
    this.mix(tool === 'spray' ? .57 : 0, material);
  },

  createVoice(tool, start) {
    const ac = this.context;
    const source = ac.createBufferSource();
    source.buffer = this.buffers[tool] ||= makeTexture(ac, tool);
    source.loop = true;
    const low = ac.createBiquadFilter();
    low.type = 'lowpass';
    low.Q.value = .45;
    const high = ac.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = tool === 'sponge' ? 95 : 145;
    high.Q.value = .55;
    const gain = ac.createGain();
    gain.gain.value = 0;
    source.connect(high).connect(low).connect(gain).connect(this.output);
    source.onended = () => { source.disconnect(); high.disconnect(); low.disconnect(); gain.disconnect(); };
    source.start(start, Math.random()*source.buffer.duration);
    return { tool, start, source, gain:gain.gain, cutoff:low.frequency };
  },

  move(id, point, material, time) {
    const gesture = this.gesture;
    if (!gesture || gesture.id !== id) return;
    const distance = Math.hypot(point.x-gesture.point.x,point.y-gesture.point.y);
    gesture.point = point;
    if (distance < .05) return;
    gesture.distance += distance;
    if (time-gesture.lastMix < 27) return;
    const speed = Math.min(1400, gesture.distance*1000/Math.max(16,time-gesture.lastMix));
    gesture.speed += (speed-gesture.speed)*.42;
    gesture.lastMix = time;
    gesture.distance = 0;
    const travel = 1-Math.exp(-gesture.speed/410);
    this.mix(gesture.tool === 'spray' ? .57 + .09*travel : .7*Math.sqrt(travel),material);
    if (gesture.tool !== 'spray') {
      clearTimeout(this.stillTimer);
      this.stillTimer = setTimeout(() => {
        gesture.speed = 0;
        this.setVoiceGain(0,.075);
      }, 105);
    }
  },

  mix(intensity, material) {
    const {tool, cutoff, start} = this.voice;
    const [frequency, level] = (audioMaterials[material] || audioMaterials.porcelain)[tool];
    const at = Math.max(this.context.currentTime,start);
    cutoff.setTargetAtTime(frequency,at,.08);
    this.setVoiceGain(intensity*level*toolLevel[tool],.042);
  },

  setVoiceGain(value, timeConstant) {
    if (!this.voice) return;
    const {gain, start} = this.voice;
    const now = this.context.currentTime;
    if (start > now) gain.cancelScheduledValues(start);
    gain.setTargetAtTime(value,Math.max(now,start),timeConstant);
  },

  end(withFoam = false) {
    clearTimeout(this.stillTimer);
    const gesture = this.gesture;
    this.gesture = null;
    if (!gesture) return;
    this.setVoiceGain(0,.055);
    if (withFoam && gesture.tool === 'spray' && performance.now()-gesture.started > 280) this.releaseFoam();
    clearTimeout(this.retireTimer);
    this.retireTimer = setTimeout(() => this.retireVoice(), 740);
  },

  retireVoice() {
    if (!this.voice) return;
    this.setVoiceGain(0,.024);
    this.switchAfter = Math.max(this.switchAfter || 0,this.context.currentTime+.17);
    this.voice.source.stop(this.switchAfter);
    this.voice = null;
  },

  releaseFoam() {
    const ac = this.context;
    if (ac.state !== 'running' || this.muted) return;
    const source = ac.createBufferSource();
    const level = ac.createGain();
    level.gain.value = .37;
    source.buffer = makeFoamTail(ac);
    source.connect(level).connect(this.output);
    this.foam = {source, gain:level.gain};
    source.onended = () => {
      if (this.foam?.source === source) this.foam = null;
      source.disconnect();
      level.disconnect();
    };
    source.start();
  },

  fadeFoam() {
    if (!this.foam) return;
    const now = this.context.currentTime;
    this.foam.gain.setTargetAtTime(0,now,.018);
    this.foam.source.stop(now+.10);
    this.foam = null;
  },

  cancel() {
    this.end();
    this.fadeFoam();
  },

  set(muted, volume, {activate = true} = {}) {
    this.muted = muted;
    this.volume = volume;
    if (muted || volume <= 0) this.cancel();
    else if (activate) this.unlock();
    if (this.output) this.output.gain.setTargetAtTime(muted ? 0 : volume*.55,this.context.currentTime,.028);
  }
};
