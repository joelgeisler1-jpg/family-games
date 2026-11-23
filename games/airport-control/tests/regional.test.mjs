import assert from 'node:assert/strict'
import test from 'node:test'
import { aircraftTypes, coastalDestinations, destinationGate, offset, step } from '../airfield.js'
import { newAircraft } from '../aircraft.js'
import { regionalJunction } from '../campaign.js'
import { matchingApproach } from '../landing.js'
import { extendDraft, planRoute } from '../routes.js'
import { Session } from '../session.js'
import { chooseArrival, safeEntry } from '../traffic.js'

const key = 'family-arcade.airport-control.campaign.v1'

function regionalSession() {
  const legacy = { completedLevels: [1], unlockedLevels: [1] }
  const saved = new Map([[key, JSON.stringify(legacy)]])
  const storage = { getItem: (name) => saved.get(name), setItem: (name, value) => saved.set(name, value) }
  const game = new Session(storage, 'campaign')
  game.reset('campaign', 2)
  return game
}

test('legacy completion unlocks the Regional Junction and a new campaign still locks it', () => {
  const fresh = new Session(undefined, 'campaign')
  fresh.reset('campaign', 2)
  assert.equal(fresh.level.id, 1)
  const regional = regionalSession()
  assert.equal(regional.level, regionalJunction)
  regional.reset('endless', 2)
  assert.equal(regional.airport.id, 1)
  assert.equal(regional.level, null)
  regional.reset('campaign', 2)
  assert.equal(regional.level.id, 2)
})

test('runway snap includes 65 units but still requires the assigned destination and safe alignment', () => {
  for (const [kind, id] of [['jet', '09'], ['prop', '27']]) {
    const runway = coastalDestinations[id]
    const gate = destinationGate(runway)
    const plane = newAircraft(1, kind, id, offset(gate, runway.heading, -100))
    const inRange = { x: gate.x, y: gate.y + 65 }
    assert.equal(planRoute(plane, [plane, inRange], runway).destinationId, id)
    assert.equal(planRoute(plane, [plane, { ...inRange, y: inRange.y + 0.1 }], runway).cleared, false)
    plane.route = planRoute(plane, [plane, inRange], runway)
    Object.assign(plane, inRange, { heading: runway.heading })
    assert.equal(matchingApproach(plane, plane, runway), false)
  }
  const runway = regionalJunction.destinations['18']
  const gate = destinationGate(runway)
  const entry = offset(gate, runway.heading, -70)
  const inbound = newAircraft(1, 'jet', '09', entry)
  const diverted = newAircraft(2, 'jet', '18', entry)
  assert.equal(planRoute(inbound, [inbound, gate], runway).cleared, false)
  assert.equal(planRoute(diverted, [diverted, gate], runway).destinationId, '18')
  const { x, y, heading } = runway
  Object.assign(inbound, { x, y, heading, route: { destinationId: '18' } })
  assert.equal(matchingApproach(inbound, { x, y }, runway), false)
})

test('turboprops have distinct flight dynamics and blocked arrivals use a clear lane', () => {
  const { turbo, jet, prop } = aircraftTypes
  assert.ok(prop.speed < turbo.speed && turbo.speed < jet.speed)
  assert.ok(jet.turn < turbo.turn && turbo.turn < prop.turn)
  const preferred = chooseArrival(2, [], regionalJunction)
  const blocker = newAircraft(1, 'jet', '09', preferred.entry)
  const alternate = chooseArrival(2, [blocker], regionalJunction)
  assert.equal(alternate.kind, 'turbo')
  assert.equal(alternate.destinationId, '18')
  assert.notDeepEqual(alternate.entry, preferred.entry)
  assert.equal(safeEntry(alternate.entry, alternate.kind, [blocker]), true)
})

function regionalRoute(plane, runway) {
  const waypoints = []
  if (plane.id > 3) {
    if (runway.id === '09' && plane.x > 500 && Math.cos(plane.heading) < -0.8) {
      waypoints.push({ x: 107, y: plane.y > 450 ? 506 : 330 }, { x: 67, y: 423 })
    } else if (runway.id === '27' && plane.x < 130 && Math.cos(plane.heading) > 0.8) {
      waypoints.push({ x: 552, y: plane.y > 550 ? 651 : 475 }, { x: 605, y: 586 })
    } else if (runway.id === '18' && plane.y > 170) {
      const east = plane.x > 490
      waypoints.push({ x: east ? 584 : 379, y: 94 }, { x: east ? 540 : 442, y: 62 })
    }
    waypoints.push(offset(runway, runway.heading, -85))
  }
  const draft = [{ x: plane.x, y: plane.y }]
  for (const point of [...waypoints, destinationGate(runway)]) extendDraft(draft, point)
  return planRoute(plane, draft, runway)
}

test('a scripted regional shift lands at every runway and saves exactly one completion', () => {
  const game = regionalSession()
  game.start()
  const assigned = new Set()
  const landed = new Set()
  let arrivalsAtClosing
  let completions = 0
  for (let tick = 0; tick < 215 / step; tick++) {
    for (const plane of game.planes) {
      if (assigned.has(plane.id)) continue
      assigned.add(plane.id)
      plane.route = regionalRoute(plane, game.destinationFor(plane))
    }
    game.step(step)
    if (game.closing) arrivalsAtClosing ??= game.arrivals
    for (const event of game.events.splice(0)) {
      if (event.type === 'landing') landed.add(event.plane.destinationId)
      if (event.type === 'complete') completions++
    }
  }
  assert.equal(game.mode, 'complete')
  assert.equal(game.planes.length, 0)
  assert.equal(game.arrivals, arrivalsAtClosing)
  assert.equal(completions, 1)
  assert.deepEqual([...landed].sort(), ['09', '18', '27'])
  assert.ok(game.score >= 11 && game.time >= 150)
  assert.deepEqual(new Session(game.storage, 'campaign').progress.completedLevels, [1, 2])
})
