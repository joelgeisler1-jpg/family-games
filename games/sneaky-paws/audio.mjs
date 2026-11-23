let audioContext = null;
let soundEnabled = true;
function toggleSound() {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}
function playSound(name) {
  if (!soundEnabled) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const options = {
      alarm: { notes: [470, 330, 230], type: 'sawtooth', volume: 0.038, step: 0.087, duration: 0.21 },
      win: { notes: [440, 550, 670, 880], type: 'sine', volume: 0.052, step: 0.115, duration: 0.28 },
      key: { notes: [690, 950, 1190], type: 'sine', volume: 0.044, step: 0.09, duration: 0.2 },
      switch: { notes: [350, 720, 910], type: 'triangle', volume: 0.046, step: 0.075, duration: 0.15 },
      boing: {
        notes: [220, 320],
        type: 'triangle',
        volume: 0.048,
        step: 0.075,
        duration: 0.24,
        sweep: 1.4,
      },
      thud: {
        notes: [160, 95],
        type: 'triangle',
        volume: 0.042,
        step: 0.064,
        duration: 0.13,
        sweep: 0.55,
      },
      grip: {
        notes: [250, 460],
        type: 'triangle',
        volume: 0.025,
        step: 0.05,
        duration: 0.09,
        sweep: 1.22,
      },
      wind: { notes: [325], type: 'sine', volume: 0.014, step: 0, duration: 0.07, sweep: 1.1 },
      reel: { notes: [410, 600, 840], type: 'triangle', volume: 0.046, step: 0.095, duration: 0.19 },
      start: { notes: [290], type: 'sine', volume: 0.019, step: 0, duration: 0.095 },
      reset: { notes: [320, 220], type: 'triangle', volume: 0.028, step: 0.075, duration: 0.13 },
      hint: { notes: [660, 780], type: 'sine', volume: 0.027, step: 0.07, duration: 0.13 },
      notice: { notes: [380, 495], type: 'triangle', volume: 0.026, step: 0.1, duration: 0.15 },
      slide: { notes: [345], type: 'sine', volume: 0.016, step: 0, duration: 0.07, sweep: 1.08 },
      latch: { notes: [590, 760, 910], type: 'triangle', volume: 0.04, step: 0.07, duration: 0.16 },
      decoy: { notes: [690, 860, 690], type: 'sine', volume: 0.05, step: 0.17, duration: 0.24 },
      scanner: { notes: [290, 370], type: 'sawtooth', volume: 0.024, step: 0.095, duration: 0.13 },
    };
    const sound = options[name] || options.start,
      t = audioContext.currentTime;
    sound.notes.forEach((f, i) => {
      const at = t + i * sound.step,
        osc = audioContext.createOscillator(),
        gain = audioContext.createGain();
      osc.type = sound.type;
      osc.frequency.setValueAtTime(Math.max(40, f * (sound.sweep ? 1 / sound.sweep : 1)), at);
      if (sound.sweep)
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, f * sound.sweep), at + sound.duration);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(sound.volume, at + 0.013);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + sound.duration);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(at);
      osc.stop(at + sound.duration + 0.025);
    });
  } catch {}
}

export { playSound, toggleSound };
