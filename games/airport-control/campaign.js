import { coastalDestinations, helipad, runway } from './airfield.js'

const coastalTraffic = {
  rotation: [{ kind: 'jet', destinationId: '09' }, { kind: 'prop', destinationId: '27' }],
  opening: [{ x: 61, y: 341, heading: 0.10 }, { x: 653, y: 539, heading: Math.PI + 0.04 }],
  openingGaps: [9],
  intervals: [12, 10, 8.5, 7.5, 6.5, 6, 5.5, 5],
}

export const coastalAirport = {
  id: 1, name: 'Coastal Airport', scenery: 'coast', minLandings: 8, minSeconds: 120,
  destinations: coastalDestinations,
  traffic: coastalTraffic,
}

export const regionalJunction = {
  id: 2, name: 'Regional Junction', scenery: 'regional', minLandings: 11, minSeconds: 150,
  destinations: {
    '09': { ...coastalDestinations['09'], x: 167, y: 420, length: 441 },
    '27': { ...coastalDestinations['27'], x: 485, y: 587, length: 314 },
    '18': runway('18', 'Regional runway', 'square', '#f6acf8', 494, 177, Math.PI / 2, 159, 43, 35, 1),
  },
  traffic: {
    rotation: [...coastalTraffic.rotation, { kind: 'turbo', destinationId: '18' }],
    opening: [
      { x: 46, y: 403, heading: 0.12 },
      { x: 653, y: 595, heading: Math.PI + 0.04 },
      { x: 480, y: 28, heading: Math.PI / 2 - 0.12 },
    ],
    openingGaps: [11, 12],
    intervals: [12, 10, 8.5, 7, 6.5, 6, 5.5, 5],
  },
}

export const islandRescue = {
  id: 3, name: 'Island Rescue', scenery: 'island', minLandings: 13, minSeconds: 180,
  destinations: {
    '09': { ...coastalDestinations['09'], x: 170, y: 358, length: 420 },
    '27': { ...coastalDestinations['27'], x: 500, y: 545, length: 308 },
    '18': runway('18', 'Island runway', 'square', '#f6acf8', 502, 173, Math.PI / 2, 129, 43, 35, 1),
    H: helipad('H', 'Rescue helipad', '#b7f59f', 313, 666),
  },
  traffic: {
    rotation: [...coastalTraffic.rotation, { kind: 'heli', destinationId: 'H' }, { kind: 'turbo', destinationId: '18' }],
    opening: [
      { x: 47, y: 341, heading: 0.12 },
      { x: 647, y: 553, heading: Math.PI + 0.04 },
      { x: 316, y: 752, heading: -Math.PI / 2 },
      { x: 487, y: 28, heading: Math.PI / 2 - 0.12 },
    ],
    openingGaps: [11, 11, 13],
    intervals: [12, 10, 8.5, 7.5, 6.5, 6, 5.5, 5],
  },
}

export const cityInternational = {
  id: 4, name: 'City International', scenery: 'city', minLandings: 16, minSeconds: 180,
  destinations: {
    '09': { ...coastalDestinations['09'], x: 148, y: 338, length: 406 },
    '27': { ...coastalDestinations['27'], x: 538, y: 560, length: 326 },
    '18': runway('18', 'City runway', 'square', '#f6acf8', 556, 126, Math.PI / 2, 154, 43, 35, 1),
    H: helipad('H', 'City rescue helipad', '#b7f59f', 327, 661),
  },
  traffic: {
    rotation: [
      { kind: 'jet', destinationId: '09' },
      { kind: 'turbo', destinationId: '18' },
      { kind: 'prop', destinationId: '27' },
      { kind: 'heli', destinationId: 'H' },
      { kind: 'jet', destinationId: '09' },
      { kind: 'prop', destinationId: '27' },
    ],
    opening: [
      { x: 46, y: 326, heading: 0.1 },
      { x: 550, y: 28, heading: Math.PI / 2 },
      { x: 647, y: 569, heading: Math.PI },
      { x: 324, y: 752, heading: -Math.PI / 2 },
    ],
    openingGaps: [10, 10, 11],
    intervals: [11.5, 9.5, 8, 7, 6.5, 6, 5.5, 5],
  },
}

export const grandAirport = {
  id: 5, name: 'Grand Airport', scenery: 'grand', minLandings: 20, minSeconds: 210,
  destinations: {
    '09': { ...coastalDestinations['09'], x: 140, y: 315, length: 427 },
    '27': { ...coastalDestinations['27'], x: 539, y: 558, length: 316 },
    '18': runway('18', 'Northern runway', 'square', '#f6acf8', 568, 103, Math.PI / 2, 143, 43, 35, 1),
    '36': runway('36', 'Western runway', 'triangle', '#ffe08d', 116, 653, -Math.PI / 2, 161, 39, 34, 1.03),
    H: helipad('H', 'Grand helipad', '#b7f59f', 365, 680),
  },
  traffic: {
    rotation: [
      { kind: 'jet', destinationId: '09' },
      { kind: 'turbo', destinationId: '18' },
      { kind: 'prop', destinationId: '27' },
      { kind: 'heli', destinationId: 'H' },
      { kind: 'turbo', destinationId: '36' },
      { kind: 'jet', destinationId: '09' },
      { kind: 'prop', destinationId: '27' },
      { kind: 'heli', destinationId: 'H' },
    ],
    opening: [
      { x: 46, y: 306, heading: 0.1 },
      { x: 560, y: 28, heading: Math.PI / 2 },
      { x: 647, y: 563, heading: Math.PI },
      { x: 356, y: 752, heading: -Math.PI / 2 },
      { x: 107, y: 752, heading: -Math.PI / 2 },
    ],
    openingGaps: [10, 9, 11, 10],
    intervals: [11, 9, 7.5, 6.7, 6, 5.7, 5.3, 5],
  },
}

// All campaign stages ship together for family playtesting. Individual
// airports remain locked until the preceding level is safely completed.
export const campaignLevels = [coastalAirport, regionalJunction, islandRescue, cityInternational, grandAirport]

export function nextLevel(id) {
  const index = campaignLevels.findIndex((level) => level.id === id)
  return index < 0 ? undefined : campaignLevels[index + 1]
}

const progressKey = 'family-arcade.airport-control.campaign.v1'

function levelIds(value) {
  return Array.isArray(value) ? value.filter((id) => Number.isSafeInteger(id) && id > 0) : []
}

export function loadCampaignProgress(storage) {
  let saved
  try {
    saved = JSON.parse(storage?.getItem(progressKey) ?? 'null')
  } catch {
    // Start with Level 1 when saved progress cannot be read.
  }
  const completedLevels = [...new Set(levelIds(saved?.completedLevels))]
  const unlockedLevels = [...new Set([coastalAirport.id, ...levelIds(saved?.unlockedLevels), ...completedLevels])]
  for (const id of completedLevels) {
    const next = nextLevel(id)
    if (next && !unlockedLevels.includes(next.id)) unlockedLevels.push(next.id)
  }
  return { completedLevels, unlockedLevels }
}

export function recordCompletion(storage, progress, levelId) {
  if (progress.completedLevels.includes(levelId)) return
  progress.completedLevels.push(levelId)
  if (!progress.unlockedLevels.includes(levelId)) progress.unlockedLevels.push(levelId)
  const next = nextLevel(levelId)
  if (next && !progress.unlockedLevels.includes(next.id)) progress.unlockedLevels.push(next.id)
  try {
    storage?.setItem(progressKey, JSON.stringify(progress))
  } catch {
    // Keep progress for the current visit if it cannot be saved locally.
  }
}
