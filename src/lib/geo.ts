/** Radio medio de la Luna en km (IAU). */
export const MOON_RADIUS_KM = 1737.4

const DEG = Math.PI / 180

/**
 * Convierte coordenadas selenográficas (grados, este positivo) a un punto 3D
 * en la escena. Convención: longitud 0 mira hacia +Z (la cámara inicial),
 * el este queda a la derecha (+X) y el norte arriba (+Y).
 */
export function latLonToVector(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = lat * DEG
  const lambda = lon * DEG
  return [
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  ]
}

/** Distancia sobre la superficie (gran círculo) entre dos puntos, en km. */
export function surfaceDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * DEG
  const p2 = lat2 * DEG
  const dp = p2 - p1
  const dl = (lon2 - lon1) * DEG
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return 2 * MOON_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** Ángulo central (grados) entre dos puntos de la esfera. */
export function angularSeparationDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return surfaceDistanceKm(lat1, lon1, lat2, lon2) / MOON_RADIUS_KM / DEG
}

/** Cara visible: la que mira a la Tierra (longitudes entre -90° y 90°, sin contar la libración). */
export function isNearSide(lon: number): boolean {
  return Math.abs(lon) < 90
}

export type Zone = 'ecuatorial' | 'latitudes medias' | 'polar'

export function zoneOf(lat: number): Zone {
  const a = Math.abs(lat)
  if (a < 20) return 'ecuatorial'
  if (a < 60) return 'latitudes medias'
  return 'polar'
}
