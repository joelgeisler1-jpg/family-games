import { angleDelta, clamp, distance, offset, projection, runways } from './airfield.js'

export function matchingApproach(plane, previous, candidate = plane.kind) {
  const runway = runways[candidate]
  if (candidate !== plane.kind || !plane.route?.cleared || plane.landing) return false
  if (Math.abs(angleDelta(plane.heading, runway.heading)) > runway.angle) return false
  const before = offset(runway, runway.heading, -21)
  const after = offset(runway, runway.heading, 25)
  const approach = projection(before, after, plane)
  if (approach < 0 || approach > 1) return false
  const along = offset(before, runway.heading, approach * 46)
  const t = clamp(projection(previous, plane, along), 0, 1)
  const closest = { x: previous.x + (plane.x - previous.x) * t, y: previous.y + (plane.y - previous.y) * t }
  return distance(along, closest) <= runway.radius * 0.66
}

export function advanceLanding(plane, dt) {
  const runway = runways[plane.kind]
  const landing = plane.landing
  landing.time += dt
  const progress = clamp(landing.time / 1.55, 0, 1)
  const forward = 33 + 114 * (1 - (1 - progress) ** 2)
  const target = offset(runway, runway.heading, forward)
  const align = Math.min(progress * 3, 1)
  const blend = align * align * (3 - 2 * align)
  const drift = offset(landing, landing.heading, runway.speed * landing.time)
  plane.x = drift.x + (target.x - drift.x) * blend
  plane.y = drift.y + (target.y - drift.y) * blend
  plane.heading = landing.heading + angleDelta(landing.heading, runway.heading) * blend
  return progress === 1
}
