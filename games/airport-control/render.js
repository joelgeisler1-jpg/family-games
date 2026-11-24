import { aircraftTypes, destinationGate, height, offset, width } from './airfield.js'
import { paintIslandActivity } from './island.js'
import { paintMetroActivity } from './metro.js'
import { snapsToDestination } from './routes.js'
import { projectedHeading, projectionStretch } from './landscape-projection.js'
import { createScenery, paintBoat } from './scenery.js'
import { paintRegionalTrain } from './regional.js'

const silhouettes = {
  heli: 'M 24 0 C 24 -7 16 -11 7 -11 L -3 -10 Q -10 -9 -13 -5 L -25 -3 L -33 -9 H -36 L -33 0 L -36 9 H -33 L -25 3 L -13 5 Q -10 9 -3 10 L 7 11 C 16 11 24 7 24 0 Z',
  turbo: 'M 23 0 Q 25 -5 13 -6 L 0 -6 L -2 -24 L -7 -25 L -11 -22 L -11 -6 L -22 -4 L -27 -13 L -32 -13 L -29 0 L -32 13 L -27 13 L -22 4 L -11 6 L -11 22 L -7 25 L -2 24 L 0 6 L 13 6 Q 25 5 23 0 Z',
  jet: 'M 23 0 Q 24 -3 16 -5 L 1 -6 L -12 -23 L -18 -23 L -11 -6 L -21 -5 L -27 -11 L -31 -11 L -28 0 L -31 11 L -27 11 L -21 5 L -11 6 L -18 23 L -12 23 L 1 6 L 16 5 Q 24 3 23 0 Z',
  prop: 'M 20 0 Q 20 -4 14 -5 L 4 -5 L 2 -19 Q -2 -22 -5 -18 L -5 -5 L -15 -3 L -20 -10 L -23 -10 L -21 0 L -23 10 L -20 10 L -15 3 L -5 5 L -5 18 Q -2 22 2 19 L 4 5 L 14 5 Q 20 4 20 0 Z',
}
const trimPaths = {
  heli: 'M -28 -2 L -10 -5 L -2 -9 L 3 -9 L -2 -3 L -24 1 Z M -28 2 L -10 5 L -2 9 L 3 9 L -2 3 L -24 -1 Z',
  turbo: 'M -5 -6 L -7 -21 L -10 -20 L -10 -6 Z M -5 6 L -7 21 L -10 20 L -10 6 Z M -30 -10 L -27 -10 L -25 -5 H -29 Z M -30 10 L -27 10 L -25 5 H -29 Z',
  jet: 'M -8 -7 L -14 -21 H -17 L -11 -6 Z M -8 7 L -14 21 H -17 L -11 6 Z',
  prop: 'M 1 -7 L 0 -18 Q -3 -20 -4 -17 V -7 Z M 1 7 L 0 18 Q -3 20 -4 17 V 7 Z',
}

function ring(ctx, x, y, radius, color, weight = 2) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.lineWidth = weight
  ctx.strokeStyle = color
  ctx.stroke()
}

function badge(ctx, x, y, text, color, size = 13) {
  ctx.font = `800 ${size}px system-ui`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const w = ctx.measureText(text).width + 15
  ctx.fillStyle = '#102933'
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, 5)
  ctx.fill()
  ctx.fillStyle = color
  ctx.fillText(text, x, y + 0.5)
}

function trail(ctx, points, color, draft = false) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < points.length - 1; index++) {
    const a = points[index]
    const b = points[index + 1]
    ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2)
  }
  ctx.lineTo(points.at(-1).x, points.at(-1).y)
  ctx.strokeStyle = '#15353da8'
  ctx.lineWidth = draft ? 8 : 6
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = draft ? 4 : 3
  ctx.setLineDash(draft ? [] : [9, 7])
  ctx.stroke()
  ctx.setLineDash([])
  ring(ctx, points.at(-1).x, points.at(-1).y, draft ? 7 : 5, color)
}

function paintRunwayGate(ctx, runway, armed) {
  const gate = destinationGate(runway)
  ctx.save()
  ctx.translate(gate.x, gate.y)
  ctx.rotate(runway.heading)
  ctx.beginPath()
  if (runway.shape === 'circle') ctx.arc(0, 0, 20, 0, Math.PI * 2)
  else if (runway.shape === 'square') ctx.roundRect(-20, -20, 40, 40, 5)
  else {
    ctx.moveTo(0, -24)
    ctx.lineTo(24, 0)
    ctx.lineTo(0, 24)
    ctx.lineTo(-24, 0)
    ctx.closePath()
  }
  ctx.fillStyle = armed ? '#223b39' : '#263f43'
  ctx.fill()
  ctx.strokeStyle = runway.color
  ctx.lineWidth = armed ? 5 : 2.75
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-8, -8)
  ctx.lineTo(2, 0)
  ctx.lineTo(-8, 8)
  ctx.moveTo(1, -8)
  ctx.lineTo(11, 0)
  ctx.lineTo(1, 8)
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()
  const vertical = Math.abs(Math.sin(runway.heading)) > 0.6
  badge(ctx, gate.x + (vertical ? 39 : 0), gate.y + (vertical ? 0 : 38), runway.id, runway.color, 16)
}

function paintHelipad(ctx, pad, armed, settling) {
  ctx.save()
  ctx.translate(pad.x, pad.y)
  ctx.beginPath()
  for (let corner = 0; corner < 8; corner++) {
    const point = offset({ x: 0, y: 0 }, Math.PI / 8 + corner * Math.PI / 4, 29)
    if (corner === 0) ctx.moveTo(point.x, point.y)
    else ctx.lineTo(point.x, point.y)
  }
  ctx.closePath()
  ctx.fillStyle = armed || settling ? '#305443' : '#213e45'
  ctx.fill()
  ctx.lineWidth = armed || settling ? 5 : 3
  ctx.strokeStyle = pad.color
  ctx.stroke()
  ring(ctx, 0, 0, 20, '#d8f4c17a', 1.75)
  ctx.font = '850 27px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ecf6cd'
  ctx.fillText(pad.id, 0, 0.5)
  ctx.restore()
}

function paintRescueMarkings(ctx, time, reducedMotion, progress) {
  ctx.strokeStyle = '#263a45'
  ctx.lineWidth = 2.8
  ctx.beginPath()
  for (const rail of [-13, 13]) {
    ctx.moveTo(-10, rail)
    ctx.lineTo(14, rail)
    ctx.quadraticCurveTo(18, rail, 21, rail * 0.8)
  }
  ctx.stroke()
  ctx.fillStyle = '#d76c49'
  ctx.fillRect(-9, -6, 7, 12)
  ctx.fillStyle = '#f8f4d3'
  ctx.fillRect(-7, -1.5, 6, 3)
  ctx.fillStyle = '#477282'
  ctx.beginPath()
  ctx.ellipse(14, 0, 6, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(1, 0)
  if (!reducedMotion) {
    ring(ctx, 0, 0, 26, '#effbe46b', 2.4)
    ctx.rotate(time * 21)
  }
  ctx.strokeStyle = reducedMotion ? '#334b52' : '#eaf4d9a4'
  ctx.lineWidth = progress > 0.85 ? 2 : 3
  ctx.beginPath()
  ctx.moveTo(-25, 0)
  ctx.lineTo(26, 0)
  ctx.moveTo(0, -24)
  ctx.lineTo(0, 25)
  ctx.stroke()
  ctx.fillStyle = '#324954'
  ctx.beginPath()
  ctx.arc(0, 0, 3.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function paintAircraft(ctx, plane, destination, time, selected, reducedMotion, { silhouette, trim }, stretch = 1) {
  const type = aircraftTypes[plane.kind]
  const progress = (plane.landing?.time ?? 0) / (type.landingDuration ?? 1.55)
  const scale = type.size * (1 - progress * 0.24)
  const warning = plane.warning || (plane.escape ? 1 : 0)
  const visualHeading = projectedHeading(plane.heading, stretch)
  ctx.save()
  ctx.translate(plane.x, plane.y)
  ctx.scale(1 / stretch, 1)
  ctx.translate(-plane.x, -plane.y)
  const x = Math.max(14, Math.min(width - 14, plane.x))
  const y = Math.max(14, Math.min(height - 14, plane.y))
  if (selected) ring(ctx, x, y, 36, destination.color, 3)
  if (!warning && !selected && plane.age < 2 && !plane.landing) {
    ctx.save()
    ctx.globalAlpha = reducedMotion ? 0.8 : 1 - plane.age / 2
    ring(ctx, x, y, 32 + (reducedMotion ? 0 : plane.age * 5), destination.color, 2.5)
    ctx.restore()
  }
  if (warning) {
    const severity = warning === 2 ? '#ff816e' : '#ffdf85'
    ring(ctx, x, y, 33, '#273844', 5)
    ring(ctx, x, y, 33, severity, 3)
    if (!reducedMotion) ring(ctx, x, y, 39 + Math.sin(time * 7) * 3, severity + '88', 1.5)
    badge(ctx, x, y - 45, plane.escape ? 'TURN BACK' : '!', severity)
  }

  ctx.save()
  ctx.globalAlpha = 1 - Math.max(0, progress - 0.7) * 2.8
  ctx.translate(plane.x, plane.y)
  ctx.save()
  ctx.translate(6 * (1 - progress), 8 * (1 - progress))
  ctx.rotate(visualHeading)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#142d3770'
  ctx.fill(silhouette)
  ctx.restore()
  ctx.rotate(visualHeading)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#fff3d8'
  ctx.strokeStyle = '#253a44'
  ctx.lineWidth = 2
  ctx.fill(silhouette)
  ctx.stroke(silhouette)
  ctx.fillStyle = destination.color
  ctx.fill(trim)
  ctx.fillStyle = '#305066'
  ctx.beginPath()
  ctx.ellipse(13, 0, 4, 2.6, 0, 0, Math.PI * 2)
  ctx.fill()
  if (plane.kind === 'jet') {
    ctx.fillStyle = '#687b82'
    ctx.fillRect(-9, -12, 7, 4)
    ctx.fillRect(-9, 8, 7, 4)
    for (let x = -14; x <= 5; x += 4) ctx.fillRect(x, -2, 1.5, 4)
  } else if (plane.kind === 'turbo') {
    ctx.fillStyle = '#607982'
    ctx.fillRect(-9, -17, 12, 6)
    ctx.fillRect(-9, 11, 12, 6)
    ctx.strokeStyle = '#eef5d5'
    ctx.lineWidth = 2
    ctx.globalAlpha *= reducedMotion ? 0.65 : 0.46 + Math.sin(time * 42) * 0.18
    ctx.beginPath()
    for (const engine of [-14, 14]) {
      ctx.moveTo(4, engine - 6)
      ctx.lineTo(4, engine + 6)
    }
    ctx.stroke()
  } else if (plane.kind === 'heli') {
    paintRescueMarkings(ctx, time, reducedMotion, progress)
  } else {
    ctx.strokeStyle = '#e6f8ef'
    ctx.globalAlpha *= reducedMotion ? 0.65 : 0.43 + Math.sin(time * 44) * 0.18
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(21, -8)
    ctx.lineTo(21, 8)
    ctx.stroke()
  }
  if (plane.kind !== 'heli' && !reducedMotion && Math.sin(time * 4 + plane.id) > 0.35) {
    ctx.fillStyle = '#fca19b'
    ctx.fillRect(-13, -17, 3, 3)
    ctx.fillStyle = '#c5f8b4'
    ctx.fillRect(-13, 14, 3, 3)
  }
  ctx.restore()
  if (!plane.landing && !plane.escape && !plane.warning) badge(ctx, x, y + 32, destination.id, destination.color, 14)
  ctx.restore()
}

export class AirportView {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: false })
    this.paths = Object.fromEntries(Object.entries(silhouettes).map(([kind, path]) => [
      kind, { silhouette: new Path2D(path), trim: new Path2D(trimPaths[kind]) },
    ]))
  }

  paint(session, draft, effects, reducedMotion) {
    const { canvas, ctx } = this
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const pixelWidth = Math.round(canvas.clientWidth * dpr)
    const pixelHeight = Math.round(canvas.clientHeight * dpr)
    if (pixelWidth < 1 || pixelHeight < 1) return
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }
    const stretch = projectionStretch(canvas.clientWidth, canvas.clientHeight, width, height)
    ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0)
    if (this.airport !== session.airport) {
      this.airport = session.airport
      this.scenery = createScenery(this.airport)
    }
    ctx.drawImage(this.scenery, 0, 0, width, height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (!reducedMotion && this.airport.scenery === 'coast') {
      const sweep = session.time * 0.7
      ctx.beginPath()
      ctx.moveTo(542, 424)
      ctx.arc(542, 424, 48, sweep - 0.51, sweep)
      ctx.closePath()
      ctx.fillStyle = '#c8f4d43b'
      ctx.fill()
      const boat = (session.time * 4) % 180
      if (boat > 29 && boat < 163) paintBoat(ctx, 34 + boat * 0.3, 370 + boat, 1.25)
    }

    if (!reducedMotion && this.airport.scenery === 'regional') paintRegionalTrain(ctx, session.time)
    if (!reducedMotion && this.airport.scenery === 'island') paintIslandActivity(ctx, session.time)
    if (!reducedMotion && (this.airport.scenery === 'city' || this.airport.scenery === 'grand')) {
      paintMetroActivity(ctx, session.time, this.airport.scenery === 'grand')
    }
    const draftDestination = draft && session.destinationFor(draft.plane)
    const readyToSnap = draftDestination && snapsToDestination(draft.points, draftDestination)
    for (const destination of Object.values(this.airport.destinations)) {
      const armed = (readyToSnap && draftDestination === destination) ||
        session.planes.some((plane) => plane.route?.destinationId === destination.id)
      if (destination.type === 'helipad') {
        const settling = session.planes.some((plane) => plane.destinationId === destination.id && plane.landing)
        paintHelipad(ctx, destination, armed, settling)
      } else {
        paintRunwayGate(ctx, destination, armed)
      }
    }

    const first = session.planes[0]
    if (session.mode === 'playing' && session.arrivals === 1 && session.score === 0 && !draft && first && !first.route) {
      const plane = first
      const gate = destinationGate(session.destinationFor(plane))
      if (plane.x < gate.x - 28) trail(ctx, [{ x: plane.x + 27, y: plane.y }, gate], '#ffe9ad')
    }
    for (const plane of session.planes) {
      if (plane.route && plane !== draft?.plane) {
        trail(ctx, [plane, ...plane.route.points.slice(plane.route.cursor)], session.destinationFor(plane).color)
      }
    }
    if (draft) trail(ctx, draft.points, session.destinationFor(draft.plane).color, true)
    for (const plane of session.planes) paintAircraft(ctx, plane, session.destinationFor(plane), session.time, draft?.plane === plane, reducedMotion, this.paths[plane.kind], stretch)

    for (const effect of effects) {
      const age = session.time - effect.time
      const rise = reducedMotion ? 0 : age * 29
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - age / 1.65)
      if (!reducedMotion) {
        for (let i = 0; i < 7; i++) {
          const spark = offset(effect, i * 0.9, 14 + age * 38)
          ring(ctx, spark.x, spark.y, 2.6 * (1 - age / 1.65), effect.color, 2)
        }
      }
      badge(ctx, effect.x, effect.y - 36 - rise, '+1', effect.color, 21)
      ctx.restore()
    }
  }
}
