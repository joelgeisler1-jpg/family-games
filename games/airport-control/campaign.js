import { coastalDestinations, runway } from './airfield.js'

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

export const campaignLevels = [coastalAirport, regionalJunction]

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
