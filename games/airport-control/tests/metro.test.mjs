import assert from 'node:assert/strict'
import test from 'node:test'
import { aircraftTypes, destinationGate, distance, offset, step } from '../airfield.js'
import { newAircraft } from '../aircraft.js'
import { campaignLevels, cityInternational, grandAirport, nextLevel } from '../campaign.js'
import { matchingApproach } from '../landing.js'
import { planRoute } from '../routes.js'
import { Session } from '../session.js'
import { chooseArrival, safeEntry } from '../traffic.js'

const key = 'family-arcade.airport-control.campaign.v1'

function save(completed) {
  const stored = new Map([[key, JSON.stringify({ completedLevels: completed, unlockedLevels: completed })]])
  return { getItem: k => stored.get(k), setItem: (k, v) => stored.set(k, v) }
}

test('five levels have distinct goals, scenery, and linked progression', () => {
  assert.deepEqual(campaignLevels.map(level => level.id), [1, 2, 3, 4, 5])
  assert.equal(new Set(campaignLevels.map(level => level.scenery)).size, 5)
  assert.deepEqual(campaignLevels.map(level => level.minLandings), [8, 11, 13, 16, 20])
  assert.deepEqual(campaignLevels.map(level => level.minSeconds), [120, 150, 180, 180, 210])
  assert.equal(nextLevel(3), cityInternational)
  assert.equal(nextLevel(4), grandAirport)
  assert.equal(nextLevel(5), undefined)
})

test('level four unlocks from existing level-three saves; level five stays locked', () => {
  const game = new Session(save([1, 2, 3]), 'campaign')
  assert.ok(game.progress.unlockedLevels.includes(4))
  assert.ok(!game.progress.unlockedLevels.includes(5))
  game.reset('campaign', 4)
  assert.equal(game.level, cityInternational)
  game.reset('campaign', 5)
  assert.equal(game.level.id, 1)
})

test('level five unlocks from level-four completion; winning the finale persists', () => {
  const storage = save([1, 2, 3, 4])
  const game = new Session(storage, 'campaign')
  game.reset('campaign', 5)
  assert.equal(game.level, grandAirport)
  game.start()
  Object.assign(game, { score: 20, time: 210 - step, planes: [], nextArrival: Infinity })
  game.step(step)
  assert.equal(game.mode, 'complete')
  assert.deepEqual(game.progress.completedLevels, [1, 2, 3, 4, 5])
  assert.equal(nextLevel(game.level.id), undefined)
  const replay = new Session(storage, 'campaign')
  replay.reset('campaign', 4)
  assert.equal(replay.level, cityInternational)
  replay.reset('campaign', 5)
  assert.equal(replay.level, grandAirport)
})

test('every new runway and helipad is reachable, has a unique approach and correct aircraft identity', () => {
  for (const airport of [cityInternational, grandAirport]) {
    assert.equal(Object.values(airport.destinations).filter(d => d.type === 'helipad').length, 1)
    assert.equal(Object.keys(airport.destinations).length, airport === cityInternational ? 4 : 5)
    const ids = airport.traffic.rotation.map(item => item.destinationId)
    assert.deepEqual([...new Set(ids)].sort(), Object.keys(airport.destinations).sort())
    const gates = Object.values(airport.destinations).map(destinationGate)
    for (let a = 0; a < gates.length; a++) {
      for (let b = a + 1; b < gates.length; b++) {
        assert.ok(distance(gates[a], gates[b]) > 115, 'landing destinations have distinct touch targets')
      }
    }
    for (const { kind, destinationId } of airport.traffic.rotation) {
      const destination = airport.destinations[destinationId]
      assert.ok(aircraftTypes[kind])
      assert.ok(destination)
      assert.equal(destination.type === 'helipad', kind === 'heli')
      const gate = destinationGate(destination)
      const origin = destination.type === 'helipad'
        ? { ...offset(gate, 0, -75), heading: 0 }
        : { ...offset(gate, destination.heading, -75), heading: destination.heading }
      const plane = newAircraft(1, kind, destinationId, origin)
      assert.equal(planRoute(plane, [origin, gate], destination)?.destinationId, destinationId)
      const wrong = Object.values(airport.destinations).find(site => site.id !== destinationId)
      assert.equal(planRoute(plane, [origin, destinationGate(wrong)], wrong)?.cleared ?? false, false)
      if (destination.type === 'helipad') {
        plane.x = gate.x
        plane.y = gate.y
        plane.speed = 4
        plane.route = { destinationId }
        assert.equal(matchingApproach(plane, plane, destination), true)
      }
    }
  }
})

test('new levels spawn safe mixed traffic with the expected opening sequences', () => {
  for (const airport of [cityInternational, grandAirport]) {
    const game = new Session(save([1, 2, 3, 4]), 'campaign')
    game.reset('campaign', airport.id)
    game.start()
    assert.equal(game.airport, airport)
    assert.equal(game.arrivals, 1)
    for (let index = 1; index < airport.traffic.rotation.length * 3; index++) {
      const occupant = chooseArrival(index, game.planes, airport)
      assert.ok(occupant, `safe arrival available at index ${index} in ${airport.name}`)
      assert.ok(safeEntry(occupant.entry, occupant.kind, game.planes))
      assert.deepEqual(
        { kind: occupant.kind, destinationId: occupant.destinationId },
        airport.traffic.rotation[index % airport.traffic.rotation.length],
      )
    }
    const initial = game.planes[0]
    assert.ok(initial)
    assert.ok(game.destinationFor(initial))
    game.pause()
    const elapsed = game.time
    game.step(10)
    assert.equal(game.time, elapsed)
    game.resume()
    assert.equal(game.mode, 'playing')
    game.reset('endless')
    assert.equal(game.airport.id, 1)
  }
})
