import { height, width } from './airfield.js'
import { building, circle, generator, rect, shape } from './art.js'

const airfield = 'M 453 91 Q 514 72 548 112 C 567 137 565 182 581 210 Q 607 247 609 284 C 608 312 641 328 629 368 Q 622 399 590 422 C 560 448 582 463 554 487 Q 535 506 547 532 C 558 563 525 594 488 589 C 459 586 454 601 418 603 C 346 605 332 581 299 589 Q 256 606 213 577 C 184 559 161 557 157 523 C 153 494 176 475 158 449 C 141 425 113 408 122 374 C 115 348 131 330 156 315 Q 175 304 174 276 C 172 244 185 216 217 208 C 253 195 256 177 284 168 C 307 157 337 169 349 149 Q 368 120 406 119 Z'
const station = 'M 268 620 Q 294 605 333 617 C 357 623 364 605 403 609 Q 444 607 465 632 Q 488 659 471 686 C 452 707 416 701 398 717 Q 376 744 337 736 Q 311 726 283 729 C 257 730 235 706 232 684 Q 227 651 254 641 Z'
const islets = [
  'M 79 114 Q 96 83 126 79 C 145 77 159 97 171 102 Q 192 109 187 131 C 187 158 151 173 123 163 Q 89 164 79 146 Q 68 133 79 114 Z',
  'M 568 652 Q 590 630 620 644 C 637 657 619 672 627 688 Q 648 715 621 734 C 604 746 592 731 577 730 C 555 729 536 715 539 694 Q 542 668 568 652 Z',
  'M 265 69 Q 286 57 306 69 Q 320 79 307 91 Q 289 102 268 90 Q 253 82 265 69 Z',
]
const coastlines = [airfield, station, ...islets]

function paintLagoon(ctx) {
  const sea = ctx.createLinearGradient(640, 0, 70, height)
  sea.addColorStop(0, '#147080')
  sea.addColorStop(0.5, '#228c98')
  sea.addColorStop(1, '#257c8c')
  rect(ctx, 0, 0, width, height, sea)

  const lagoon = ctx.createRadialGradient(134, 490, 24, 220, 459, 364)
  lagoon.addColorStop(0, '#48bdb0')
  lagoon.addColorStop(0.65, '#299aa0')
  lagoon.addColorStop(1, '#298fa300')
  rect(ctx, 0, 0, width, height, lagoon)

  const reefRidges = [
    'M -20 166 Q 21 189 69 203 C 93 210 99 232 124 227 Q 167 215 183 184',
    'M -30 474 Q 30 468 55 520 C 75 565 112 568 143 590 Q 174 614 186 671',
    'M 488 725 Q 497 759 581 770 Q 658 773 702 733',
    'M 573 66 Q 620 108 630 189 C 639 215 657 238 702 243',
  ]
  for (const ridge of reefRidges) {
    shape(ctx, ridge, null, '#4cadab8c', 33)
    shape(ctx, ridge, null, '#66c4b27a', 15)
    ctx.setLineDash([14, 19, 4, 16])
    shape(ctx, ridge, null, '#a7d9b9a0', 2.2)
    ctx.setLineDash([])
  }

  const random = generator()
  ctx.beginPath()
  for (let index = 0; index < 295; index++) {
    const x = random() * width
    const y = random() * height
    const span = 3 + random() * 13
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + span / 2, y - 2, x + span, y)
  }
  ctx.lineWidth = 1
  ctx.strokeStyle = '#b1e3c548'
  ctx.stroke()

  for (const shoreline of coastlines) shape(ctx, shoreline, null, '#75d0b888', 46)
  for (const shoreline of coastlines) shape(ctx, shoreline, null, '#87d5b8', 23)
  for (const shoreline of coastlines) shape(ctx, shoreline, '#e3c78d', '#dae7b6', 7)

  ctx.save()
  const land = new Path2D()
  for (const shoreline of coastlines) land.addPath(new Path2D(shoreline))
  ctx.clip(land)
  const foliage = ctx.createLinearGradient(130, 130, 580, 685)
  foliage.addColorStop(0, '#9eb870')
  foliage.addColorStop(0.56, '#88ab6f')
  foliage.addColorStop(1, '#739c68')
  rect(ctx, 67, 67, 575, 687, foliage)
  for (const shoreline of coastlines) shape(ctx, shoreline, null, '#e4cb91', 13)
  for (const shoreline of coastlines) shape(ctx, shoreline, null, '#f1daa6', 6)
  shape(ctx, 'M 192 278 C 220 247 247 247 267 210 Q 290 180 337 192 C 380 204 377 241 359 264 Q 336 294 302 286 Q 255 285 230 319 Q 197 344 178 322 Z', '#799d6a')
  shape(ctx, 'M 253 248 Q 281 185 331 204 Q 366 216 339 254 Q 315 283 285 263 Z', '#659366')
  shape(ctx, 'M 232 279 Q 251 252 269 256 Q 295 281 328 261 T 360 220 M 215 295 Q 241 268 259 272 Q 287 297 329 278', null, '#a8bd7c', 1.5)
  shape(ctx, 'M 140 337 Q 204 314 252 322 L 547 312 Q 619 317 633 363 V 423 L 538 512 L 527 565 Q 499 593 451 574 Q 411 563 373 590 Q 350 594 303 576 Q 275 565 239 582 L 178 544 L 181 470 L 130 408 Z', '#a1b980')

  for (let index = 0; index < 3500; index++) {
    const x = random() * width
    const y = random() * height
    const light = random() > 0.56
    rect(ctx, x, y, 1 + random() * 2.3, 1, light ? '#eff4b431' : '#315b5240')
  }
  ctx.restore()
}

function palm(ctx, x, y, size, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(size, size)
  circle(ctx, 3.5, 4.5, 6, '#507b577d')
  shape(ctx, 'M 2 4 Q -2 1 -1 -1', null, '#93814d', 2.8)
  for (let leaf = 0; leaf < 6; leaf++) {
    ctx.rotate(Math.PI / 3)
    shape(ctx, 'M -1 1 Q 2 -8 9 -5 Q 4 -4 1 2 Z', leaf % 3 === 0 ? '#b2c57c' : '#4f845c')
  }
  circle(ctx, 0, 0, 1.8, '#d0c17e')
  ctx.restore()
}

function paintPalms(ctx) {
  const random = generator()
  const groves = [
    [112, 127, 26, 18, 12], [143, 143, 21, 8, 7], [283, 78, 12, 5, 5],
    [230, 244, 36, 19, 14], [303, 222, 44, 23, 19], [393, 144, 21, 11, 8],
    [453, 123, 18, 14, 9], [550, 143, 5, 16, 6], [573, 235, 15, 19, 9],
    [168, 428, 17, 13, 9], [191, 505, 19, 18, 10], [567, 415, 18, 15, 8],
    [233, 566, 21, 9, 8], [484, 576, 28, 7, 9], [431, 686, 26, 10, 13],
    [265, 689, 11, 13, 7], [576, 689, 18, 17, 14], [608, 706, 11, 13, 8],
  ]
  for (const [cx, cy, rx, ry, count] of groves) {
    for (let index = 0; index < count; index++) {
      const bearing = random() * Math.PI * 2
      const r = Math.sqrt(random())
      palm(ctx, cx + Math.cos(bearing) * rx * r, cy + Math.sin(bearing) * ry * r, 0.73 + random() * 0.6, random() * Math.PI)
    }
  }
}

function dock(ctx, x, y, angle, length) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  rect(ctx, -1, -4, length + 3, 13, '#356b6b80')
  rect(ctx, 0, -6, length, 12, '#c6a779')
  for (let plank = 4; plank < length; plank += 5) rect(ctx, plank, -6, 0.9, 12, '#9c835f')
  rect(ctx, 0, -6, length, 1.5, '#edca98')
  for (let post = 3; post < length; post += 11) {
    circle(ctx, post, -5, 1.8, '#7c6f57')
    circle(ctx, post, 5, 1.8, '#7c6f57')
  }
  ctx.restore()
}

function rescueBoat(ctx, x, y, heading, wake = false) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(heading)
  if (wake) {
    shape(ctx, 'M -11 -2 Q -22 -6 -36 -9 M -11 3 Q -22 7 -36 10 M -15 0 H -28', null, '#bbe7c5a0', 1.3)
  }
  shape(ctx, 'M -9 4 V -3 H 2 Q 8 -3 12 0 Q 9 5 3 6 H -7 Z', '#386b70')
  shape(ctx, 'M -9 3 V -4 H 1 Q 7 -4 11 -1 Q 8 4 1 5 H -8 Z', '#f4dfb2', '#5b8d87', 1)
  rect(ctx, -5, -3, 7, 7, '#df9564')
  rect(ctx, 0, -2, 2.2, 5, '#466d78')
  ctx.restore()
}

function windsock(ctx, x, y, heading, breeze = 0) {
  ctx.save()
  ctx.translate(x, y)
  circle(ctx, 0, 0, 5, '#d7cc9f')
  shape(ctx, 'M 0 1 L 3 8', null, '#5f795f', 2)
  ctx.rotate(heading + breeze)
  shape(ctx, 'M 1 -4 L 14 -2 L 20 0 L 14 2 L 1 4 Z', '#e4a47d', '#aa765d', 1)
  shape(ctx, 'M 6 -3 L 9 -3 L 9 3 L 6 3 Z M 14 -2 L 17 -1 L 17 1 L 14 2 Z', '#faf0cb')
  circle(ctx, 0, 0, 1.6, '#6c775f')
  ctx.restore()
}

function paintFacilities(ctx) {
  // Shared access road, lighted aprons, and taxiway links between strips.
  const road = 'M 228 378 V 513 Q 228 523 243 523 H 474 Q 489 523 489 512 V 378 M 504 294 V 323 Q 504 329 495 331 H 467'
  shape(ctx, 'M 234 390 H 484 L 516 414 L 514 491 L 489 516 H 233 L 211 486 V 414 Z', '#a5ac95', '#c5bb92', 4)
  shape(ctx, road, null, '#76847b', 16)
  shape(ctx, road, null, '#e5cc83', 1.5)
  const service = 'M 376 554 V 590 Q 377 601 386 608 L 397 618 V 644'
  shape(ctx, service, null, '#577975', 15)
  shape(ctx, service, null, '#b0a48a', 11)
  shape(ctx, service, null, '#e5cb95', 1.4)
  for (const y of [574, 585, 596, 606, 619]) {
    circle(ctx, y < 600 ? 369 : 383, y, 1.7, '#f4d9a2')
  }

  for (let stand = 0; stand < 4; stand++) {
    const x = 300 + stand * 39
    shape(ctx, `M ${x} 409 V 442 M ${x - 8} 434 H ${x + 8}`, null, '#e3d7aa', 1.4)
    rect(ctx, x + 11, 433, 5, 9, '#768e86')
  }
  for (const [x, y, w, h, roof, trim] of [
    [272, 452, 104, 30, '#d4dbba', '#f0e2ba'],
    [309, 446, 36, 27, '#aecac0', '#d2e4c6'],
    [385, 453, 57, 38, '#d5a579', '#efd5a0'],
    [453, 445, 32, 36, '#9bbab3', '#c7d6b8'],
    [534, 298, 47, 25, '#a5beb3', '#d2d9b5'],
    [211, 288, 50, 23, '#ceaa7e', '#ebd3a1'],
    [364, 636, 69, 31, '#d69571', '#f3c38b'],
    [399, 673, 33, 19, '#a8c4b4', '#dbddba'],
  ]) {
    building(ctx, x, y, w, h, roof, trim)
  }
  for (const x of [282, 290, 298, 357, 365]) rect(ctx, x, 457, 5, 10, '#839e95')
  for (const [x, y] of [[396, 474], [416, 474], [458, 467], [472, 467]]) {
    rect(ctx, x, y, 9, 14, '#778d80')
    rect(ctx, x, y, 9, 2, '#ead3a0')
  }
  for (const [x, y] of [[250, 418], [456, 420], [242, 511], [472, 504], [517, 317]]) {
    circle(ctx, x + 1.5, y + 2, 3, '#62887d')
    circle(ctx, x, y, 2.2, '#f4dba5')
  }

  // The pad marker is painted by the destination renderer over this apron.
  shape(ctx, 'M 274 628 H 338 L 352 643 V 690 L 338 705 H 280 L 268 690 V 645 Z', '#888f84', '#bcb99d', 4)
  shape(ctx, 'M 281 637 H 335 L 343 646 V 688 L 334 697 H 284 L 276 687 V 646 Z', '#647b77', '#c4c3a2', 2)
  for (const [x, y] of [[279, 645], [340, 645], [279, 688], [340, 688]]) {
    circle(ctx, x, y, 3.6, '#4e6a66')
    circle(ctx, x, y, 1.9, '#f1d6a0')
  }
  ctx.save()
  ctx.font = '800 10px system-ui'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#583f37'
  ctx.fillText('RESCUE', 397, 652)
  ctx.restore()

  dock(ctx, 174, 466, Math.PI, 45)
  dock(ctx, 246, 672, Math.PI + 0.22, 50)
  dock(ctx, 242, 689, Math.PI - 0.14, 35)
  rescueBoat(ctx, 134, 454, -0.12)
  rescueBoat(ctx, 217, 650, 0.27)
  rescueBoat(ctx, 201, 702, Math.PI + 0.25)

  // Keep these positions clear of the interactive gate labels.
  windsock(ctx, 178, 303, 0.2)
  windsock(ctx, 556, 270, -0.1)
  windsock(ctx, 359, 700, 0.28)
}

function paintShoals(ctx) {
  for (const [x, y] of [[74, 199], [103, 213], [134, 215], [161, 202], [595, 607], [572, 615]]) {
    circle(ctx, x + 1, y + 2, 4, '#478b8b')
    circle(ctx, x, y, 3.3, '#ead085')
    circle(ctx, x, y, 1.2, '#f9ead2')
  }
  shape(ctx, 'M 561 706 L 568 699 L 577 702 L 585 698 L 599 710 L 591 720 L 573 721 Z', '#a4a88d', '#d2c394', 1.5)
  for (const [x, y, radius] of [[574, 711, 3], [584, 714, 4], [589, 706, 2.1]]) {
    circle(ctx, x, y, radius, '#8a9c88')
  }
  circle(ctx, 596, 682, 12, '#748d73')
  circle(ctx, 593, 678, 10, '#efdbaf')
  circle(ctx, 593, 678, 7, '#ce8b69')
  circle(ctx, 592, 677, 4, '#f8e8bd')
  ctx.save()
  ctx.font = '700 10px system-ui'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#d6e9ce'
  ctx.fillText('R E E F   P A S S', 60, 562)
  ctx.fillText('M A N G R O V E   C A Y', 112, 191)
  ctx.restore()
}

export function paintIsland(ctx) {
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  paintLagoon(ctx)
  paintPalms(ctx)
  paintFacilities(ctx)
  paintShoals(ctx)
  ctx.restore()
}

export function paintIslandActivity(ctx, time) {
  // The patrol stays on the lagoon side of the approach markers.
  const phase = time * 0.16
  const x = 58 + Math.cos(phase) * 22
  const y = 337 + Math.sin(phase) * 100
  const heading = Math.atan2(Math.cos(phase) * 100, -Math.sin(phase) * 22)
  rescueBoat(ctx, x, y, heading, true)
}
