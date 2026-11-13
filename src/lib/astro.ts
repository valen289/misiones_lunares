import * as Astronomy from 'astronomy-engine'
import { angularSeparationDeg } from './geo'

const DEG = Math.PI / 180

type Vec = [number, number, number]

/**
 * Lleva un vector del sistema ecuatorial J2000 (EQJ) al sistema fijo a la Luna
 * (modelo de rotación IAU: polo α0, δ0 y meridiano W).
 */
function toMoonFixed(v: Vec, date: Date): Vec {
  const axis = Astronomy.RotationAxis(Astronomy.Body.Moon, date)
  const a = (axis.ra * 15 + 90) * DEG // ra viene en horas
  const b = (90 - axis.dec) * DEG
  const w = axis.spin * DEG
  // Rz(a)
  let [x, y, z] = v
  ;[x, y] = [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)]
  // Rx(b)
  ;[y, z] = [y * Math.cos(b) + z * Math.sin(b), -y * Math.sin(b) + z * Math.cos(b)]
  // Rz(w)
  ;[x, y] = [x * Math.cos(w) + y * Math.sin(w), -x * Math.sin(w) + y * Math.cos(w)]
  return [x, y, z]
}

function toLatLon([x, y, z]: Vec): { lat: number; lon: number } {
  const r = Math.hypot(x, y, z)
  return { lat: Math.asin(z / r) / DEG, lon: Math.atan2(y, x) / DEG }
}

/** Punto de la Luna donde el Sol está en el cenit en ese instante. */
export function subsolarPoint(date: Date): { lat: number; lon: number } {
  const sun = Astronomy.GeoVector(Astronomy.Body.Sun, date, true)
  const moon = Astronomy.GeoMoon(date)
  return toLatLon(toMoonFixed([sun.x - moon.x, sun.y - moon.y, sun.z - moon.z], date))
}

/** Punto de la Luna donde la Tierra está en el cenit en ese instante. */
export function subEarthPoint(date: Date): { lat: number; lon: number } {
  const moon = Astronomy.GeoMoon(date)
  return toLatLon(toMoonFixed([-moon.x, -moon.y, -moon.z], date))
}

/** Altura (grados) de un astro sobre el horizonte de un sitio, dado su punto subastral. */
function elevationFrom(sub: { lat: number; lon: number }, lat: number, lon: number): number {
  return 90 - angularSeparationDeg(sub.lat, sub.lon, lat, lon)
}

export function sunElevation(date: Date, lat: number, lon: number): number {
  return elevationFrom(subsolarPoint(date), lat, lon)
}

export function earthElevation(date: Date, lat: number, lon: number): number {
  return elevationFrom(subEarthPoint(date), lat, lon)
}

export type MoonPhaseInfo = { angle: number; illuminated: number; name: string }

/** Fase de la Luna vista desde la Tierra en esa fecha. */
export function moonPhase(date: Date): MoonPhaseInfo {
  const angle = Astronomy.MoonPhase(date)
  const illuminated = Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction
  const names = [
    'Luna nueva',
    'Creciente',
    'Cuarto creciente',
    'Gibosa creciente',
    'Luna llena',
    'Gibosa menguante',
    'Cuarto menguante',
    'Menguante',
  ]
  const name = names[Math.floor(((angle + 22.5) % 360) / 45)]
  return { angle, illuminated, name }
}
