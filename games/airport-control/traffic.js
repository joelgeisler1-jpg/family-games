import { distance, offset, runways } from './airfield.js'

// A brisk but progressive flow: 5 arrivals/minute at the start, building to 12.
const intervals = [12, 10, 8.5, 7.5, 6.5, 6, 5.5, 5]

export function arrivalInterval(seconds) {
  return intervals[Math.min(intervals.length - 1, Math.floor(seconds / 60))]
}

// Rotate preferred arrivals through all four borders and use a changing lane
// within each side. If traffic blocks that location, try another side/lane.
// Deterministic choices make failures reproducible in automated tests.
export function entryCandidate(index, attempt = 0) {
  const side = (index - 2 + attempt) % 4
  const lane = (index * 7 + Math.floor(attempt / 4) * 3 + attempt * 5) % 11
  const fraction = (lane + 0.5) / 11
  const wobble = ((index * 3 + attempt * 7) % 7 - 3) * 0.055
  const y = 87 + fraction * 606
  const x = 80 + fraction * 520
  if (side === 0) return { x: 27, y, heading: wobble }
  if (side === 1) return { x: 653, y, heading: Math.PI + wobble }
  if (side === 2) return { x, y: 28, heading: Math.PI / 2 + wobble }
  return { x, y: 752, heading: -Math.PI / 2 + wobble }
}

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
  // Keep the first two approaches familiar while the tutorial is active.
  if (index === 0) return { kind, entry: { x: 61, y: 341, heading: 0.10 } }
  if (index === 1) {
    const entry = { x: 653, y: 539, heading: Math.PI + 0.04 }
    if (safeEntry(entry, kind, planes)) return { kind, entry }
  }
  for (let attempt = 0; attempt < 44; attempt++) {
    const entry = entryCandidate(index, attempt)
    if (safeEntry(entry, kind, planes)) return { kind, entry }
  }
  return null
}
