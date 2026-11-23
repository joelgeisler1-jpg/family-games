import { angleBetween, angleDelta, clamp, distance, offset, projection, aircraftTypes } from './airfield.js'
import { airspeed } from './aircraft.js'

const helipadCaptureSpeed = 5

export function matchingApproach(plane, previous, destination) {
  if (!destination || destination.id !== plane.destinationId || plane.route?.destinationId !== destination.id || plane.landing) return false
  if (destination.type === 'helipad') {
    if (plane.route.cursor < plane.route.padApproachIndex) return false
    return plane.kind === 'heli' && distance(plane, destination) <= destination.radius && airspeed(plane) <= helipadCaptureSpeed
  }
  if (plane.kind === 'heli') return false
  if (Math.abs(angleDelta(plane.heading, destination.heading)) > destination.angle) return false
  const before = offset(destination, destination.heading, -21)
  const after = offset(destination, destination.heading, 25)
  const approach = projection(before, after, plane)
  if (approach < 0 || approach > 1) return false
  const along = offset(before, destination.heading, approach * 46)
  const t = clamp(projection(previous, plane, along), 0, 1)
  const closest = { x: previous.x + (plane.x - previous.x) * t, y: previous.y + (plane.y - previous.y) * t }
  return distance(along, closest) <= destination.radius * 0.66
}

export function advanceLanding(plane, dt, destination) {
  const landing = plane.landing
  landing.time += dt
  if (destination.type === 'helipad') {
    const duration = aircraftTypes[plane.kind].landingDuration
    const progress = clamp(landing.time / duration, 0, 1)
    const blend = progress * progress * (3 - 2 * progress)
    // Preserve the incoming velocity at capture and be stationary at touchdown.
    const travel = (landing.speed ?? 0) * duration * progress * (1 - progress) ** 2
    const drift = offset(landing, landing.heading, travel)
    const next = {
      x: drift.x + (destination.x - landing.x) * blend,
      y: drift.y + (destination.y - landing.y) * blend,
    }
    landing.track = angleBetween(plane, next)
    plane.speed = progress === 1 ? 0 : distance(plane, next) / dt
    Object.assign(plane, next)
    return progress === 1
  }
  const progress = clamp(landing.time / 1.55, 0, 1)
  const forward = 33 + 114 * (1 - (1 - progress) ** 2)
  const target = offset(destination, destination.heading, forward)
  const align = Math.min(progress * 3, 1)
  const blend = align * align * (3 - 2 * align)
  const drift = offset(landing, landing.heading, aircraftTypes[plane.kind].speed * landing.time)
  plane.x = drift.x + (target.x - drift.x) * blend
  plane.y = drift.y + (target.y - drift.y) * blend
  plane.heading = landing.heading + angleDelta(landing.heading, destination.heading) * blend
  return progress === 1
}
