import { angleBetween, angleDelta, clamp, distance, offset, projection, runways } from './airfield.js'

export function newAircraft(id, kind, entry) {
  return {
    id, kind, ...entry, route: null, warning: 0, escape: false,
    landing: null, missed: false, age: 0,
  }
}

function routeTarget(plane, route, type) {
  const { points } = route
  const turnRadius = type.speed / type.turn
  const reach = turnRadius * 0.62
  while (route.cursor < points.length) {
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
  const type = runways[plane.kind]
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
  Object.assign(plane, offset(plane, plane.heading, type.speed * dt))
  plane.age += dt
  return previous
}
