import { width, height } from './airfield.js'
import { building, circle, generator, rect, shape } from './art.js'

// Two hand-drawn metropolitan airport environments. All background imagery
// is pre-rendered once per level, keeping 60 Hz flight animations lightweight.
function boulevard(ctx, x1, y1, x2, y2, lanes = 21) {
  ctx.lineCap = 'round'
  shape(ctx, `M ${x1} ${y1} L ${x2} ${y2}`, null, '#667879', lanes + 9)
  shape(ctx, `M ${x1} ${y1} L ${x2} ${y2}`, null, '#3e5861', lanes)
  ctx.setLineDash([11, 11])
  shape(ctx, `M ${x1} ${y1} L ${x2} ${y2}`, null, '#b6a98b', 1.7)
  ctx.setLineDash([])
}

function block(ctx, x, y, w, h, n, grand, random) {
  const colors = grand
    ? ['#9eb4b4', '#c7c4b4', '#90abb8', '#bea8a2', '#a8b6a4']
    : ['#b3c2bb', '#bdb3a6', '#cfbb9c', '#a8b6b8', '#d4bdb1']
  rect(ctx, x - 5, y - 5, w + 10, h + 10, grand ? '#849b96' : '#98aaa1')
  for (let i = 0; i < n; i++) {
    const col = i % 3
    const row = Math.floor(i / 3)
    const bw = (w - 10) / 3 - 3
    const bh = (h - 12) / Math.ceil(n / 3) - 4
    const bx = x + 5 + col * ((w - 10) / 3)
    const by = y + 6 + row * ((h - 12) / Math.ceil(n / 3))
    if (bw < 5 || bh < 5) continue
    const roof = colors[Math.floor(random() * colors.length)]
    building(ctx, bx, by, bw, bh, roof, '#e5e4d1')
    for (let wx = bx + 5; wx < bx + bw - 3; wx += 12) {
      rect(ctx, wx, by + 5, 3, 3, '#dce4d0')
    }
  }
}

function garden(ctx, x, y, w, h, random) {
  rect(ctx, x, y, w, h, '#688d77')
  rect(ctx, x + 5, y + 5, w - 10, h - 10, '#81ab86')
  for (let i = 0; i < 24; i++) {
    const tx = x + 9 + random() * (w - 18)
    const ty = y + 8 + random() * (h - 16)
    circle(ctx, tx + 2, ty + 2, 3.7, '#456b5a')
    circle(ctx, tx, ty, 3.3, i % 2 ? '#517d61' : '#b0c381')
  }
}

function apron(ctx, grand) {
  // Aprons between the approach strips, with multiple distinctive concourses.
  const apronColor = grand ? '#7d9694' : '#849a92'
  rect(ctx, 216, 380, 318, grand ? 107 : 94, apronColor)
  rect(ctx, 216, 380, 318, 4, '#b5b8a3')
  rect(ctx, 216, grand ? 485 : 472, 318, 3, '#c4c7aa')
  for (let x = 244; x < 528; x += 39) {
    shape(ctx, `M ${x} 390 V 416 M ${x - 10} 404 H ${x + 10}`, null, '#d7d7b3', 1.5)
    rect(ctx, x + 13, 405, 6, 10, '#e6d3a0')
    rect(ctx, x + 20, 413, 5, 7, '#6c8984')
  }
  shape(ctx, 'M 197 337 V 445 H 548 V 350', null, '#647a77', grand ? 21 : 17)
  shape(ctx, 'M 197 337 V 445 H 548 V 350', null, '#c6b87e', 1.8)
  building(ctx, 258, 431, 224, 30, grand ? '#d6d9c5' : '#d6d3bb', '#f0ead2')
  building(ctx, 338, 420, 75, 24, '#a3c4c5', '#e1e6cf')
  for (let x = 350; x < 408; x += 12) rect(ctx, x, 424, 7, 13, '#648b95')
  if (grand) {
    // Two long pier terminals and a midfield satellite.
    building(ctx, 260, 369, 200, 19, '#bbc9bb', '#e7dfc2')
    for (let x = 282; x < 462; x += 43) {
      building(ctx, x, 347, 19, 24, '#a4bdbc', '#f3e9d4')
      rect(ctx, x + 4, 355, 10, 7, '#698c99')
    }
    building(ctx, 286, 481, 171, 27, '#c3c8ae', '#f0e9cd')
    for (let x = 299; x < 446; x += 38) building(ctx, x, 508, 22, 17, '#a7beb5', '#dae3ce')
  }
  for (const [x, y, size] of [[228, 400, 3], [497, 412, 3], [479, 452, 4], [207, 428, 2]]) {
    circle(ctx, x, y, size + 2, '#516e6c')
    circle(ctx, x, y, size, '#efdba1')
  }
}

function city(ctx) {
  const land = ctx.createLinearGradient(0, 0, width, height)
  land.addColorStop(0, '#7ea9a6')
  land.addColorStop(0.5, '#8eb69e')
  land.addColorStop(1, '#739b93')
  rect(ctx, 0, 0, width, height, land)

  // River and bridges distinguish this map from the coastal and island levels.
  shape(ctx, 'M -30 114 C 91 146 112 111 175 150 S 295 194 350 145 Q 424 86 491 103 T 714 43', null, '#477c91', 82)
  shape(ctx, 'M -30 114 C 91 146 112 111 175 150 S 295 194 350 145 Q 424 86 491 103 T 714 43', null, '#5798a7', 65)
  shape(ctx, 'M -30 105 C 91 137 112 102 175 141 S 295 185 350 136 Q 424 77 491 94 T 714 34', null, '#aad3c099', 2)
  boulevard(ctx, -20, 218, 702, 218, 20)
  boulevard(ctx, 75, 0, 75, 780, 20)
  boulevard(ctx, 620, 0, 620, 780, 22)
  boulevard(ctx, -20, 717, 702, 717, 23)
  boulevard(ctx, 355, 223, 355, 780, 14)
  boulevard(ctx, 205, 645, 690, 295, 15)
  const random = generator()
  const locations = [
    [109, 244, 92, 80, 11], [231, 236, 94, 62, 9], [367, 242, 90, 58, 8],
    [102, 384, 85, 94, 11], [106, 507, 90, 82, 13], [235, 512, 83, 73, 9],
    [371, 537, 87, 55, 8], [106, 630, 79, 62, 9], [474, 635, 86, 57, 7],
    [521, 227, 78, 83, 10], [527, 354, 70, 83, 8],
  ]
  for (const [x, y, w, h, n] of locations) block(ctx, x, y, w, h, n, false, random)
  garden(ctx, 233, 621, 97, 62, random)
  garden(ctx, 512, 511, 75, 70, random)
  // Sports ground and clock tower provide imaginative urban landmarks.
  ctx.save()
  ctx.translate(151, 183)
  ctx.rotate(-0.2)
  rect(ctx, -40, -25, 80, 50, '#c3c5ab')
  rect(ctx, -35, -20, 70, 40, '#5c9b78')
  circle(ctx, 0, 0, 10, '#c5d6b7')
  rect(ctx, -2, -20, 4, 40, '#bed8c2')
  ctx.restore()
  circle(ctx, 565, 176, 17, '#708e93')
  circle(ctx, 563, 173, 13, '#d9c89f')
  circle(ctx, 563, 173, 9, '#f4e7bb')
  shape(ctx, 'M 563 173 L 563 166 M 563 173 L 570 176', null, '#556f79', 2)
  apron(ctx, false)
  ctx.font = 'bold 12px system-ui'
  ctx.fillStyle = '#d8eada'
  ctx.fillText('CITY AIRPORT', 237, 607)
}

function grand(ctx) {
  const ground = ctx.createLinearGradient(0, 0, width, height)
  ground.addColorStop(0, '#8fa5a7')
  ground.addColorStop(0.49, '#a8b4a1')
  ground.addColorStop(1, '#7b9b9f')
  rect(ctx, 0, 0, width, height, ground)
  const random = generator()
  // A huge multi-ring roadway and service tunnels mark the hub.
  for (const [x1, y1, x2, y2] of [
    [-20, 288, 700, 288], [-20, 592, 700, 592],
    [80, -20, 80, 800], [615, -20, 615, 800],
    [13, 111, 665, 760], [0, 665, 667, 7],
  ]) boulevard(ctx, x1, y1, x2, y2, 19)
  for (const [x, y, w, h, n] of [
    [110, 44, 110, 91, 14], [240, 45, 112, 74, 11], [388, 46, 115, 74, 12],
    [115, 162, 123, 74, 11], [272, 148, 96, 69, 8], [415, 141, 95, 90, 14],
    [110, 388, 97, 89, 11], [116, 512, 90, 51, 6], [224, 613, 95, 81, 12],
    [409, 613, 99, 82, 12], [510, 498, 90, 68, 7],
  ]) block(ctx, x, y, w, h, n, true, random)
  garden(ctx, 260, 175, 93, 48, random)
  garden(ctx, 124, 657, 72, 68, random)
  // Air cargo warehouses, rail terminal and parked airport shuttles.
  for (let i = 0; i < 5; i++) {
    const x = 112 + i * 37
    building(ctx, x, 731, 32, 22, '#adb8b4', '#e4dfc8')
    rect(ctx, x + 6, 737, 18, 3, '#7897a4')
  }
  for (let i = 0; i < 10; i++) {
    const x = 94 + i * 24
    rect(ctx, x, 702, 14, 5, '#566f73')
    rect(ctx, x + 3, 703, 5, 3, '#eacb8e')
  }
  shape(ctx, 'M 210 771 H 502', null, '#617476', 8)
  shape(ctx, 'M 210 771 H 502', null, '#cfcaad', 3)
  apron(ctx, true)
  // A big circular radar dome and cargo containers add hub-scale detail.
  circle(ctx, 536, 355, 21, '#5c7779')
  circle(ctx, 533, 351, 17, '#c6d5c5')
  circle(ctx, 532, 349, 11, '#eef0d9')
  for (let i = 0; i < 4; i++) rect(ctx, 470 + i * 22, 558, 18, 11, i % 2 ? '#d0a477' : '#aec4bd')
  ctx.font = 'bold 13px system-ui'
  ctx.fillStyle = '#ecf1d8'
  ctx.fillText('GRAND TERMINAL', 250, 551)
}

export function paintCityAirport(ctx) {
  ctx.save()
  city(ctx)
  ctx.restore()
}

export function paintGrandAirport(ctx) {
  ctx.save()
  grand(ctx)
  ctx.restore()
}

export function paintMetroActivity(ctx, time, grandMode) {
  // Animate a tiny electric shuttle along a road, with no gameplay collision.
  const track = grandMode ? 592 : 717
  const x = (time * (grandMode ? 14 : 19) + 75) % 790 - 50
  ctx.save()
  ctx.translate(x, track)
  rect(ctx, -10, -5, 19, 10, '#364e57')
  rect(ctx, -10, -6, 19, 7, grandMode ? '#e5c881' : '#c6e4e0')
  rect(ctx, -6, -6, 6, 6, '#789bb0')
  rect(ctx, 2, -6, 5, 6, '#789bb0')
  circle(ctx, -5, 5, 2, '#354b50')
  circle(ctx, 6, 5, 2, '#354b50')
  ctx.restore()
}
