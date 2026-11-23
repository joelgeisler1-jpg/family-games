// Audio is synthesized locally, with no downloads or external services.
// iOS Safari only permits playback after the player explicitly enables sound.
export function landingSoundProfile(kind) {
  if (kind === 'jet') return { base: 155, end: 62, duration: 0.88, brightness: 0.13 }
  if (kind === 'prop') return { base: 230, end: 102, duration: 0.64, brightness: 0.075 }
  return null
}

export class TowerAudio {
  enabled = false
  context = null

  async toggle() {
    if (this.enabled) {
      this.enabled = false
      return
    }
    try {
      const Audio = window.AudioContext || window.webkitAudioContext
      if (!Audio) return
      this.context ??= new Audio()
      await this.context.resume()
      this.enabled = this.context.state === 'running'
      this.play('select')
    } catch {
      this.enabled = false
    }
  }

  tone(frequency, at, length, volume = 0.045, type = 'sine') {
    const ctx = this.context
    const oscillator = ctx.createOscillator()
    const envelope = ctx.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, at)
    envelope.gain.setValueAtTime(0.0001, at)
    envelope.gain.exponentialRampToValueAtTime(volume, at + 0.025)
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + length)
    oscillator.connect(envelope).connect(ctx.destination)
    oscillator.start(at)
    oscillator.stop(at + length + 0.015)
  }

  // Distinct, short landing roll sounds: low jet turbine sweep or light
  // propeller flutter. Their simple synthesized layers keep the game offline.
  landingAircraft(kind) {
    const profile = landingSoundProfile(kind)
    if (!profile) return
    const ctx = this.context
    const start = ctx.currentTime
    const { base, end, duration, brightness } = profile
    const rumble = ctx.createOscillator()
    const gain = ctx.createGain()
    rumble.type = kind === 'jet' ? 'sawtooth' : 'triangle'
    rumble.frequency.setValueAtTime(base, start)
    rumble.frequency.exponentialRampToValueAtTime(end, start + duration)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(brightness, start + 0.055)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = kind === 'jet' ? 550 : 430
    rumble.connect(lowpass).connect(gain).connect(ctx.destination)
    rumble.start(start)
    rumble.stop(start + duration + 0.015)

    if (kind === 'prop') {
      // A few restrained rotor-like ticks suggest the prop slowing down.
      for (let i = 0; i < 5; i++) {
        this.tone(120 + i * 13, start + 0.06 + i * 0.095, 0.075, 0.018, 'triangle')
      }
    }
  }

  play(event, aircraftKind = null) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return
    if (event === 'landing') this.landingAircraft(aircraftKind)
    const notes = {
      select: [620],
      landing: [523, 659, 784],
      warning: [350, 294],
      over: [392, 330, 262],
    }
    const frequencies = notes[event]
    if (!frequencies) return
    for (const [index, frequency] of frequencies.entries()) {
      this.tone(frequency, this.context.currentTime + index * 0.105, event === 'landing' ? 0.25 : 0.19, event === 'landing' ? 0.032 : 0.052)
    }
  }
}
