import { newAircraft, moveAircraft } from './aircraft.js'
import { campaignLevels, coastalAirport, loadCampaignProgress, recordCompletion } from './campaign.js'
import { advanceLanding, matchingApproach } from './landing.js'
import { boundary, separation } from './separation.js'
import { arrivalInterval, chooseArrival } from './traffic.js'

const bestKey = 'family-arcade.airport-control.best.v1'

function loadBest(storage) {
  try {
    const value = Number(storage?.getItem(bestKey))
    return Number.isSafeInteger(value) && value >= 0 ? value : 0
  } catch {
    return 0
  }
}

export class Session {
  constructor(storage, playMode = 'endless') {
    this.storage = storage
    this.best = loadBest(storage)
    this.progress = loadCampaignProgress(storage)
    this.reset(playMode, coastalAirport.id)
  }

  reset(playMode = this.playMode, levelId = this.airport.id) {
    const level = campaignLevels.find(({ id }) => id === levelId && this.progress.unlockedLevels.includes(id))
    this.airport = playMode === 'campaign' ? level ?? coastalAirport : coastalAirport
    this.playMode = playMode
    this.mode = 'ready'
    this.closing = false
    this.time = 0
    this.score = 0
    this.planes = []
    this.nextArrival = 0
    this.arrivals = 0
    this.lastLanding = -Infinity
    this.streak = 0
    this.events = []
  }

  start() {
    if (this.mode === 'ready') {
      this.mode = 'playing'
      this.spawn()
    }
  }

  pause() {
    if (this.mode === 'playing') this.mode = 'paused'
  }

  resume() {
    if (this.mode === 'paused') this.mode = 'playing'
  }

  spawn() {
    if (this.closing) return
    const arrival = chooseArrival(this.arrivals, this.planes, this.airport)
    if (!arrival) {
      this.nextArrival = this.time + 1
      return
    }
    this.planes.push(newAircraft(++this.arrivals, arrival.kind, arrival.destinationId, arrival.entry))
    this.events.push({ type: 'arrival', kind: arrival.kind, destinationId: arrival.destinationId })
    this.nextArrival = this.time + (this.airport.traffic.openingGaps[this.arrivals - 1] ?? arrivalInterval(this.time, this.airport))
  }

  finish(reason, planes) {
    this.mode = 'over'
    this.events.push({ type: 'over', reason, planes })
  }

  step(dt) {
    if (this.mode !== 'playing') return
    this.time += dt
    const airborne = this.planes.filter((plane) => !plane.landing)
    const previous = airborne.map((plane) => moveAircraft(plane, dt))

    for (let index = 0; index < airborne.length; index++) {
      const plane = airborne[index]
      plane.warning = 0
      const edge = boundary(plane)
      plane.escape = edge === 1
      if (edge === 2) {
        this.finish('escape', [plane])
        return
      }
    }

    for (let a = 0; a < airborne.length; a++) {
      for (let b = a + 1; b < airborne.length; b++) {
        const first = airborne[a]
        const second = airborne[b]
        const threat = separation(first, second, previous[a], previous[b])
        if (threat === 3) {
          first.warning = second.warning = 2
          this.finish('collision', [first, second])
          return
        }
        first.warning = Math.max(first.warning, threat)
        second.warning = Math.max(second.warning, threat)
      }
    }

    this.planes = this.planes.filter((plane) => !plane.landing || !advanceLanding(plane, dt, this.destinationFor(plane)))
    for (let index = 0; index < airborne.length; index++) {
      const plane = airborne[index]
      if (matchingApproach(plane, previous[index], this.destinationFor(plane))) this.land(plane)
    }

    // Assess qualification before any arrival due on this step.
    const level = this.level
    if (level && this.score >= level.minLandings && this.elapsedSeconds >= level.minSeconds) {
      this.closing = true
      if (this.planes.length === 0) {
        this.mode = 'complete'
        recordCompletion(this.storage, this.progress, level.id)
        this.events.push({ type: 'complete' })
      }
    }
    if (!this.closing && this.time >= this.nextArrival) this.spawn()
  }

  land(plane) {
    plane.landing = { x: plane.x, y: plane.y, heading: plane.heading, time: 0 }
    plane.route = null
    this.score++
    this.streak = this.time - this.lastLanding <= 34 ? this.streak + 1 : 1
    this.lastLanding = this.time
    if (this.playMode === 'endless' && this.score > this.best) {
      this.best = this.score
      try {
        this.storage?.setItem(bestKey, String(this.best))
      } catch {
        // A blocked storage provider should not interrupt the round.
      }
    }
    this.events.push({ type: 'landing', plane, streak: this.streak })
  }

  get traffic() {
    return this.planes.filter((plane) => !plane.landing).length
  }

  get level() {
    return this.playMode === 'campaign' ? this.airport : null
  }

  destinationFor(plane) {
    return this.airport.destinations[plane.destinationId]
  }

  get elapsedSeconds() {
    // Account for rounding when a fixed simulation step reaches a whole second.
    return Math.floor(this.time + 1e-9)
  }
}
