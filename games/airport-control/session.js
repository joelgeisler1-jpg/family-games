import { newAircraft, moveAircraft } from './aircraft.js'
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
  constructor(storage) {
    this.storage = storage
    this.best = loadBest(storage)
    this.reset()
  }

  reset() {
    this.mode = 'ready'
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
    const arrival = chooseArrival(this.arrivals, this.planes)
    if (!arrival) {
      this.nextArrival = this.time + 1
      return
    }
    this.planes.push(newAircraft(++this.arrivals, arrival.kind, arrival.entry))
    this.events.push({ type: 'arrival', kind: arrival.kind })
    this.nextArrival = this.time + (this.arrivals === 1 ? 9 : arrivalInterval(this.time))
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

    this.planes = this.planes.filter((plane) => !plane.landing || !advanceLanding(plane, dt))
    for (let index = 0; index < airborne.length; index++) {
      const plane = airborne[index]
      if (matchingApproach(plane, previous[index])) this.land(plane)
    }
    if (this.time >= this.nextArrival) this.spawn()
  }

  land(plane) {
    plane.landing = { x: plane.x, y: plane.y, heading: plane.heading, time: 0 }
    plane.route = null
    this.score++
    this.streak = this.time - this.lastLanding <= 34 ? this.streak + 1 : 1
    this.lastLanding = this.time
    if (this.score > this.best) {
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
}
