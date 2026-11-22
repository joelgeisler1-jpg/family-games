'use strict';

// Short, shaped textures generated locally from noise. Each gesture plays a
// fading grain, so there are no periodic tones or continuous audio loops.
const cleaningAudio = {
  muted: savedAudio('familyArcadeCleaningMuted') !== 'false',
  volume: Number(savedAudio('familyArcadeCleaningVolume') ?? 24) / 100,
  play(tool) {
    if (this.muted || this.volume <= 0) return;
    const now = performance.now();
    if (now < (this.nextGrain || 0)) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      if (!this.context) {
        this.context = new Audio();
        this.output = this.context.createGain();
        this.output.connect(this.context.destination);
        this.buffers = {};
      }
      const ac = this.context;
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      this.output.gain.setTargetAtTime(this.volume*.45, ac.currentTime, .035);
      this.nextGrain = now + (tool === 'spray' ? 460 : 155);
      const source = ac.createBufferSource();
      source.buffer = this.buffers[tool] ||= this.makeTexture(tool, ac);
      source.playbackRate.value = .94+Math.random()*.12;
      source.connect(this.output);
      source.onended = () => source.disconnect();
      source.start();
    } catch { /* The game is playable without Web Audio. */ }
  },
  set(muted, volume) {
    this.muted = muted;
    this.volume = volume;
    if (this.output) this.output.gain.setTargetAtTime(muted ? 0 : volume*.45, this.context.currentTime, .025);
  },
  makeTexture(tool, ac) {
    const duration = { sponge: .29, brush: .22, spray: .54 }[tool];
    const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate*duration), ac.sampleRate);
    const samples = buffer.getChannelData(0);
    let soft = 0;
    let texture = 0;
    for (let i = 0; i < samples.length; i++) {
      const time = i/ac.sampleRate;
      const noise = Math.random()*2-1;
      soft = .98*soft+.02*noise;
      texture = .79*texture+.21*noise;
      const fade = Math.sin(Math.PI*i/samples.length)**1.2;
      if (tool === 'sponge') samples[i] = (.9*soft+.23*texture)*fade*(.7+.3*Math.sin(i*.00062));
      if (tool === 'brush') samples[i] = (texture-soft)*fade*(.25+.19*Math.sin(i*.0063)**2);
      if (tool === 'spray') {
        const air = (texture-soft)*Math.max(0, 1-time/.31)**1.7*Math.min(1,time/.045)*.48;
        const bubbles = soft * [.28,.36,.43].reduce((sum, center) =>
          sum+Math.exp(-((time-center)**2)/.00009), 0)*.48;
        samples[i] = air+bubbles;
      }
    }
    return buffer;
  }
};

function savedAudio(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
