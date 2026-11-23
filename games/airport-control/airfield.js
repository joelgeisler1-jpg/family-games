export const width = 680
export const height = 780
export const step = 1 / 60

export const runways = {
  jet: {
    name: 'Runway 09', number: '09', label: 'Airliner', color: '#ffb36a',
    ink: '#4d240c', x: 237, y: 360, heading: 0, length: 359, width: 54,
    radius: 37, angle: 0.93, speed: 34, turn: 1.25, size: 1.18, collisionRadius: 15,
  },
  prop: {
    name: 'Runway 27', number: '27', label: 'Light plane', color: '#80e6ff',
    ink: '#113b50', x: 491, y: 531, heading: Math.PI, length: 283, width: 37,
    radius: 35, angle: 1.08, speed: 26, turn: 1.9, size: 0.92, collisionRadius: 12,
  },
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
