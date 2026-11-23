import { runways, step } from './airfield.js'
import { TowerAudio } from './audio.js'
import { installPointer } from './pointer.js'
import { AirportView } from './render.js'
import { Session } from './session.js'
import { arrivalInterval } from './traffic.js'

const element = (id) => document.getElementById(id)
const canvas = element('airspace')
const pause = element('pause')
const sound = element('sound')
const action = element('action')
const alternate = element('alternate')
const nextAirport = element('next-airport')
const overlay = element('overlay')
const radio = element('radio')
const instruments = element('instruments')
const mapTitle = element('map-title')
const mapStatus = element('map-status')
const score = element('score')
const shiftTime = element('shift-time')
const best = element('best')
const traffic = element('traffic')
const audio = new TowerAudio()
let storage
try {
  storage = localStorage
} catch {
  // Private browsing or preview restrictions can block access.
}
const session = new Session(storage, 'campaign')
const view = new AirportView(canvas)
const pointer = installPointer(canvas, session, () => audio.play('select'))
const motion = matchMedia('(prefers-reduced-motion: reduce)')
let effects = []
let message = ''
let messageUntil = 0
let messageTone = ''
let lastWarning = -10
let previousTimestamp
let accumulator = 0
let paintedMode
let repaint = true

new ResizeObserver(() => {
  pointer.cancel()
  repaint = true
}).observe(canvas)
motion.addEventListener('change', () => { repaint = true })

function showPanel(title, description, button, icon, { final = false, switchMode = false, complete = false, focus = true } = {}) {
  element('panel-title').textContent = title
  element('panel-message').textContent = description
  action.textContent = button
  element('panel-icon').textContent = icon
  element('results').hidden = !final
  if (final) {
    element('result-score').textContent = session.score
    element('result-detail-label').textContent = session.level ? 'Time' : 'Personal best'
    element('result-detail').textContent = session.level ? formatTime(session.elapsedSeconds) : session.best
  }
  alternate.textContent = session.level ? 'Endless Challenge' : 'Play Level 1'
  alternate.hidden = !switchMode
  nextAirport.hidden = !complete
  pause.disabled = true
  overlay.hidden = false
  if (focus) action.focus({ preventScroll: true })
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function updateValue(node, value) {
  if (node.textContent !== String(value)) node.textContent = value
}

function syncInstruments() {
  const level = session.level
  if (level) {
    updateValue(score, `${session.score} / ${level.minLandings}`)
    updateValue(shiftTime, `${formatTime(session.elapsedSeconds)} / ${formatTime(level.minSeconds)}`)
  } else {
    updateValue(score, session.score)
    updateValue(best, session.best)
  }
  updateValue(traffic, session.traffic)
  const closing = session.closing && (session.mode === 'playing' || session.mode === 'paused')
  mapTitle.toggleAttribute('data-closing', closing)
  updateValue(mapStatus, closing ? 'Closing traffic' : 'Coastal Airport')
}

function syncMode() {
  const campaign = Boolean(session.level)
  instruments.toggleAttribute('data-campaign', campaign)
  shiftTime.parentElement.hidden = !campaign
  best.parentElement.hidden = campaign
}

function announce(text, tone = '') {
  if (radio.textContent === text && radio.parentElement.dataset.tone === tone) return
  radio.textContent = text
  radio.parentElement.dataset.tone = tone
}

function updateRadio() {
  if (session.mode !== 'playing') return
  if (session.planes.some((plane) => plane.warning === 2)) {
    announce('Too close! Draw a route away from the other plane.', 'danger')
  } else if (session.planes.some((plane) => plane.escape)) {
    announce('Near the edge! Draw a wide turn back.', 'danger')
  } else if (session.planes.some((plane) => plane.warning)) {
    announce('Aircraft are closing in. Give them room to pass.', 'danger')
  } else if (session.closing) {
    announce(session.traffic ? 'Shift ending — land remaining aircraft.' : 'Shift ending — all aircraft are touching down.')
  } else if (session.time < messageUntil) {
    announce(message, messageTone)
  } else if (session.planes.some((plane) => plane.missed)) {
    announce('Missed approach. Make a wide turn and try again.')
  } else if (session.arrivals === 1 && session.score === 0) {
    announce(session.planes[0]?.route?.cleared ? 'Cleared for runway 09.' : 'Drag from the orange airliner to the 09 diamond.')
  } else if (session.arrivals === 2 && session.score === 1) {
    announce('The light plane lands at the blue 27 circle.')
  } else {
    announce(arrivalInterval(session.time) <= 12 ? 'Traffic is picking up. Leave room between routes.' : 'Drag again to change a route.')
  }
}

function processEvents() {
  for (const event of session.events.splice(0)) {
    if (event.type === 'arrival' && session.arrivals > 2 && session.time >= messageUntil) {
      const runway = runways[event.kind]
      message = `${runway.label} inbound for runway ${runway.number}.`
      messageUntil = session.time + 2.5
      messageTone = ''
    }
    if (event.type === 'landing') {
      effects.push({ x: event.plane.x, y: event.plane.y, time: session.time, color: runways[event.plane.kind].color })
      message = event.streak > 1 ? `${event.streak} landings in a row!` : 'Smooth landing! +1'
      messageUntil = session.time + 3
      messageTone = 'success'
      audio.play('landing', event.plane.kind)
    }
    if (event.type === 'over') {
      pointer.cancel()
      document.documentElement.classList.remove('airport-playing')
      audio.play('over')
      const collision = event.reason === 'collision'
      const text = collision ? 'Two aircraft got too close. Give their routes more room to pass.' : 'An aircraft left the airspace. Guide it back as soon as you see the edge warning.'
      announce(collision ? 'Aircraft collision.' : 'Aircraft left the airspace.', 'danger')
      showPanel(session.level ? 'Shift ended' : 'Shift complete', text, 'Play again', collision ? '!' : '↶', { final: true, switchMode: true })
    }
    if (event.type === 'complete') {
      pointer.cancel()
      document.documentElement.classList.remove('airport-playing')
      announce('Level complete. The sky is clear.', 'success')
      showPanel('Level Complete', 'All aircraft are safely on the ground.', 'Fly again', '✓', { final: true, switchMode: true, complete: true })
    }
  }
  if (session.mode === 'playing' && session.time - lastWarning > 3 && session.planes.some((plane) => plane.warning || plane.escape)) {
    lastWarning = session.time
    audio.play('warning')
  }
  effects = effects.filter((effect) => session.time - effect.time < 1.65)
}

function pauseShift() {
  if (session.mode !== 'playing') return
  pointer.cancel()
  session.pause()
  document.documentElement.classList.remove('airport-playing')
  showPanel('Shift paused', 'Your aircraft will hold here until you resume.', 'Resume shift', 'Ⅱ')
}

pause.addEventListener('click', pauseShift)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseShift()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && session.mode === 'playing') pauseShift()
})
function beginShift(playMode) {
  if (session.mode === 'paused') session.resume()
  else {
    session.reset(playMode)
    effects = []
    messageUntil = 0
    lastWarning = -10
    session.start()
  }
  document.documentElement.classList.add('airport-playing')
  accumulator = 0
  previousTimestamp = undefined
  overlay.hidden = true
  pause.disabled = false
  pause.focus({ preventScroll: true })
  syncMode()
  syncInstruments()
  updateRadio()
}

action.addEventListener('click', () => beginShift(session.playMode))
alternate.addEventListener('click', () => beginShift(session.level ? 'endless' : 'campaign'))
sound.addEventListener('click', async () => {
  sound.disabled = true
  await audio.toggle()
  sound.setAttribute('aria-pressed', String(audio.enabled))
  sound.setAttribute('aria-label', audio.enabled ? 'Sound on' : 'Sound off')
  sound.disabled = false
})

function frame(timestamp) {
  const elapsed = Math.min(0.2, (timestamp - (previousTimestamp ?? timestamp)) / 1000)
  previousTimestamp = timestamp
  if (session.mode === 'playing') {
    accumulator += elapsed
    while (accumulator >= step && session.mode === 'playing') {
      session.step(step)
      accumulator -= step
    }
    processEvents()
    syncInstruments()
    updateRadio()
  }
  if (repaint || session.mode !== paintedMode || session.mode === 'playing') {
    view.paint(session, pointer.draft, effects, motion.matches)
    repaint = false
    paintedMode = session.mode
  }
  requestAnimationFrame(frame)
}

const { id, minLandings, minSeconds } = session.level
const completed = session.progress.completedLevels.includes(id)
showPanel(
  `Level ${id} · Coastal Airport`,
  `Guide planes to their matching runways. Land ${minLandings} and keep the airspace safe for ${formatTime(minSeconds)}.`,
  completed ? `Replay Level ${id}` : `Start Level ${id}`,
  '✈︎',
  { switchMode: true, focus: false },
)
syncMode()
syncInstruments()
requestAnimationFrame(frame)
