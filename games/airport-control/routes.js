import { clamp, distance, height, offset, width } from './airfield.js'

const spacing = 9
const snapRadius = 112

// A generous, screen-size-independent magnetic target around the runway gate.
// Only the aircraft's own runway can be selected by the caller.
export function runwaySnap(point, runway) {
  const gate = offset(runway, runway.heading, -17)
  return distance(point, gate) <= snapRadius
    ? { gate, lead: offset(runway, runway.heading, -105) }
    : null
}

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

  const snap = runwaySnap(draft.at(-1), runway)
  const cleared = Boolean(snap)
  if (snap) {
    // Take control of the final approach as soon as the finger comes close to
    // the correct gate. Remove the hand-drawn squiggle immediately around the
    // threshold, then join the runway's upstream centreline.
    let join = points.length - 1
    while (join > 1 && distance(points[join - 1], snap.gate) < snapRadius) join--
    points.splice(join)
    // Keep the actual aircraft position; guidance never teleports the plane.
    const last = points.at(-1)
    if (distance(last, snap.lead) > 7) points.push(snap.lead)
    for (const upstream of [75, 47, 17, 0, -38]) {
      const waypoint = offset(runway, runway.heading, -upstream)
      if (distance(points.at(-1), waypoint) > 5) points.push(waypoint)
    }
  }

  const softened = [points[0]]
  for (let index = 1; index < points.length - 1; index++) {
    const a = points[index - 1]
    const b = points[index]
    const c = points[index + 1]
    softened.push({ x: (a.x + 2 * b.x + c.x) / 4, y: (a.y + 2 * b.y + c.y) / 4 })
  }
  softened.push(points.at(-1))
  return { points: softened, cleared, cursor: 1 }
}
