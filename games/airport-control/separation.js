import { clamp, height, offset, runways, width } from './airfield.js'

export function separation(a, b, beforeA, beforeB) {
  const x = beforeA.x - beforeB.x
  const y = beforeA.y - beforeB.y
  const dx = (a.x - b.x) - x
  const dy = (a.y - b.y) - y
  const speedSquared = dx * dx + dy * dy
  const t = speedSquared ? clamp(-(x * dx + y * dy) / speedSquared, 0, 1) : 0
  const closest = Math.hypot(x + dx * t, y + dy * t)
  const contact = runways[a.kind].collisionRadius + runways[b.kind].collisionRadius
  if (closest <= contact) return 3

  const futureA = offset(a, a.heading, runways[a.kind].speed * 1.4)
  const futureB = offset(b, b.heading, runways[b.kind].speed * 1.4)
  const current = Math.hypot(a.x - b.x, a.y - b.y)
  const projected = Math.hypot(futureA.x - futureB.x, futureA.y - futureB.y)
  if (current < contact + 23) return 2
  return current < 130 && projected < contact + 30 && projected < current ? 1 : 0
}

export function boundary(plane) {
  const margin = 25
  if (plane.x < -margin || plane.x > width + margin || plane.y < -margin || plane.y > height + margin) return 2
  if (plane.age < 3) return 0
  const future = offset(plane, plane.heading, runways[plane.kind].speed * 2.9)
  return Number(future.x < -8 || future.x > width + 8 || future.y < -8 || future.y > height + 8)
}
