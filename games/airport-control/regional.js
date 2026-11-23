import { height, width } from './airfield.js'
import { building, circle, generator, rect, shape } from './art.js'

const river = 'M 123 -20 C 152 63 113 94 93 136 S 119 233 104 279 S 35 340 57 393 S 102 463 66 528 S 68 610 104 645 S 164 718 106 808'
const rail = 'M 606 -12 Q 571 94 584 205 L 619 331 Q 640 411 630 496 L 615 630 Q 611 711 648 802'

function field(ctx, path, fill, rows) {
  const boundary = new Path2D(path)
  ctx.fillStyle = fill
  ctx.fill(boundary)
  ctx.save()
  ctx.clip(boundary)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#30483a29'
  ctx.beginPath()
  for (let x = -430; x < width + 300; x += 11) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x + rows, height)
  }
  ctx.stroke()
  ctx.restore()
  shape(ctx, path, null, '#829863', 3)
}

function grove(ctx, x, y, w, h, count, random) {
  for (let i = 0; i < count; i++) {
    const a = random() * Math.PI * 2
    const r = Math.sqrt(random())
    const tx = x + Math.cos(a) * w * r
    const ty = y + Math.sin(a) * h * r
    const size = 3 + random() * 6
    circle(ctx, tx + 3, ty + 3, size, '#67845b')
    circle(ctx, tx, ty, size, '#4f7651')
    circle(ctx, tx - 1.6, ty - 1.8, size * 0.64, '#82a669')
  }
}

export function paintRegional(ctx) {
  const meadow = ctx.createLinearGradient(0, 0, 500, height)
  meadow.addColorStop(0, '#c7c782')
  meadow.addColorStop(0.6, '#aab879')
  meadow.addColorStop(1, '#8eaa71')
  rect(ctx, 0, 0, width, height, meadow)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  field(ctx, 'M 1 8 L 111 5 Q 130 46 111 89 L 80 156 L 0 171 Z', '#98b77a', -46)
  field(ctx, 'M 148 10 L 294 12 L 328 68 L 300 117 L 127 121 Q 160 64 148 10 Z', '#d5bb71', 215)
  field(ctx, 'M 342 7 L 495 0 L 518 64 L 468 103 L 340 86 Z', '#adbb79', -275)
  field(ctx, 'M 128 159 L 311 143 L 370 185 L 352 262 L 148 287 Q 153 225 128 159 Z', '#b7be76', 295)
  field(ctx, 'M 0 234 L 79 217 Q 104 284 50 303 L 0 309 Z', '#d4bd79', 140)
  field(ctx, 'M 134 666 L 296 652 L 321 732 L 237 782 L 123 782 Q 171 734 134 666 Z', '#cbb67c', 170)
  field(ctx, 'M 364 677 L 472 654 L 590 682 L 608 780 L 342 780 Z', '#acb76b', -90)
  field(ctx, 'M 636 195 L 680 175 L 680 331 L 657 335 Z', '#c9b577', -50)
  field(ctx, 'M 0 568 L 40 566 Q 45 627 95 661 L 58 721 L 0 711 Z', '#a1ae6a', -200)

  shape(ctx, river, null, '#7f9f72', 43)
  shape(ctx, river, null, '#acc290', 34)
  shape(ctx, river, null, '#69a9a8', 29)
  shape(ctx, river, null, '#4d929b', 21)
  shape(ctx, 'M 105 24 q 9 24 -2 44 M 95 110 q -9 15 -14 24 M 92 236 q 3 19 -2 36 M 50 369 q 3 13 17 30 M 74 590 q 1 15 21 35 M 136 693 q 7 16 6 34', null, '#b7d5b3', 1.8)

  const road = 'M -10 319 H 101 C 170 319 159 348 226 347 H 435 Q 454 347 454 367 V 493 Q 454 508 476 508 H 683'
  shape(ctx, road, null, '#c6c595', 19)
  shape(ctx, road, null, '#6f7b6f', 13)
  shape(ctx, road, null, '#a3a792', 9)
  ctx.setLineDash([5, 8])
  shape(ctx, road, null, '#e3dba6', 1.2)
  ctx.setLineDash([])
  rect(ctx, 56, 309, 38, 2, '#e4cc9b')
  rect(ctx, 56, 329, 38, 2, '#857c62')

  shape(ctx, rail, null, '#d2bc8d', 12)
  ctx.setLineDash([2, 4])
  shape(ctx, rail, null, '#645e55', 10)
  ctx.setLineDash([])
  const track = new Path2D(rail)
  ctx.save()
  for (const delta of [-3, 3]) {
    ctx.translate(delta, 0)
    ctx.strokeStyle = '#e0d0a6'
    ctx.lineWidth = 1.3
    ctx.stroke(track)
    ctx.translate(-delta, 0)
  }
  ctx.restore()

  const random = generator()
  grove(ctx, 191, 97, 52, 17, 14, random)
  grove(ctx, 385, 113, 41, 23, 18, random)
  grove(ctx, 548, 76, 40, 37, 18, random)
  grove(ctx, 158, 284, 35, 25, 14, random)
  grove(ctx, 90, 531, 35, 35, 16, random)
  grove(ctx, 495, 692, 42, 27, 18, random)

  for (const [x, y, columns, rows] of [[211, 184, 7, 4], [390, 706, 6, 4]]) {
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        circle(ctx, x + col * 15 + 2, y + row * 14 + 2, 4.2, '#7e9462')
        circle(ctx, x + col * 15, y + row * 14, 3.8, '#5b8757')
      }
    }
  }

  shape(ctx, 'M 172 458 H 582 L 591 477 V 553 L 510 559 H 232 L 172 527 Z', '#a4aa91', '#d6cda4', 3)
  shape(ctx, 'M 211 441 V 550 Q 211 563 227 563 H 464 Q 479 563 496 570 L 548 541 V 441 M 506 290 V 354 H 565', null, '#78887d', 15)
  shape(ctx, 'M 211 441 V 550 Q 211 563 227 563 H 464 Q 479 563 496 570 L 548 541 V 441 M 506 290 V 354 H 565', null, '#e9d487', 1.2)
  building(ctx, 247, 486, 132, 38, '#dab183', '#f0d2a0')
  building(ctx, 289, 474, 48, 34, '#d4d5b2', '#f1e6bc')
  building(ctx, 392, 500, 37, 32, '#afcac1', '#dddfbd')
  building(ctx, 450, 493, 47, 38, '#b4cabb', '#ebdfb9')
  building(ctx, 528, 350, 56, 24, '#b9c3a9', '#e1e1b6')
  building(ctx, 240, 247, 62, 33, '#b88969', '#dfaa82')
  building(ctx, 196, 123, 53, 19, '#c1a077', '#edca93')
  building(ctx, 603, 350, 37, 25, '#bd9a73', '#f1d7a1')
  for (let x = 253; x < 376; x += 12) rect(ctx, x, 537, 1, 13, '#e1d8aa')

  for (const [x, y] of [[565, 108], [138, 554], [567, 723]]) {
    circle(ctx, x + 4, y + 4, 12, '#637f66')
    circle(ctx, x, y, 11, '#c4cab0')
    shape(ctx, `M ${x} ${y} l -6 -8 m 6 8 l 10 -2 m -10 2 l -2 10`, null, '#ebeed6', 2.7)
  }

  ctx.font = '700 11px system-ui'
  ctx.fillStyle = '#435e4c'
  ctx.fillText('O R C H A R D   V A L L E Y', 167, 168)
  ctx.fillText('F I E L D   S T A T I O N', 381, 624)
}

export function paintRegionalTrain(ctx, time) {
  const y = 110 + time * 11 % 650
  const x = y < 205 ? 584 : y < 400 ? 584 + (y - 205) * 0.23 : 629 - (y - 400) * 0.034
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(y < 205 ? 0 : y < 400 ? -0.22 : 0.07)
  for (let index = 0; index < 3; index++) {
    const offset = index * 15
    rect(ctx, -4, -offset, 8, 13, index === 0 ? '#f5c278' : '#9ab5a6')
    rect(ctx, -2, 3 - offset, 4, 4, '#34576a')
  }
  ctx.restore()
}
