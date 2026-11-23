export const coastalAirport = Object.freeze({
  id: 1,
  minLandings: 8,
  minSeconds: 120,
})

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
  return { completedLevels, unlockedLevels }
}

export function recordCompletion(storage, progress, levelId) {
  if (progress.completedLevels.includes(levelId)) return
  progress.completedLevels.push(levelId)
  if (!progress.unlockedLevels.includes(levelId)) progress.unlockedLevels.push(levelId)
  try {
    storage?.setItem(progressKey, JSON.stringify(progress))
  } catch {
    // Keep progress for the current visit if it cannot be saved locally.
  }
}
