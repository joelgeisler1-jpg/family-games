import { height, offset, runways, width } from './airfield.js'

function shape(ctx, path, fill, stroke, weight = 1) {
  const outline = new Path2D(path)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill(outline)
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = weight
    ctx.stroke(outline)
  }
}

function circle(ctx, x, y, radius, fill) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(x, y, w, h)
}

function generator() {
  let seed = 84217
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

const shore = 'M 155 -15 C 155 67 120 87 133 148 C 146 201 188 211 166 274 C 147 324 127 335 138 386 C 151 433 103 472 115 528 C 133 594 179 587 188 637 C 205 699 260 694 310 677 C 362 659 375 702 420 710 C 479 717 534 660 581 674 C 624 686 652 732 706 733 L 708 -15 Z'
const road = 'M 242 -12 C 243 77 204 84 200 145 C 197 191 238 204 238 246 L 238 268 Q 238 282 256 282 H 459 Q 483 282 483 260 V 132 Q 483 113 502 113 H 691'
const serviceRoad = 'M 194 556 C 249 595 341 594 396 577 S 490 561 532 591 Q 589 640 687 616'

function paintNature(ctx) {
  const sea = ctx.createLinearGradient(0, 0, 550, 780)
  sea.addColorStop(0, '#12677e')
  sea.addColorStop(0.55, '#209aa0')
  sea.addColorStop(1, '#155f79')
  rect(ctx, 0, 0, width, height, sea)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  shape(ctx, shore, null, '#51aea9', 67)
  shape(ctx, shore, null, '#73c6b0', 38)
  shape(ctx, shore, null, '#dfefd2', 12)
  shape(ctx, shore, '#9fae63', '#ebd59b', 8)

  ctx.save()
  ctx.clip(new Path2D(shore))
  const grass = ctx.createLinearGradient(230, 10, 660, 730)
  grass.addColorStop(0, '#95a661')
  grass.addColorStop(0.47, '#bcc27d')
  grass.addColorStop(1, '#859e58')
  rect(ctx, 0, 0, width, height, grass)
  shape(ctx, 'M 215 -15 Q 340 40 448 14 Q 538 13 589 89 Q 616 128 690 136 V -15 Z', '#819d5c')
  shape(ctx, 'M 178 224 Q 242 233 251 271 Q 267 284 284 282 L 647 286 Q 675 285 693 268 L 696 579 Q 620 603 553 583 Q 505 563 467 571 Q 356 610 245 568 Q 176 541 175 461 Z', '#bfc88a')
  shape(ctx, 'M 128 550 Q 242 591 290 615 Q 348 642 407 606 Q 478 567 528 604 Q 607 675 697 644 V 755 H 120 Z', '#7e9e58')
  shape(ctx, 'M 271 630 Q 329 660 402 625 T 534 628 M 308 646 Q 354 657 403 640 T 504 633 M 294 33 Q 373 61 450 39 T 574 88 M 306 48 Q 370 75 449 56 T 559 86', null, '#adc181', 2)
  const random = generator()
  for (let i = 0; i < 4100; i++) {
    const x = random() * width
    const y = random() * height
    ctx.globalAlpha = 0.05 + random() * 0.13
    rect(ctx, x, y, 1 + random() * 3.5, 1 + random() * 1.5, random() > 0.45 ? '#f7edb1' : '#415e49')
  }
  ctx.globalAlpha = 1
  ctx.restore()

  const waterRandom = generator()
  const land = new Path2D(shore)
  for (let i = 0; i < 225; i++) {
    const x = waterRandom() * width
    const y = waterRandom() * height
    const length = 5 + waterRandom() * 20
    if (ctx.isPointInPath(land, (x + length + 12) * 2, (y - 8) * 2)) continue
    ctx.globalAlpha = 0.10 + waterRandom() * 0.22
    shape(ctx, `M ${x} ${y} q ${length / 2} -2 ${length} 0`, null, '#b8f3d5', 1.3)
  }
  ctx.globalAlpha = 1

  for (const [x, y, size] of [[46, 580, 15], [74, 600, 9], [64, 623, 6], [222, 737, 14], [205, 748, 6]]) {
    shape(ctx, `M ${x - size} ${y + 2} l ${size * 0.45} ${-size * 0.7} ${size * 1.15} ${-size * 0.2} ${size * 0.5} ${size * 0.8} ${-size * 0.8} ${size * 0.4} z`, '#91ab78', '#a8d5a9', 3)
  }
}

function paintRoads(ctx) {
  for (const path of [road, serviceRoad]) {
    shape(ctx, path, null, '#bfc387', 19)
    shape(ctx, path, null, '#6c776d', 13)
    shape(ctx, path, null, '#89948a', 10)
    ctx.setLineDash([7, 10])
    shape(ctx, path, null, '#e7deae', 1.25)
    ctx.setLineDash([])
  }

  for (const [x, y, angle, color] of [[214, 186, 1.0, '#f0bd67'], [391, 281, 0, '#e9f0c7'], [545, 112, 0, '#e9f0c7'], [541, 598, 0.55, '#c68563'], [319, 584, 0, '#f0bd67']]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    rect(ctx, -7, -3, 16, 7, '#4c6058')
    rect(ctx, -8, -4, 15, 6, color)
    rect(ctx, 1, -4, 3, 6, '#536d70')
    ctx.restore()
  }
}

function paintTrees(ctx) {
  const random = generator()
  const groups = [[334, 103, 80, 47], [613, 57, 85, 40], [634, 233, 58, 49], [160, 434, 27, 36], [243, 612, 44, 29], [448, 655, 74, 38], [609, 645, 52, 17], [557, 166, 24, 20]]
  for (const [cx, cy, rx, ry] of groups) {
    const trees = Array.from({ length: 24 }, () => {
      const angle = random() * Math.PI * 2
      const r = Math.sqrt(random())
      return { x: cx + Math.cos(angle) * rx * r, y: cy + Math.sin(angle) * ry * r, size: 3.2 + 5 * random() }
    }).sort((a, b) => a.y - b.y)
    for (const { x, y, size } of trees) {
      circle(ctx, x + 3, y + 3, size, '#5c804c')
      circle(ctx, x, y, size, '#4e7854')
      circle(ctx, x - size * 0.24, y - size * 0.29, size * 0.74, '#6c9760')
      circle(ctx, x - size * 0.36, y - size * 0.45, size * 0.31, '#8aa969')
    }
  }
}

function building(ctx, x, y, w, h, roof, trim) {
  rect(ctx, x + 5, y + 8, w + 3, h, '#667d6e')
  rect(ctx, x, y + 5, w, h + 1, '#426779')
  rect(ctx, x, y, w, h, roof)
  rect(ctx, x, y, w, 3, trim)
  rect(ctx, x + 3, y + h - 3, w - 6, 3, '#6f9196')
  for (let column = 6; column < w - 4; column += 10) {
    rect(ctx, x + column, y + h, 6, 4, '#8ebfc4')
  }
}

function paintTerminal(ctx) {
  shape(ctx, 'M 261 311 V 297 Q 261 291 269 291 H 453 L 477 309 H 613 V 455 L 561 485 H 306 L 258 454 V 318 Z', '#939e90', '#c5c79f', 4)
  for (const y of [326, 482]) {
    shape(ctx, `M 254 ${y} H 576 Q 599 ${y} 599 ${y + 23} V ${y + 37}`, null, '#758681', 19)
    shape(ctx, `M 254 ${y} H 576 Q 599 ${y} 599 ${y + 23} V ${y + 37}`, null, '#c5bd6a', 1.5)
  }
  shape(ctx, 'M 265 367 V 473 Q 265 482 279 482 M 566 363 V 479', null, '#74837d', 18)
  shape(ctx, 'M 265 367 V 473 Q 265 482 279 482 M 566 363 V 479', null, '#d9cd7c', 1.4)

  rect(ctx, 302, 399, 225, 52, '#a5ae9b')
  for (let x = 320; x <= 499; x += 28) {
    shape(ctx, `M ${x - 7} 444 v 12 m 0 -8 h 15 m -5 -4 v 12`, null, '#dbd9a4', 1.4)
    rect(ctx, x - 3, 432, 7, 10, '#658189')
  }
  building(ctx, 305, 407, 217, 24, '#d9e3ce', '#f6edd2')
  building(ctx, 366, 397, 96, 29, '#b7d8d2', '#e5f5db')
  for (let x = 378; x < 455; x += 16) rect(ctx, x, 402, 9, 12, '#7db0b4')
  building(ctx, 275, 429, 24, 18, '#dbbb88', '#f0d6a4')
  building(ctx, 594, 404, 34, 22, '#b5c8b0', '#e8e7c5')
  building(ctx, 590, 443, 46, 22, '#c2d3bb', '#e7eacb')
  building(ctx, 414, 242, 52, 27, '#c0d0b0', '#e7e3b6')
  building(ctx, 365, 246, 38, 24, '#b6c9aa', '#e7e3b6')
  rect(ctx, 308, 245, 42, 28, '#838e7c')
  for (let x = 311; x < 345; x += 7) rect(ctx, x, 247, 1, 9, '#d3d3ab')
  rect(ctx, 317, 252, 5, 8, '#ebd389')
  rect(ctx, 338, 262, 5, 8, '#aecbd2')

  circle(ctx, 547, 428, 16, '#6c8781')
  circle(ctx, 542, 424, 14, '#dddbb2')
  circle(ctx, 542, 424, 11, '#355d6d')
  circle(ctx, 540, 421, 5, '#90bdba')
}

function paintRunway(ctx, runway) {
  ctx.save()
  ctx.translate(runway.x, runway.y)
  ctx.rotate(runway.heading)
  const { length, width: span } = runway
  rect(ctx, -9, -span / 2 - 6, length + 17, span + 12, '#768c70')
  rect(ctx, -4, -span / 2 - 2, length + 8, span + 4, '#c3c5a3')
  rect(ctx, 0, -span / 2, length, span, '#384c50')
  rect(ctx, 1, -span / 2 + 3, length - 2, span - 6, '#455a5d')
  rect(ctx, 2, -span / 2 + 5, length - 4, 1, '#c0c8b8')
  rect(ctx, 2, span / 2 - 6, length - 4, 1, '#c0c8b8')
  for (let x = 55; x < length - 12; x += 27) rect(ctx, x, -1, 13, 2, '#e2e4cb')
  for (let y = -span / 2 + 9; y < span / 2 - 7; y += 6) {
    rect(ctx, 6, y, 13, 3, '#e9e5cf')
    rect(ctx, length - 19, y, 13, 3, '#a9b8ab')
  }
  for (let x = 7; x < length; x += 17) {
    circle(ctx, x, -span / 2 - 3, 2, runway.color)
    circle(ctx, x, span / 2 + 3, 2, runway.color)
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '800 14px system-ui'
  ctx.fillStyle = '#f6f3dd'
  ctx.fillText(runway.number, 36, 0)
  for (const side of [-1, 1]) {
    rect(ctx, -2, side * (span / 2 + 6) - 2, 10, 4, runway.color)
  }
  ctx.restore()
}

function paintDetails(ctx) {
  ctx.save()
  ctx.translate(86, 705)
  circle(ctx, 0, 0, 27, '#145f6d')
  circle(ctx, 0, 0, 24, '#216e7a')
  shape(ctx, 'M 0 -17 L 6 5 L 0 2 L -6 5 Z', '#d8e8ce')
  shape(ctx, 'M 0 16 L 6 7 L 0 9 L -6 7 Z', '#80aaa4')
  ctx.font = '700 10px system-ui'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#e0ebce'
  ctx.fillText('N', 0, -33)
  ctx.restore()

  ctx.save()
  ctx.translate(62, 241)
  ctx.rotate(-Math.PI / 2)
  ctx.font = '700 11px system-ui'
  ctx.fillStyle = '#b7e2cd'
  ctx.fillText('H A R B O U R   B A Y', 0, 0)
  ctx.restore()

  paintBoat(ctx, 94, 121, -0.65)
  paintBoat(ctx, 552, 724, 0.15)
  for (const [x, y, angle] of [[156, 270, 0.32], [165, 295, -0.25], [290, 685, 0.63]]) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    rect(ctx, -29, -5, 33, 10, '#c7a97a')
    rect(ctx, -29, -6, 34, 2, '#ebd6a5')
    for (let post = -27; post < 5; post += 7) rect(ctx, post, -5, 1, 10, '#987f61')
    ctx.restore()
  }
  for (const runway of Object.values(runways)) {
    const point = offset(runway, runway.heading, -77)
    const approach = offset(runway, runway.heading, -11)
    ctx.setLineDash([5, 8])
    shape(ctx, `M ${point.x} ${point.y} H ${approach.x}`, null, runway.color, 2)
    ctx.setLineDash([])
  }
}

export function paintBoat(ctx, x, y, heading) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(heading)
  shape(ctx, 'M -6 -3 L -27 -6 M -6 3 L -27 6', null, '#91cec0', 1.2)
  shape(ctx, 'M -8 -4 H 3 L 11 0 L 3 4 H -8 Z', '#f0e0ba', '#478d8d', 1)
  rect(ctx, -4, -2, 6, 4, '#bf8067')
  ctx.restore()
}

export function createScenery() {
  const canvas = document.createElement('canvas')
  canvas.width = width * 2
  canvas.height = height * 2
  const ctx = canvas.getContext('2d')
  ctx.scale(2, 2)
  paintNature(ctx)
  paintRoads(ctx)
  paintTrees(ctx)
  paintTerminal(ctx)
  for (const runway of Object.values(runways)) paintRunway(ctx, runway)
  paintDetails(ctx)
  return canvas
}
