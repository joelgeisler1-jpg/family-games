export const width = 680
export const height = 780
export const step = 1 / 60

export const aircraftTypes = {
  jet: { label: 'Airliner', speed: 34, turn: 1.25, size: 1.18, collisionRadius: 15 },
  prop: { label: 'Light plane', speed: 26, turn: 1.9, size: 0.92, collisionRadius: 12 },
  turbo: { label: 'Turboprop', speed: 30, turn: 1.53, size: 1.06, collisionRadius: 14 },
}

export const runwaySnapRadius = 65

export function runway(id, label, shape, color, x, y, heading, length, width, radius, angle) {
  return { id, label, shape, color, x, y, heading, length, width, radius, angle, type: 'runway', snapRadius: runwaySnapRadius }
}

export const coastalDestinations = {
  '09': runway('09', 'Main runway', 'diamond', '#ffb36a', 237, 360, 0, 359, 54, 37, 0.93),
  '27': runway('27', 'Short runway', 'circle', '#80e6ff', 491, 531, Math.PI, 283, 37, 35, 1.08),
}

export function destinationGate(destination) {
  return offset(destination, destination.heading, -17)
}

export const clamp = (value, low, high) => Math.max(low, Math.min(high, value))
export const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
export const angleBetween = (a, b) => Math.atan2(b.y - a.y, b.x - a.x)
export const angleDelta = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

export function offset(point, heading, amount) {
  return {
    x: point.x + Math.cos(heading) * amount,
    y: point.y + Math.sin(heading) * amount,
  }
}

export function projection(start, end, point) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  return ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy || 1)
}
