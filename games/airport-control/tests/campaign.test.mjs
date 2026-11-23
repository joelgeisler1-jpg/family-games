import assert from 'node:assert/strict'
import test from 'node:test'
import { newAircraft } from '../aircraft.js'
import { coastalDestinations, step, width } from '../airfield.js'
import { Session } from '../session.js'

const runways = { jet: coastalDestinations['09'], prop: coastalDestinations['27'] }
const coastalAircraft = (id, kind, entry) => newAircraft(id, kind, runways[kind].id, entry)

const bestKey = 'family-arcade.airport-control.best.v1'
const campaignKey = 'family-arcade.airport-control.campaign.v1'

function mockStorage(entries = []) {
  const data = new Map(entries)
  return { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) }
}

function campaign({ time = 120 - step, score = 8, planes = [] } = {}, storage) {
  const game = new Session(storage, 'campaign')
  game.start()
  Object.assign(game, { time, score, planes, nextArrival: Infinity })
  return game
}

function approach(id = 2, kind = 'jet') {
  const { x, y, heading } = runways[kind]
  const plane = coastalAircraft(id, kind, { x, y, heading })
  plane.route = { cleared: true, destinationId: plane.destinationId, cursor: 1, points: [plane, { x: x + 120 * Math.cos(heading), y }] }
  return plane
}

test('both targets must be met, in either order', () => {
  const landingsFirst = campaign({ time: 120 - 2 * step })
  landingsFirst.step(step)
  assert.equal(landingsFirst.closing, false)
  assert.equal(landingsFirst.mode, 'playing')
  landingsFirst.step(step)
  assert.equal(landingsFirst.closing, true)
  assert.equal(landingsFirst.mode, 'complete')

  const timeFirst = campaign({ time: 121, score: 7 })
  timeFirst.step(step)
  assert.equal(timeFirst.closing, false)
  assert.equal(timeFirst.mode, 'playing')
  timeFirst.planes.push(approach())
  timeFirst.step(step)
  assert.equal(timeFirst.score, 8)
  assert.equal(timeFirst.closing, true)
  assert.equal(timeFirst.mode, 'playing')
})

test('the qualifying landing prevents a scheduled arrival on the same step and later', () => {
  const plane = approach()
  const game = campaign({ score: 7, planes: [plane] })
  game.nextArrival = 120 - step
  const before = game.arrivals
  game.step(step)
  assert.equal(game.mode, 'playing')
  assert.equal(game.closing, true)
  assert.equal(game.planes[0], plane)
  game.spawn()
  game.step(step)
  assert.equal(game.arrivals, before)
  assert.equal(game.events.filter((event) => event.type === 'arrival').length, before)
})

test('completion waits for remaining aircraft to land and finish their rollout', () => {
  const storage = mockStorage([[bestKey, '5']])
  const jet = approach(2)
  const prop = coastalAircraft(3, 'prop', { x: 620, y: runways.prop.y, heading: Math.PI })
  const game = campaign({ planes: [jet, prop] }, storage)
  game.step(step)
  assert.equal(game.closing, true)
  assert.equal(game.traffic, 1)
  assert.equal(game.mode, 'playing')
  assert.equal(storage.getItem(campaignKey), undefined)

  prop.route = { cleared: true, destinationId: prop.destinationId, cursor: 1, points: [prop, { x: 425, y: prop.y }] }
  for (let tick = 0; game.traffic > 0 && tick < 600; tick++) game.step(step)
  assert.equal(game.traffic, 0)
  assert.equal(game.mode, 'playing')
  assert.ok(game.planes.includes(prop))
  for (let tick = 0; game.mode === 'playing' && tick < 120; tick++) game.step(step)
  assert.equal(game.planes.length, 0)
  assert.equal(game.mode, 'complete')
  assert.equal(game.events.at(-1).type, 'complete')
  assert.deepEqual(new Session(storage, 'campaign').progress, { completedLevels: [1], unlockedLevels: [1, 2] })
  assert.equal(storage.getItem(bestKey), '5')
  assert.equal(game.best, 5)
})

test('collision and escape during closing still lose the shift without saving completion', () => {
  for (const reason of ['collision', 'escape']) {
    const storage = mockStorage()
    const plane = coastalAircraft(2, 'jet', { x: 400, y: 200, heading: 0 })
    const game = campaign({ planes: [plane] }, storage)
    game.step(step)
    assert.equal(game.closing, true)
    if (reason === 'collision') {
      game.planes.push(coastalAircraft(3, 'prop', { x: plane.x + 25, y: plane.y, heading: Math.PI }))
    } else {
      plane.x = width + 25
    }
    game.step(step)
    assert.equal(game.mode, 'over')
    assert.equal(game.events.at(-1).reason, reason)
    assert.equal(storage.getItem(campaignKey), undefined)
  }
})

test('pause freezes a closing shift and replay resets it while preserving progress', () => {
  const plane = approach()
  const game = campaign({ planes: [plane] })
  game.step(step)
  game.pause()
  const time = game.time
  const landingTime = plane.landing.time
  game.step(2)
  assert.equal(game.time, time)
  assert.equal(plane.landing.time, landingTime)
  assert.equal(game.closing, true)
  game.resume()
  for (let tick = 0; game.mode === 'playing' && tick < 120; tick++) game.step(step)
  assert.equal(game.mode, 'complete')
  game.reset()
  assert.equal(game.playMode, 'campaign')
  assert.equal(game.mode, 'ready')
  assert.equal(game.closing, false)
  assert.equal(game.time, 0)
  assert.equal(game.score, 0)
  assert.equal(game.arrivals, 0)
  assert.equal(game.planes.length, 0)
  assert.deepEqual(game.events, [])
  assert.deepEqual(game.progress.completedLevels, [1])
  game.start()
  assert.equal(game.arrivals, 1)
})

test('endless continues scheduling at the campaign thresholds and saves its best score', () => {
  const storage = mockStorage([[bestKey, '5']])
  const game = campaign({}, storage)
  game.reset('endless')
  game.start()
  const before = game.arrivals
  Object.assign(game, { score: 7, time: 120, nextArrival: 120, planes: [approach()] })
  game.step(step)
  assert.equal(game.mode, 'playing')
  assert.equal(game.closing, false)
  assert.equal(game.arrivals, before + 1)
  assert.equal(game.score, 8)
  assert.equal(new Session(storage).best, 8)
  assert.deepEqual(game.progress.completedLevels, [])
  assert.equal(storage.getItem(campaignKey), undefined)
})

test('malformed or inaccessible storage still allows completion', () => {
  const blocked = () => { throw new Error('Storage blocked') }
  for (const storage of [mockStorage([[campaignKey, '{bad json']]), { getItem: blocked, setItem: blocked }]) {
    const game = campaign({}, storage)
    assert.deepEqual(game.progress, { completedLevels: [], unlockedLevels: [1] })
    game.step(step)
    assert.equal(game.mode, 'complete')
    assert.deepEqual(game.progress, { completedLevels: [1], unlockedLevels: [1, 2] })
  }
})
