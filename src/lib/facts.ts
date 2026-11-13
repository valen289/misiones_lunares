import type { Mission } from '../data/missions'
import { earthElevation, moonPhase, sunElevation, type MoonPhaseInfo } from './astro'
import { isNearSide, zoneOf, type Zone } from './geo'

export type Facts = {
  /** Altura del Sol en el sitio al alunizar (null si no se conoce la hora). */
  sun: number | null
  earth: number | null
  phase: MoonPhaseInfo
  nearSide: boolean
  zone: Zone
}

const cache = new Map<string, Facts>()

export function factsFor(m: Mission): Facts {
  const hit = cache.get(m.id)
  if (hit) return hit
  const date = new Date(m.landedAt)
  const timed = m.timePrecision !== 'dia'
  const f: Facts = {
    sun: timed ? sunElevation(date, m.lat, m.lon) : null,
    earth: timed || !isNearSide(m.lon) ? earthElevation(date, m.lat, m.lon) : null,
    phase: moonPhase(date),
    nearSide: isNearSide(m.lon),
    zone: zoneOf(m.lat),
  }
  cache.set(m.id, f)
  return f
}

export const OUTCOME_LABEL = { exito: 'Éxito', parcial: 'Parcial', fallida: 'Fallida' } as const

export function kindLabel(m: Mission): string {
  const base = m.crewed ? 'Tripulada' : 'Robótica'
  const extras = [m.rover && 'rover', m.sampleReturn && 'trajo muestras'].filter(Boolean)
  return extras.length ? `${base}, ${extras.join(' y ')}` : base
}
