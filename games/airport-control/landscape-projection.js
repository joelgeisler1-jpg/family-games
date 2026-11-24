// The simulated airspace is 680×780. In landscape, the display projects it
// into a wider panel without changing world coordinates or collision rules.
// Keep aircraft sprites circular/proportional and facing their screen velocity.
export function projectionStretch(cssWidth, cssHeight, worldWidth = 680, worldHeight = 780) {
  if (!(cssWidth > 0 && cssHeight > 0)) return 1
  return (cssWidth / worldWidth) / (cssHeight / worldHeight)
}

export function projectedHeading(heading, stretch) {
  return Math.atan2(Math.sin(heading), Math.cos(heading) * stretch)
}

export function screenToAirspace(clientX, clientY, bounds, worldWidth = 680, worldHeight = 780) {
  return {
    x: (clientX - bounds.left) * worldWidth / bounds.width,
    y: (clientY - bounds.top) * worldHeight / bounds.height,
  }
}
