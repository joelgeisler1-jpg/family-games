import assert from 'node:assert/strict'
import test from 'node:test'
import { aircraftTypes, angleDelta, destinationGate, distance, offset, step, width } from '../airfield.js'
import { airspeed, moveAircraft, newAircraft } from '../aircraft.js'
import { buildLandingTexture, TowerAudio } from '../audio.js'
import { islandRescue } from '../campaign.js'
import { matchingApproach } from '../landing.js'
import { extendDraft, planRoute } from '../routes.js'
import { boundary, separation } from '../separation.js'
import { Session } from '../session.js'
import { chooseArrival, safeEntry } from '../traffic.js'

const campaignKey = 'family-arcade.airport-control.campaign.v1'
const { destinations } = islandRescue
const pad = destinations.H

function savedRegionalClear() {
  // This is the save format emitted before Island Rescue existed.
  const values = new Map([[campaignKey, JSON.stringify({ completedLevels: [1, 2], unlockedLevels: [1, 2] })]])
  return { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) }
}

function islandSession(storage = savedRegionalClear()) {
  const game = new Session(storage, 'campaign')
  game.reset('campaign', islandRescue.id)
  assert.equal(game.level, islandRescue)
  return game
}

function fileRoute(plane, destination, ...waypoints) {
  const draft = [{ x: plane.x, y: plane.y }]
  for (const point of [...waypoints, destinationGate(destination)]) extendDraft(draft, point)
  plane.route = planRoute(plane, draft, destination)
  assert.equal(plane.route?.destinationId, destination.id)
}

function helicopterApproach(heading = 0, gap = 80) {
  const plane = newAircraft(1, 'heli', 'H', { ...offset(pad, heading, -gap), heading })
  fileRoute(plane, pad)
  return plane
}

function withFinalHelicopter(plane = helicopterApproach()) {
  const game = islandSession()
  game.start()
  Object.assign(game, { time: 180, score: 12, planes: [plane], nextArrival: Infinity })
  return game
}

function advanceUntil(game, predicate, seconds = 8) {
  for (let tick = 0; game.mode === 'playing' && !predicate() && tick < seconds / step; tick++) {
    game.step(step)
  }
  assert.ok(predicate(), `Condition was not reached at ${game.time.toFixed(2)}s (${game.mode})`)
}

test('legacy Regional completion unlocks Island Rescue and earlier saves do not', () => {
  const storage = savedRegionalClear()
  const game = islandSession(storage)
  assert.deepEqual(game.progress.completedLevels, [1, 2])
  assert.ok(game.progress.unlockedLevels.includes(3))
  storage.setItem(campaignKey, JSON.stringify({ completedLevels: [1], unlockedLevels: [1, 2] }))
  const locked = new Session(storage, 'campaign')
  locked.reset('campaign', 3)
  assert.equal(locked.level.id, 1)
  assert.ok(!locked.progress.unlockedLevels.includes(3))
})

test('the H pad has a smaller snap zone, no runway release grace, and an exact endpoint', () => {
  const center = destinationGate(pad)
  assert.deepEqual({ x: center.x, y: center.y }, { x: pad.x, y: pad.y })
  assert.ok(Object.values(destinations).filter((site) => site.type === 'runway').every(
    (runway) => distance(center, destinationGate(runway)) > pad.snapRadius + runway.snapRadius + 16,
  ))
  const helicopter = newAircraft(1, 'heli', pad.id, { x: pad.x - 80, y: pad.y, heading: 0 })
  const edge = { x: pad.x + 38, y: pad.y }
  const exact = planRoute(helicopter, [helicopter, edge], pad)
  assert.equal(exact.destinationId, pad.id)
  assert.deepEqual(exact.points.at(-1), { x: pad.x, y: pad.y })
  const overshot = planRoute(helicopter, [helicopter, center, { x: edge.x + 1, y: edge.y }], pad)
  assert.equal(overshot.cleared, false)
  assert.equal(overshot.destinationId, null)
})

test('pad capture requires the right aircraft, a filed approach, low speed and proximity', () => {
  const at = { x: pad.x, y: pad.y }
  const plane = newAircraft(1, 'heli', pad.id, { ...at, heading: Math.PI })
  assert.equal(matchingApproach(plane, at, pad), false)
  plane.route = { destinationId: pad.id }
  assert.equal(matchingApproach(plane, at, pad), false, 'at cruise speed')
  plane.speed = 4
  assert.equal(matchingApproach(plane, at, pad), true)
  plane.x += pad.radius + 1
  assert.equal(matchingApproach(plane, plane, pad), false, 'outside physical capture radius')
  const fixedWing = newAircraft(2, 'prop', pad.id, { ...at, heading: Math.PI })
  fixedWing.speed = 4
  fixedWing.route = { destinationId: pad.id }
  assert.equal(matchingApproach(fixedWing, at, pad), false)
  fixedWing.x -= 60
  assert.equal(planRoute(fixedWing, [fixedWing, at], pad).cleared, false)
})

test('a helicopter cannot land at a runway or an unassigned pad', () => {
  const runway = destinations['09']
  const gate = destinationGate(runway)
  const helicopter = newAircraft(1, 'heli', pad.id, { ...offset(runway, runway.heading, -100), heading: runway.heading })
  const wrongRoute = planRoute(helicopter, [helicopter, gate], runway)
  assert.ok(!wrongRoute?.cleared, 'does not file a clearance at another destination')
  Object.assign(helicopter, { x: runway.x, y: runway.y, route: { destinationId: runway.id } })
  assert.equal(matchingApproach(helicopter, helicopter, runway), false)
  helicopter.speed = 4
  helicopter.destinationId = 'other-pad'
  helicopter.route = { destinationId: pad.id }
  Object.assign(helicopter, { x: pad.x, y: pad.y })
  assert.equal(matchingApproach(helicopter, helicopter, pad), false)
})

test('filing a loop from a slow overflight does not capture the pad on the outbound leg', () => {
  const helicopter = newAircraft(1, 'heli', pad.id, { x: pad.x - 1, y: pad.y, heading: 0 })
  helicopter.speed = 4
  fileRoute(helicopter, pad, { x: pad.x + 85, y: pad.y }, { x: pad.x + 85, y: pad.y - 100 })
  const game = withFinalHelicopter(helicopter)
  game.step(step)
  assert.ok(distance(helicopter, pad) <= pad.radius && airspeed(helicopter) <= 5)
  assert.equal(helicopter.landing, null)
  assert.equal(game.score, 12)
  advanceUntil(game, () => game.mode === 'complete', 30)
})

test('helicopters fly slower and can turn more tightly than fixed-wing aircraft', () => {
  const origin = { x: 105, y: 103, heading: 0 }
  const aircraft = Object.entries({ heli: 'H', jet: '09', prop: '27', turbo: '18' }).map(([kind, destinationId], i) => {
    const plane = newAircraft(i + 1, kind, destinationId, origin)
    plane.route = planRoute(plane, [plane, { x: 111, y: 207 }], destinations[destinationId])
    return plane
  })
  for (const plane of aircraft) moveAircraft(plane, step)
  const [helicopter, ...fixedWing] = aircraft
  for (const plane of fixedWing) {
    assert.ok(distance(origin, helicopter) < distance(origin, plane))
    assert.ok(Math.abs(angleDelta(origin.heading, helicopter.heading)) > Math.abs(angleDelta(origin.heading, plane.heading)))
  }
})

test('helicopters brake and settle smoothly from all four directions', () => {
  for (const heading of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const helicopter = helicopterApproach(heading)
    const game = withFinalHelicopter(helicopter)
    const speeds = []
    let previous = { x: helicopter.x, y: helicopter.y }
    let hoverObserved = false
    advanceUntil(game, () => {
      assert.ok(distance(previous, helicopter) <= aircraftTypes.heli.speed * step + 0.01, 'no abrupt displacement')
      previous = { x: helicopter.x, y: helicopter.y }
      if (!game.planes.includes(helicopter)) return true
      if (speeds.length) {
        assert.ok(Math.abs(speeds.at(-1) - airspeed(helicopter)) < 0.6, 'speed changes gradually per tick')
      }
      speeds.push(airspeed(helicopter))
      if (helicopter.landing) {
        if (!hoverObserved) assert.ok(airspeed(helicopter) <= 5)
        hoverObserved = true
        assert.ok(distance(helicopter, pad) <= pad.radius)
        assert.equal(game.score, 12)
      }
      return false
    })
    assert.ok(hoverObserved, 'descent was observed before removal')
    assert.ok(speeds.some((speed) => speed > 7 && speed < aircraftTypes.heli.speed - 1), 'brakes before pad capture')
    assert.ok(distance(helicopter, pad) < 0.01)
    assert.ok(airspeed(helicopter) < 0.6)
    assert.equal(game.score, 13)
    assert.equal(game.mode, 'complete')
  }
})

test('a closing Island shift waits through the final hover and saves completion after safe descent', () => {
  const helicopter = helicopterApproach()
  const game = withFinalHelicopter(helicopter)
  game.score = 13
  advanceUntil(game, () => Boolean(helicopter.landing))
  assert.equal(game.closing, true)
  assert.equal(game.mode, 'playing')
  assert.deepEqual(new Session(game.storage, 'campaign').progress.completedLevels, [1, 2])
  game.pause()
  const held = { x: helicopter.x, y: helicopter.y, time: helicopter.landing.time }
  game.step(1)
  assert.deepEqual({ x: helicopter.x, y: helicopter.y, time: helicopter.landing.time }, held)
  game.resume()
  advanceUntil(game, () => game.mode === 'complete')
  const resumed = islandSession(game.storage)
  assert.deepEqual(resumed.progress.completedLevels, [1, 2, 3])
  resumed.start()
  assert.equal(resumed.mode, 'playing')
  assert.equal(resumed.score, 0)
  assert.equal(resumed.closing, false)
  assert.equal(resumed.arrivals, 1)
})

test('a helicopter can collide during descent and a closing shift still fails', () => {
  const helicopter = helicopterApproach()
  const game = withFinalHelicopter(helicopter)
  game.score = 13
  advanceUntil(game, () => Boolean(helicopter.landing))
  assert.equal(safeEntry({ x: helicopter.x + 100, y: helicopter.y, heading: Math.PI }, 'jet', [helicopter]), false)
  const contact = aircraftTypes.heli.collisionRadius + aircraftTypes.jet.collisionRadius
  const inbound = newAircraft(2, 'jet', '09', { x: helicopter.x + contact + 0.15, y: helicopter.y, heading: Math.PI })
  game.planes.push(inbound)
  game.step(step)
  assert.equal(game.mode, 'over')
  assert.equal(game.events.at(-1).reason, 'collision')
  assert.equal(game.score, 13)
  assert.deepEqual(new Session(game.storage, 'campaign').progress.completedLevels, [1, 2])
})

test('helicopter boundary warnings and swept separation use the shared safety rules', () => {
  const heli = newAircraft(1, 'heli', pad.id, { x: width - 10, y: 230, heading: 0 })
  heli.age = 4
  assert.equal(boundary(heli), 1)
  heli.heading = Math.PI
  assert.equal(boundary(heli), 0)
  heli.x = width + 26
  assert.equal(boundary(heli), 2)

  const plane = newAircraft(2, 'jet', '09', { x: 110, y: 230, heading: Math.PI })
  Object.assign(heli, { x: 200, heading: 0 })
  const beforeHeli = { x: 110, y: heli.y }
  const beforePlane = { x: 200, y: plane.y }
  assert.equal(separation(heli, plane, beforeHeli, beforePlane), 3)
})

test('a blocked helicopter arrival uses another protected entry lane', () => {
  const index = islandRescue.traffic.rotation.findIndex(({ kind }) => kind === 'heli')
  const preferred = chooseArrival(index, [], islandRescue)
  const blocker = newAircraft(1, 'jet', '09', preferred.entry)
  const alternate = chooseArrival(index, [blocker], islandRescue)
  assert.equal(alternate.kind, 'heli')
  assert.equal(alternate.destinationId, 'H')
  assert.notDeepEqual(alternate.entry, preferred.entry)
  assert.ok(safeEntry(alternate.entry, alternate.kind, [blocker]))
})

test('rotor Foley is buffered, distinct and silent until the user enables audio', () => {
  const context = {
    createBuffer(channels, length, rate) {
      assert.equal(channels, 1)
      assert.equal(rate, 24000)
      const samples = new Float32Array(length)
      return { getChannelData: () => samples }
    },
  }
  const samples = buildLandingTexture(context, 'heli').getChannelData(0)
  const prop = buildLandingTexture(context, 'prop').getChannelData(0)
  assert.ok(samples.every((sample) => Number.isFinite(sample) && Math.abs(sample) <= 1))
  assert.ok(samples.some((sample) => Math.abs(sample) > 0.01))
  assert.notDeepEqual(samples.slice(1000, 1200), prop.slice(1000, 1200))
  assert.deepEqual(samples, buildLandingTexture(context, 'heli').getChannelData(0))

  const audio = new TowerAudio()
  const clips = []
  const tones = []
  audio.context = { state: 'running', currentTime: 0 }
  audio.landingAircraft = (kind) => clips.push(kind)
  audio.tone = (frequency) => tones.push(frequency)
  audio.play('settle')
  assert.deepEqual(clips, [])
  assert.deepEqual(tones, [])
  audio.enabled = true
  audio.play('settle')
  assert.deepEqual(clips, ['heli'])
  assert.deepEqual(tones, [])
  audio.play('landing', 'heli')
  assert.deepEqual(clips, ['heli'])
  assert.deepEqual(tones, [587, 740], 'touchdown has a quiet success cue')
})

function islandWaypoints(plane, destination) {
  if (plane.id <= 4 || destination.type === 'helipad') return []
  const waypoints = []
  if (destination.id === '09' && plane.x > 500 && Math.cos(plane.heading) < -0.8) {
    waypoints.push({ x: 107, y: plane.y > 390 ? 455 : 275 }, { x: 67, y: 358 })
  } else if (destination.id === '27' && plane.x < 130 && Math.cos(plane.heading) > 0.8) {
    waypoints.push({ x: 552, y: plane.y > 545 ? 635 : 445 }, { x: 605, y: 545 })
  } else if (destination.id === '18' && plane.y > 160) {
    const east = plane.x > destination.x
    waypoints.push({ x: east ? 595 : 390, y: 90 }, { x: east ? 553 : 460, y: 65 })
  }
  return [...waypoints, offset(destination, destination.heading, -85)]
}

test('a scripted mixed Island shift clears every destination and completes exactly once', () => {
  const game = islandSession()
  game.start()
  const assigned = new Set()
  const landed = new Set()
  let arrivalsAtClosing
  let completions = 0
  for (let tick = 0; tick < 245 / step; tick++) {
    for (const plane of game.planes) {
      if (assigned.has(plane.id)) continue
      assigned.add(plane.id)
      const destination = game.destinationFor(plane)
      fileRoute(plane, destination, ...islandWaypoints(plane, destination))
    }
    game.step(step)
    if (game.closing) arrivalsAtClosing ??= game.arrivals
    for (const event of game.events.splice(0)) {
      if (event.type === 'over') assert.fail(`${event.reason} at ${game.time.toFixed(2)}s (aircraft ${event.planes.map((plane) => plane.id).join(', ')})`)
      if (event.type === 'landing') landed.add(event.plane.destinationId)
      if (event.type === 'complete') completions++
    }
  }
  assert.equal(game.mode, 'complete')
  assert.equal(game.planes.length, 0)
  assert.equal(game.arrivals, arrivalsAtClosing)
  assert.equal(completions, 1)
  assert.deepEqual([...landed].sort(), ['09', '18', '27', 'H'])
  assert.ok(game.score >= 13 && game.time >= 180)
  assert.deepEqual(new Session(game.storage, 'campaign').progress.completedLevels, [1, 2, 3])
})
