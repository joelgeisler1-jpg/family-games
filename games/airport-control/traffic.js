import { distance, offset, runways } from './airfield.js'

const intervals = [30, 20, 15, 12, 8.6, 7.7, 7, 6.5]

export function arrivalInterval(seconds) {
  return intervals[Math.min(intervals.length - 1, Math.floor(seconds / 60))]
}

const west = (y, heading = 0) => ({ x: 27, y, heading })
const east = (y, heading = Math.PI) => ({ x: 653, y, heading })
const north = (x, heading = Math.PI / 2) => ({ x, y: 28, heading })
const south = (x, heading = -Math.PI / 2) => ({ x, y: 752, heading })
const entries = [
  [west(185, 0.20), north(183, 1.22), south(138, -1.25), west(616, -0.28), north(500), east(205, 2.89)],
  [east(606, 3.35), north(516, 1.92), south(536, -1.94), east(166, 2.97), south(305), west(640, -0.32)],
]

export function safeEntry(entry, kind, planes) {
  for (const plane of planes) {
    if (plane.landing) continue
    if (distance(entry, plane) < 122) return false
    // Protect a moving arrival's first five seconds even against a head-on entry.
    const incomingSpeed = runways[kind].speed
    const nearbySpeed = runways[plane.kind].speed
    for (let time = 1; time <= 5; time++) {
      const inbound = offset(entry, entry.heading, incomingSpeed * time)
      const nearby = offset(plane, plane.heading, nearbySpeed * time)
      if (distance(inbound, nearby) < 84) return false
    }
  }
  return true
}

export function chooseArrival(index, planes) {
  const kind = index % 2 === 0 ? 'jet' : 'prop'
  if (index === 0) return { kind, entry: { x: 61, y: 341, heading: 0.10 } }

  const deck = entries[index % 2]
  const first = kind === 'jet' ? west(366, -0.03) : east(539, Math.PI + 0.04)
  const starts = index < 4 ? [first, ...deck] : deck
  const shift = index < 4 ? 0 : Math.floor(index / 2) % deck.length
  for (let slot = 0; slot < starts.length; slot++) {
    const entry = starts[(shift + slot) % starts.length]
    if (safeEntry(entry, kind, planes)) return { kind, entry }
  }
  return null
}
