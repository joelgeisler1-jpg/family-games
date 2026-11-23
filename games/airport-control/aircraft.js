import { angleBetween, angleDelta, clamp, distance, offset, projection, aircraftTypes } from './airfield.js'

export function newAircraft(id, kind, destinationId, entry) {
  const plane = {
    id, kind, destinationId, ...entry, route: null, warning: 0, escape: false,
    landing: null, missed: false, age: 0,
  }
  if (kind === 'heli') plane.speed = aircraftTypes.heli.speed
  return plane
}

export function airspeed(plane) {
  const cruiseSpeed = aircraftTypes[plane.kind].speed
  return plane.kind === 'heli' ? plane.speed ?? cruiseSpeed : cruiseSpeed
}

export const isAirborne = (plane) => !plane.landing || plane.kind === 'heli'

function routeTarget(plane, route, type) {
  const { points } = route
  const turnRadius = type.speed / type.turn
  const reach = turnRadius * 0.62
  while (route.cursor < points.length) {
    // A pad approach keeps steering toward the center until capture.
    if (route.padApproachIndex !== undefined && route.cursor === points.length - 1) break
    const next = points[route.cursor]
    const previous = points[route.cursor - 1]
    const gap = distance(plane, next)
    const passed = projection(previous, next, plane) >= 1 && gap < reach * 3
    // A point inside a tight turn can fall behind the aircraft. Advance along
    // the pilot's route so it can round the corner instead of orbiting a sample.
    const behind = gap < 2 * turnRadius &&
      Math.abs(angleDelta(plane.heading, angleBetween(plane, next))) > Math.PI / 2
    if (gap > reach && !passed && !behind) break
    route.cursor++
  }
  if (route.cursor >= points.length) return null

  let target = points[route.cursor]
  let lookAhead = 12
  for (let index = route.cursor + 1; index < points.length; index++) {
    const next = points[index]
    const gap = distance(target, next)
    if (gap >= lookAhead) return offset(target, angleBetween(target, next), lookAhead)
    lookAhead -= gap
    target = next
  }
  return target
}

export function moveAircraft(plane, dt) {
  const type = aircraftTypes[plane.kind]
  const previous = { x: plane.x, y: plane.y }
  if (plane.route) {
    const target = routeTarget(plane, plane.route, type)
    if (target) {
      const turn = angleDelta(plane.heading, angleBetween(plane, target))
      plane.heading = angleDelta(0, plane.heading + clamp(turn, -type.turn * dt, type.turn * dt))
    } else {
      plane.missed = plane.route.cleared
      plane.route = null
    }
  }
  if (plane.kind === 'heli') {
    const route = plane.route
    const approaching = route?.padApproachIndex !== undefined && route.cursor >= route.padApproachIndex
    const desired = approaching
      ? clamp(distance(plane, route.points.at(-1)) * 0.85, 1, type.speed)
      : type.speed
    const speed = airspeed(plane)
    plane.speed = speed + clamp(desired - speed, -12 * dt, 9 * dt)
  }
  Object.assign(plane, offset(plane, plane.heading, airspeed(plane) * dt))
  plane.age += dt
  return previous
}
