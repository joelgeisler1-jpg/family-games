import { clamp, destinationGate, distance, height, offset, projection, width } from './airfield.js'

const spacing = 9

export function extendDraft(points, point) {
  const bounded = { x: clamp(point.x, 4, width - 4), y: clamp(point.y, 4, height - 4) }
  const previous = points.at(-1)
  const length = distance(previous, bounded)
  const count = Math.ceil(length / spacing)
  if (length < 4 || points.length >= 750) return
  for (let index = 1; index <= count && points.length < 750; index++) {
    const fraction = index / count
    points.push({
      x: previous.x + (bounded.x - previous.x) * fraction,
      y: previous.y + (bounded.y - previous.y) * fraction,
    })
  }
}

export function planRoute(aircraft, draft, runway) {
  if (!draft.length) return null
  // Discard only the prefix the moving aircraft has already flown past.
  let start = 0
  let nearest = distance(aircraft, draft[0])
  const prefix = Math.min(draft.length, 15)
  for (let index = 1; index < prefix; index++) {
    const gap = distance(aircraft, draft[index])
    if (gap < nearest) {
      nearest = gap
      start = index
    }
  }

  const points = [{ x: aircraft.x, y: aircraft.y }]
  for (let index = start; index < draft.length; index++) {
    const point = draft[index]
    if (distance(points.at(-1), point) >= 5) points.push(point)
  }
  if (points.length < 2) return null

  const gate = destinationGate(runway)
  const end = draft.at(-1)
  const cleared = runway.id === aircraft.destinationId && distance(end, gate) <= runway.snapRadius
  if (cleared) {
    // Replace the finger's endpoint with an aligned final whenever the route
    // reached the approach from upstream. Keep intentional go-arounds intact.
    const lead = offset(runway, runway.heading, -59)
    let join = points.length - 1
    while (join > 1 && distance(points[join - 1], gate) < 43) join--
    points.splice(join)
    const last = points.at(-1)
    if (projection(lead, runway, last) < 0.18 && distance(last, lead) > 12) points.push(lead)
    points.push({ x: runway.x, y: runway.y }, offset(runway, runway.heading, 38))
  }

  const softened = [points[0]]
  for (let index = 1; index < points.length - 1; index++) {
    const a = points[index - 1]
    const b = points[index]
    const c = points[index + 1]
    softened.push({ x: (a.x + 2 * b.x + c.x) / 4, y: (a.y + 2 * b.y + c.y) / 4 })
  }
  softened.push(points.at(-1))
  return { points: softened, cleared, destinationId: cleared ? runway.id : null, cursor: 1 }
}
