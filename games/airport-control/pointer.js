import { distance, height, width } from './airfield.js'
import { extendDraft, planRoute } from './routes.js'

export function installPointer(canvas, session, onSelect) {
  let draft = null

  function point(event) {
    const bounds = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - bounds.left) * width / bounds.width,
      y: (event.clientY - bounds.top) * height / bounds.height,
    }
  }

  function cancel() {
    if (!draft) return
    const { pointer } = draft
    draft = null
    if (canvas.hasPointerCapture?.(pointer)) canvas.releasePointerCapture(pointer)
  }

  // Some iOS Safari builds still try to pan a scrollable ancestor during a
  // gesture. Explicit non-passive touchmove suppression protects route drawing.
  canvas.addEventListener('touchmove', (event) => {
    if (session.mode === 'playing' && event.cancelable) event.preventDefault()
  }, { passive: false })

  canvas.addEventListener('pointerdown', (event) => {
    if (draft || session.mode !== 'playing' || event.button !== 0) return
    const position = point(event)
    let nearest = Math.max(33, 25 * width / canvas.clientWidth)
    let plane = null
    for (const candidate of session.planes) {
      const gap = distance(candidate, position)
      if (candidate.landing || gap >= nearest) continue
      nearest = gap
      plane = candidate
    }
    if (!plane) return

    event.preventDefault()
    draft = { plane, pointer: event.pointerId, points: [{ x: plane.x, y: plane.y }] }
    canvas.setPointerCapture(event.pointerId)
    onSelect()
  })

  canvas.addEventListener('pointermove', (event) => {
    if (draft?.pointer !== event.pointerId) return
    if (event.cancelable) event.preventDefault()
    const samples = event.getCoalescedEvents?.()
    for (const sample of samples?.length ? samples : [event]) extendDraft(draft.points, point(sample))
  })

  canvas.addEventListener('pointerup', (event) => {
    if (draft?.pointer !== event.pointerId) return
    const { plane, points } = draft
    extendDraft(points, point(event))
    cancel()
    if (session.mode !== 'playing' || plane.landing || points.length < 3) return
    const route = planRoute(plane, points, session.destinationFor(plane))
    if (route) {
      plane.route = route
      plane.missed = false
    }
  })

  for (const eventName of ['pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(eventName, (event) => {
      if (draft?.pointer === event.pointerId) cancel()
    })
  }

  return { get draft() { return draft }, cancel }
}
