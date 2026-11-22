'use strict';

// Paths stay empty until each edited local excerpt is present and credited.
const bathtubRecordings = {
  sponge: { porcelain: null, chrome: null, glass: null },
  brush: { grout: null },
  spray: [],
  foam: []
};

const foleyDefaults = { sponge: 'porcelain', brush: 'grout' };
const foleyTone = {
  porcelain: [1800, 1],
  grout: [2850, .91],
  chrome: [2100, .74],
  glass: [2200, .78],
  dust: [1450, .74]
};

function makeFoleyLoop(context, recording) {
  // The first 200 ms crossfade from the continuation of the loop's last
  // sample into the head. The overlap itself is removed from the duration.
  const overlap = Math.min(Math.round(recording.sampleRate*.2), Math.floor(recording.length/4));
  const length = recording.length-overlap;
  const loop = context.createBuffer(recording.numberOfChannels,length,recording.sampleRate);
  for (let channel = 0; channel < recording.numberOfChannels; channel++) {
    const input = recording.getChannelData(channel);
    const output = loop.getChannelData(channel);
    output.set(input.subarray(0,length));
    for (let i = 0; i < overlap; i++) {
      const blend = .5-.5*Math.cos(Math.PI*i/overlap);
      output[i] = input[length+i]*(1-blend)+input[i]*blend;
    }
  }
  return loop;
}

class RecordedFoley {
  constructor(recordings, muted, volume) {
    this.recordings = recordings;
    this.muted = muted;
    this.volume = volume;
    this.buffers = new Map();
    this.voices = new Set();
    this.variant = -1;
  }

  unlock() {
    if (this.muted || this.volume <= 0 || document.hidden || this.disposed) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      if (!this.context) {
        const context = this.context = new Audio();
        this.output = context.createGain();
        this.output.gain.value = this.volume*.7;
        this.output.connect(context.destination);
        context.addEventListener('statechange', () => {
          if (context.state !== 'running') this.stopAll();
        });
        for (const tool of ['sponge','brush']) {
          for (const file of Object.values(this.recordings[tool] || {})) this.load(file,true);
        }
        for (const file of [...this.recordings.spray,...this.recordings.foam]) this.load(file,false);
      }
      if (this.context.state !== 'running') this.context.resume()?.catch(() => {});
    } catch {
      // Audio is optional. A blocked or unavailable context must not stop play.
    }
  }

  load(file, loop) {
    if (!file || this.buffers.has(file)) return;
    const context = this.context;
    const entry = {};
    this.buffers.set(file,entry);
    entry.pending = fetch(new URL('assets/audio/'+file,document.baseURI))
      .then(response => {
        if (!response.ok) throw new Error(`Audio file could not load: ${file}`);
        return response.arrayBuffer();
      })
      .then(bytes => new Promise((resolve,reject) => context.decodeAudioData(bytes,resolve,reject)))
      .then(buffer => {
        if (this.disposed) return;
        entry.buffer = loop ? makeFoleyLoop(context,buffer) : buffer;
        if (this.gesture?.tool !== 'spray') this.updateBed();
      })
      .catch(error => {
        if (!this.disposed) console.warn('Cleaning Club Foley:',error);
      });
  }

  startGesture(tool, material) {
    this.stopAll();
    this.unlock();
    if (!this.context || this.muted || this.volume <= 0 || document.hidden || this.disposed) return;
    this.gesture = {tool,material,speed:0};
    if (tool !== 'spray') return;
    const files = this.recordings.spray.filter(file => this.buffers.get(file)?.buffer);
    if (!files.length) return;
    this.variant = (this.variant+1)%files.length;
    this.spray = this.play(files[this.variant],false,2800,.57);
  }

  updateGesture({speed, material, tool}) {
    if (!this.gesture || this.gesture.tool !== tool || tool === 'spray') return;
    const gesture = this.gesture;
    gesture.material = material;
    gesture.speed += (Math.max(0,Math.min(1500,speed))-gesture.speed)*.46;
    this.updateBed();
    clearTimeout(this.stillTimer);
    this.stillTimer = setTimeout(() => {
      if (this.gesture !== gesture) return;
      gesture.speed = 0;
      this.updateBed();
    },80);
  }

  updateBed() {
    const gesture = this.gesture;
    if (!gesture || gesture.tool === 'spray') return;
    const {tool,material,speed} = gesture;
    const files = this.recordings[tool] || {};
    const preferred = files[material];
    const file = this.buffers.get(preferred)?.buffer ? preferred : files[foleyDefaults[tool]];
    const [cutoff, scale] = foleyTone[material] || foleyTone[foleyDefaults[tool]];
    if (speed > 0 && this.bed?.file !== file && this.buffers.get(file)?.buffer) {
      this.fade(this.bed,.2);
      this.bed = this.play(file,true,cutoff,0);
    }
    if (!this.bed && speed > 0) this.bed = this.play(file,true,cutoff,0);
    if (!this.bed) return;
    const travel = 1-Math.exp(-speed/480);
    const now = this.context.currentTime;
    this.bed.cutoff.setTargetAtTime(cutoff*(.88+.18*travel),now,.075);
    this.bed.gain.setTargetAtTime((.28+.32*travel)*scale*Math.sqrt(travel),now,speed ? .045 : .047);
  }

  play(file, loop, cutoff, level) {
    const buffer = this.buffers.get(file)?.buffer;
    if (!buffer) return null;
    const context = this.context;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = .5;
    filter.frequency.value = cutoff;
    const levelNode = context.createGain();
    levelNode.gain.value = 0;
    source.connect(filter);
    filter.connect(levelNode);
    levelNode.connect(this.output);
    const voice = {file,source,cutoff:filter.frequency,gain:levelNode.gain,end:context.currentTime+buffer.duration};
    this.voices.add(voice);
    source.onended = () => {
      this.voices.delete(voice);
      source.disconnect();
      filter.disconnect();
      levelNode.disconnect();
    };
    const offset = loop ? Math.random()*buffer.duration : 0;
    source.start(0,offset);
    voice.gain.setTargetAtTime(level,context.currentTime,loop ? .045 : .012);
    return voice;
  }

  fade(voice, duration) {
    if (!voice || !this.voices.has(voice) || voice.stopping) return;
    voice.stopping = true;
    const now = this.context.currentTime;
    voice.gain.setTargetAtTime(0,now,duration/5);
    voice.source.stop(now+duration);
  }

  endGesture() {
    const gesture = this.gesture;
    this.gesture = null;
    clearTimeout(this.stillTimer);
    this.fade(this.bed,.22);
    this.bed = null;
    // Let the recorded trigger finish naturally, with an occasional quiet
    // accent after the burst. No stamp or motion event can retrigger it.
    if (gesture?.tool === 'spray' && this.spray && Math.random() < .45) {
      const files = this.recordings.foam;
      const file = files[Math.floor(Math.random()*files.length)];
      const remaining = Math.max(0,this.spray.end-this.context.currentTime);
      this.foamTimer = setTimeout(() => this.play(file,false,1900,.19),(remaining+.12)*1000);
    }
    this.spray = null;
  }

  stopAll() {
    this.gesture = null;
    this.bed = null;
    this.spray = null;
    clearTimeout(this.stillTimer);
    clearTimeout(this.foamTimer);
    for (const voice of this.voices) this.fade(voice,.13);
  }

  set(muted, volume) {
    this.muted = muted;
    this.volume = volume;
    if (muted || volume <= 0) this.stopAll();
    if (this.output) this.output.gain.setTargetAtTime(muted ? 0 : volume*.7,this.context.currentTime,.03);
  }

  dispose() {
    this.stopAll();
    this.disposed = true;
    this.buffers.clear();
    if (this.context && this.context.state !== 'closed') this.context.close()?.catch(() => {});
  }
}
