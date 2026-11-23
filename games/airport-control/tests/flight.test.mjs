import assert from 'node:assert/strict'
import test from 'node:test'
import { angleDelta, distance, height, offset, runways, step, width } from '../airfield.js'
import { moveAircraft, newAircraft } from '../aircraft.js'
import { matchingApproach } from '../landing.js'
import { extendDraft, planRoute } from '../routes.js'
import { boundary, separation } from '../separation.js'
import { Session } from '../session.js'
import { arrivalInterval, chooseArrival, entryCandidate, safeEntry } from '../traffic.js'

function draw(plane, ...waypoints) {
  const draft = [{ x: plane.x, y: plane.y }]
  for (const point of waypoints) extendDraft(draft, point)
  plane.route = planRoute(plane, draft, runways[plane.kind])
}

function until(game, condition, seconds = 25) {
  for (let i = 0; i < seconds / step && game.mode === 'playing' && !condition(); i++) game.step(step)
  assert.ok(condition(), `Condition was not reached at ${game.time.toFixed(2)}s (${game.mode})`)
}

test('undirected aircraft move, and routes rotate them gradually at constant speed', () => {
  const plane = newAircraft(1, 'jet', { x: 90, y: 150, heading: 0 })
  moveAircraft(plane, 1)
  assert.equal(plane.x, 124)
  draw(plane, { x: 225, y: 150 }, { x: 265, y: 300 })
  let maximumHeading = 0
  for (let i = 0; i < 420; i++) {
    const heading = plane.heading
    const before = moveAircraft(plane, step)
    assert.ok(Math.abs(angleDelta(heading, plane.heading)) <= runways.jet.turn * step + 0.000001)
    assert.ok(Math.abs(distance(before, plane) - runways.jet.speed * step) < 0.000001)
    maximumHeading = Math.max(maximumHeading, plane.heading)
  }
  assert.ok(plane.x > 210 && plane.y > 215)
  assert.ok(maximumHeading > 0.9)
})

test('sparse samples are interpolated and a moving aircraft can be rerouted', () => {
  const plane = newAircraft(1, 'prop', { x: 200, y: 300, heading: 0 })
  const draft = [{ x: plane.x, y: plane.y }]
  extendDraft(draft, { x: 350, y: 300 })
  assert.ok(draft.length > 14)
  moveAircraft(plane, 2)
  const first = planRoute(plane, draft, runways.prop)
  assert.deepEqual(first.points[0], { x: 252, y: 300 })
  assert.ok(first.points[1].x >= 252)
  draw(plane, { x: 347, y: 264 }, { x: 425, y: 190 })
  for (let i = 0; i < 300; i++) moveAircraft(plane, step)
  assert.ok(plane.y < 275)
})

test('both opening aircraft land on matching approaches and leave active traffic', () => {
  const game = new Session()
  game.start()
  for (const kind of ['jet', 'prop']) {
    until(game, () => game.planes.some((plane) => plane.kind === kind && !plane.landing), 35)
    const plane = game.planes.find((item) => item.kind === kind && !item.landing)
    const score = game.score
    const runway = runways[kind]
    draw(plane, offset(runway, runway.heading, -17))
    until(game, () => game.score === score + 1)
    assert.ok(plane.landing)
    assert.equal(game.traffic, 0)
    until(game, () => !game.planes.includes(plane), 2)
  }
  assert.equal(game.score, 2)
  assert.equal(game.streak, 2)
})

test('wrong runway, wrong direction and unfiled approaches never score', () => {
  const runway = runways.prop
  const plane = newAircraft(1, 'jet', { x: 580, y: 540, heading: Math.PI })
  draw(plane, offset(runway, runway.heading, -17))
  assert.equal(plane.route.cleared, false)
  for (let i = 0; i < 270; i++) {
    const before = moveAircraft(plane, step)
    assert.equal(matchingApproach(plane, before, 'prop'), false)
    assert.equal(matchingApproach(plane, before), false)
  }
  Object.assign(plane, { x: 235, y: 360, heading: Math.PI, route: { cleared: true } })
  assert.equal(matchingApproach(plane, { x: 236, y: 360 }), false)
  Object.assign(plane, { heading: 0, route: null })
  assert.equal(matchingApproach(plane, { x: 234, y: 360 }), false)
  plane.route = { cleared: true }
  assert.equal(matchingApproach(plane, { x: 234, y: 360 }), true)
})

test('swept separation detects a crossing between snapshots and escalates as planes close', () => {
  const a = newAircraft(1, 'jet', { x: 35, y: 60, heading: 0 })
  const b = newAircraft(2, 'prop', { x: 125, y: 60, heading: Math.PI })
  assert.equal(separation(a, b, a, b), 1)
  b.x = 78
  assert.equal(separation(a, b, a, b), 2)
  assert.equal(separation(a, b, { x: 105, y: 60 }, { x: 20, y: 60 }), 3)
  b.y = 260
  assert.equal(separation(a, b, a, b), 0)
})

test('collisions end the shift and undirected aircraft get an edge warning before escape', () => {
  const game = new Session()
  game.start()
  until(game, () => game.planes[0].escape, 19)
  assert.equal(game.mode, 'playing')
  for (let i = 0; i < 6 / step; i++) game.step(step)
  assert.equal(game.mode, 'over')
  assert.equal(game.events.at(-1).reason, 'escape')

  game.reset()
  game.start()
  const [first] = game.planes
  game.planes.push(newAircraft(2, 'prop', { x: first.x + 28, y: first.y, heading: Math.PI }))
  until(game, () => game.mode === 'over', 1)
  assert.equal(game.events.at(-1).reason, 'collision')
  assert.equal(boundary(newAircraft(3, 'prop', { x: -40, y: 300, heading: 0 })), 2)
})

test('entries require clear positions and clear projected inbound corridors', () => {
  const entry = { x: 30, y: 250, heading: 0 }
  const plane = newAircraft(1, 'jet', { x: 210, y: 250, heading: Math.PI })
  assert.equal(safeEntry(entry, 'jet', [plane]), false)
  assert.equal(safeEntry(entry, 'jet', [{ ...plane, x: 70, heading: 0 }]), false)
  assert.equal(safeEntry(entry, 'jet', [{ ...plane, y: 555 }]), true)
  for (let index = 1; index < 30; index++) {
    const arrival = chooseArrival(index, [plane])
    assert.ok(arrival)
    assert.equal(safeEntry(arrival.entry, arrival.kind, [plane]), true)
    const future = offset(arrival.entry, arrival.entry.heading, runways[arrival.kind].speed * 8)
    assert.ok(future.x > 35 && future.x < width - 35 && future.y > 35 && future.y < height - 35)
  }
})

test('arrivals rotate through all borders with varied entry lanes', () => {
  const samples = Array.from({ length: 40 }, (_, i) => entryCandidate(i + 2))
  assert.ok(samples.some(entry => entry.x === 27), 'west arrivals')
  assert.ok(samples.some(entry => entry.x === 653), 'east arrivals')
  assert.ok(samples.some(entry => entry.y === 28), 'north arrivals')
  assert.ok(samples.some(entry => entry.y === 752), 'south arrivals')
  assert.ok(new Set(samples.map(entry => Math.round(entry.x) + ':' + Math.round(entry.y))).size >= 20)
})

test('the second aircraft arrives after a short opening pause', () => {
  const game = new Session()
  game.start()
  assert.equal(game.nextArrival, 9)
  // Keep first plane clear of the initial arrivals so the timing can be assessed.
  game.planes = []
  until(game, () => game.arrivals === 2, 10)
  assert.ok(game.time <= 9.1, 'second arrival should not leave a long empty interval')
})

test('all blocked entries defer and retry without consuming the arrival', () => {
  const game = new Session()
  game.start()
  game.planes = []
  const blocks = []
  while (true) {
    const next = chooseArrival(game.arrivals, blocks)
    if (!next) break
    blocks.push(newAircraft(blocks.length + 10, next.kind, next.entry))
  }
  assert.ok(blocks.length > 1)
  game.planes = blocks
  game.spawn()
  assert.equal(game.arrivals, 1)
  assert.equal(game.nextArrival, 1)
  game.planes = []
  until(game, () => game.arrivals === 2, 2)
})

test('arrival spacing tightens, then caps at a positive interval', () => {
  assert.deepEqual([0, 60, 120, 180, 240, 300, 360, 420, 1200].map(arrivalInterval), [12, 10, 8.5, 7.5, 6.5, 6, 5.5, 5, 5])
})

test('pause holds the clock and aircraft, while reset preserves the local best', () => {
  const data = new Map()
  const storage = { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) }
  const game = new Session(storage)
  game.start()
  draw(game.planes[0], { x: 221, y: 360 })
  const x = game.planes[0].x
  const y = game.planes[0].y
  game.pause()
  game.step(12)
  assert.equal(game.time, 0)
  assert.deepEqual([game.planes[0].x, game.planes[0].y], [x, y])
  assert.equal(game.score, 0)
  game.resume()
  until(game, () => game.score === 1)
  assert.equal(new Session(storage).best, 1)
  game.reset()
  assert.deepEqual([game.mode, game.score, game.best, game.traffic, game.events.length], ['ready', 0, 1, 0, 0])
  game.start()
  assert.equal(game.planes[0].id, 1)
})

test('unavailable or invalid storage will not interrupt scoring', () => {
  const blocked = () => { throw Error('Storage unavailable') }
  for (const storage of [{ getItem: blocked, setItem: blocked }, { getItem: () => '-99', setItem: blocked }]) {
    const game = new Session(storage)
    assert.equal(game.best, 0)
    game.start()
    draw(game.planes[0], { x: 221, y: 360 })
    until(game, () => game.score === 1)
    assert.equal(game.best, 1)
  }
})

test('an authored six-minute shift reaches busy airspace while both runways stay usable', () => {
  const game = new Session()
  const assigned = new Set()
  game.start()
  let peakTraffic = 0
  for (let tick = 0; tick < 360 / step && game.mode === 'playing'; tick++) {
    peakTraffic = Math.max(peakTraffic, game.traffic)
    for (const plane of game.planes) {
      if (assigned.has(plane.id)) continue
      assigned.add(plane.id)
      const runway = runways[plane.kind]
      const gate = offset(runway, runway.heading, -17)
      if (plane.id <= 4) {
        draw(plane, gate)
      } else if (plane.kind === 'jet' && plane.x > 480 && plane.y < 300 && Math.cos(plane.heading) < -0.95) {
        draw(plane, { x: 117, y: 237 }, { x: 89, y: 308 }, { x: 144, y: 348 }, gate)
      } else if (plane.kind === 'prop' && plane.x < 120) {
        draw(plane, { x: 539, y: 615 }, { x: 590, y: 572 }, { x: 551, y: 533 }, gate)
      } else if (plane.kind === 'prop' && plane.y < 100 && plane.x > 420) {
        draw(plane, { x: 624, y: 260 }, { x: 619, y: 467 }, { x: 555, y: 524 }, gate)
      } else {
        draw(plane, offset(runway, runway.heading, -91), gate)
      }
    }
    game.step(step)
  }
  assert.equal(game.mode, 'playing')
  assert.ok(game.score >= 25, `Expected at least 25 landings, got ${game.score}`)
  assert.ok(peakTraffic >= 3)
})
