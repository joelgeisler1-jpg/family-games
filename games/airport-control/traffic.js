import { aircraftTypes, distance, offset } from './airfield.js'
import { airspeed, isAirborne } from './aircraft.js'
import { coastalAirport } from './campaign.js'

export function arrivalInterval(seconds, airport = coastalAirport) {
  const { intervals } = airport.traffic
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
    if (!isAirborne(plane)) continue
    if (distance(entry, plane) < 122) return false
    // Protect a moving arrival's first five seconds even against a head-on entry.
    const incomingSpeed = aircraftTypes[kind].speed
    const nearbySpeed = airspeed(plane)
    for (let time = 1; time <= 5; time++) {
      const inbound = offset(entry, entry.heading, incomingSpeed * time)
      const nearby = offset(plane, plane.landing?.track ?? plane.heading, nearbySpeed * time)
      if (distance(inbound, nearby) < 84) return false
    }
  }
  return true
}

export function chooseArrival(index, planes, airport = coastalAirport) {
  const { opening, rotation } = airport.traffic
  const assignment = rotation[index % rotation.length]
  const preferred = opening[index]
  if (preferred && safeEntry(preferred, assignment.kind, planes)) return { ...assignment, entry: preferred }
  for (let attempt = 0; attempt < 44; attempt++) {
    const entry = entryCandidate(index, attempt)
    if (safeEntry(entry, assignment.kind, planes)) return { ...assignment, entry }
  }
  return null
}
