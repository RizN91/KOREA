export function haversineKm(a: {lat:number; lon:number}, b: {lat:number; lon:number}) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lon - a.lon) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function nearestNextRoute(points: { id: string; lat: number; lon: number }[], start: { lat: number; lon: number }) {
  const remaining = [...points]
  const route: string[] = []
  let current = { ...start }
  while (remaining.length) {
    let bestIdx = 0, bestDist = Infinity
    remaining.forEach((p, i) => {
      const d = haversineKm(current, p)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    })
    const [next] = remaining.splice(bestIdx, 1)
    route.push(next.id)
    current = { lat: next.lat, lon: next.lon }
  }
  return route
}