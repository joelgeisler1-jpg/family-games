import assert from 'node:assert/strict'
import test from 'node:test'
import { flightBoardEntries } from '../flight-board.js'
import { coastalAirport, islandRescue } from '../campaign.js'

test('landscape flight board reflects route, danger and assigned landing zone', () => {
  const destinations = islandRescue.destinations
  const planes = [
    { id: 1, kind: 'jet', destinationId: '09', route: null, warning: 0, escape: false, landing: null },
    { id: 2, kind: 'heli', destinationId: 'H', route: { destinationId: 'H' }, warning: 0, escape: false, landing: null },
    { id: 3, kind: 'prop', destinationId: '27', route: { destinationId: '27' }, warning: 2, escape: false, landing: null },
    { id: 4, kind: 'turbo', destinationId: '18', route: null, warning: 0, escape: true, landing: null },
  ]
  const entries = flightBoardEntries(planes, destinations)
  assert.deepEqual(entries.map(item => item.status), ['Awaiting route', 'Cleared', 'Traffic alert', 'Turn back'])
  assert.equal(entries[1].destinationId, 'H')
  assert.equal(entries[1].destinationColor, destinations.H.color)
  assert.deepEqual(entries.map(item => item.alert), [false, false, true, true])
})

test('flight board omits runway rollouts, includes helicopter settling and limits rows', () => {
  const planes = [
    { id: 1, kind: 'jet', destinationId: '09', landing: { time: 0 } },
    { id: 2, kind: 'heli', destinationId: 'H', landing: { time: 0.3 } },
    ...Array.from({ length: 10 }, (_, index) => ({ id: index + 3, kind: 'jet', destinationId: '09', landing: null })),
  ]
  const entries = flightBoardEntries(planes, islandRescue.destinations)
  assert.equal(entries[0].id, 2)
  assert.equal(entries[0].status, 'Landing')
  assert.equal(entries.length, 7)
  assert.ok(!entries.some(item => item.id === 1))
  assert.deepEqual(flightBoardEntries([], coastalAirport.destinations), [])
})
