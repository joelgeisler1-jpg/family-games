import assert from 'node:assert/strict'
import test from 'node:test'
import { projectedHeading, projectionStretch, screenToAirspace } from '../landscape-projection.js'

test('wide 2:1 radar display maps touch coordinates back to original simulation', () => {
  const bounds = { left: 18, top: 64, width: 920, height: 680 }
  assert.deepEqual(screenToAirspace(18, 64, bounds), { x: 0, y: 0 })
  assert.deepEqual(screenToAirspace(478, 404, bounds), { x: 340, y: 390 })
  assert.deepEqual(screenToAirspace(938, 744, bounds), { x: 680, y: 780 })
  const gate = { x: 237, y: 360 }
  const press = { x: bounds.left + gate.x * bounds.width / 680, y: bounds.top + gate.y * bounds.height / 780 }
  const mapped = screenToAirspace(press.x, press.y, bounds)
  assert.ok(Math.abs(mapped.x - gate.x) < 1e-9)
  assert.ok(Math.abs(mapped.y - gate.y) < 1e-9)
})

test('sprite compensation stays neutral in portrait and corrects wide landscape heading', () => {
  assert.equal(projectionStretch(680, 780), 1)
  assert.equal(projectionStretch(920, 680), (920 / 680) / (680 / 780))
  assert.equal(projectedHeading(0, 1.6), 0)
  assert.equal(projectedHeading(Math.PI / 2, 1.6), Math.PI / 2)
  assert.ok(projectedHeading(Math.PI / 4, 1.6) < Math.PI / 4)
  assert.equal(projectionStretch(0, 0), 1)
})
