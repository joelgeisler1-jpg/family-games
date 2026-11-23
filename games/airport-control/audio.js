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

  play(event) {
    if (!this.enabled || this.context.state !== 'running') return
    const notes = {
      select: [620],
      landing: [523, 659, 784],
      warning: [350, 294],
      over: [392, 330, 262],
    }
    const context = this.context
    for (const [index, frequency] of notes[event].entries()) {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      const at = context.currentTime + index * 0.09
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      envelope.gain.setValueAtTime(0.001, at)
      envelope.gain.exponentialRampToValueAtTime(0.062, at + 0.025)
      envelope.gain.exponentialRampToValueAtTime(0.001, at + 0.19)
      oscillator.connect(envelope).connect(context.destination)
      oscillator.start(at)
      oscillator.stop(at + 0.2)
    }
  }
}
