// Naturalistic, noise-based Foley, using the same buffered-texture approach as
// Cleaning Club. These are original generated textures, NOT field recordings.
// No audio assets, network requests, or external dependencies are required.
const sampleRate = 24000

export function landingSoundProfile(kind) {
  if (kind === 'jet') return { base: 145, end: 72, duration: 1.55, brightness: 0.27 }
  if (kind === 'prop') return { base: 115, end: 60, duration: 1.17, brightness: 0.22 }
  return null
}

function randomSource(seed) {
  return () => {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return (seed >>> 0) / 4294967296
  }
}

// Composite moving air, rolling tyres, and turbine or propeller texture. A
// changing noisy spectrum avoids the electronic notes of oscillator-based FX.
export function buildLandingTexture(context, kind) {
  const profile = landingSoundProfile(kind)
  if (!profile) return null
  const count = Math.ceil(profile.duration * sampleRate)
  const buffer = context.createBuffer(1, count, sampleRate)
  const data = buffer.getChannelData(0)
  const random = randomSource(kind === 'jet' ? 314159 : 271828)
  let low = 0
  let mid = 0
  let tyre = 0
  let rotorPhase = 0
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate
    const progress = i / count
    const air = random() * 2 - 1
    low += (air - low) * (kind === 'jet' ? 0.025 : 0.045)
    mid += (air - mid) * 0.32
    tyre += (air - tyre) * 0.11
    // Gentle tyre contact at touchdown, engine rolls past and fades away.
    const attack = Math.min(1, t / 0.055)
    const fade = Math.pow(Math.max(0, 1 - progress), kind === 'jet' ? 1.2 : 1.65)
    const rumble = kind === 'jet'
      ? low * 2.2 + (mid - low) * 0.28
      : low * 1.15 + (mid - low) * 0.43
    let movement = 1
    if (kind === 'prop') {
      const rotorHz = 24 - progress * 11
      rotorPhase += rotorHz / sampleRate
      // Uneven blade pulses beneath the broadband airflow.
      movement = 0.52 + 0.48 * Math.pow(Math.max(0, Math.sin(rotorPhase * Math.PI * 2)), 2)
    } else {
      movement = 0.78 + 0.22 * Math.sin(2 * Math.PI * (7 * t - 1.6 * t * progress))
    }
    const wheelContact = Math.exp(-t * 21) * (tyre * 1.8 + (mid - low) * 0.45)
    const runwayRoll = (mid - low) * (0.085 + 0.09 * Math.sin(Math.PI * progress))
    const output = (rumble * movement + wheelContact + runwayRoll) * attack * fade
    data[i] = Math.max(-1, Math.min(1, output * 0.94))
  }
  return buffer
}

export class TowerAudio {
  enabled = false
  context = null
  buffers = {}
  activeLanding = new Set()

  async toggle() {
    if (this.enabled) {
      this.enabled = false
      this.stopLandings()
      return
    }
    try {
      const Audio = window.AudioContext || window.webkitAudioContext
      if (!Audio) return
      this.context ??= new Audio()
      await this.context.resume()
      this.enabled = this.context.state === 'running'
      // No automatic noise when sound is enabled.
    } catch {
      this.enabled = false
    }
  }

  stopLandings() {
    for (const voice of this.activeLanding) {
      try { voice.stop() } catch { /* Already finished. */ }
    }
    this.activeLanding.clear()
  }

  tone(frequency, at, length, volume = 0.025, type = 'sine') {
    const context = this.context
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, at)
    envelope.gain.setValueAtTime(0.0001, at)
    envelope.gain.exponentialRampToValueAtTime(volume, at + 0.025)
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + length)
    oscillator.connect(envelope).connect(context.destination)
    oscillator.start(at)
    oscillator.stop(at + length + 0.015)
  }

  landingAircraft(kind) {
    const profile = landingSoundProfile(kind)
    if (!profile) return
    const context = this.context
    const buffer = this.buffers[kind] ??= buildLandingTexture(context, kind)
    const source = context.createBufferSource()
    const envelope = context.createGain()
    const lowpass = context.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = kind === 'jet' ? 1450 : 1150
    envelope.gain.value = 0.46
    source.buffer = buffer
    source.connect(lowpass).connect(envelope).connect(context.destination)
    this.activeLanding.add(source)
    source.onended = () => {
      this.activeLanding.delete(source)
      source.disconnect()
      lowpass.disconnect()
      envelope.disconnect()
    }
    source.start()
  }

  play(event, aircraftKind = null) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return
    if (event === 'landing') {
      this.landingAircraft(aircraftKind)
      // Keep a quiet success cue underneath the aircraft's more natural sound.
      for (const [index, frequency] of [587, 740].entries()) {
        this.tone(frequency, this.context.currentTime + index * 0.11, 0.2, 0.013)
      }
      return
    }
    const notes = { select: [620], warning: [350, 294], over: [392, 330, 262] }
    for (const [index, frequency] of (notes[event] ?? []).entries()) {
      this.tone(frequency, this.context.currentTime + index * 0.09, 0.19, 0.052)
    }
  }
}
