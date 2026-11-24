// Pure view model for the optional large-screen arrival board.
// This never changes aircraft state or the simulation.
export function flightBoardEntries(planes, destinations, limit = 7) {
  return planes.filter(plane => !plane.landing || plane.kind === 'heli').slice(0, limit).map(plane => {
    const destination = destinations[plane.destinationId]
    const status = plane.landing ? 'Landing'
      : plane.escape ? 'Turn back'
      : plane.warning ? 'Traffic alert'
      : plane.route?.destinationId === plane.destinationId ? 'Cleared'
      : plane.route ? 'On route' : 'Awaiting route'
    return {
      id: plane.id,
      kind: plane.kind,
      destinationId: plane.destinationId,
      destinationColor: destination?.color ?? '#f6ead5',
      status,
      alert: Boolean(plane.escape || plane.warning),
    }
  })
}
