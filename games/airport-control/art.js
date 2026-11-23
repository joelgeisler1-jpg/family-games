export function shape(ctx, path, fill, stroke, weight = 1) {
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

export function circle(ctx, x, y, radius, fill) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
}

export function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(x, y, w, h)
}

export function generator() {
  let seed = 84217
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

export function building(ctx, x, y, w, h, roof, trim) {
  rect(ctx, x + 5, y + 8, w + 3, h, '#667d6e')
  rect(ctx, x, y + 5, w, h + 1, '#426779')
  rect(ctx, x, y, w, h, roof)
  rect(ctx, x, y, w, 3, trim)
  rect(ctx, x + 3, y + h - 3, w - 6, 3, '#6f9196')
  for (let column = 6; column < w - 4; column += 10) {
    rect(ctx, x + column, y + h, 6, 4, '#8ebfc4')
  }
}
