import { describe, expect, it } from 'vitest'
import raw from './missions.json'
import { Missions } from './schema'

const missions = Missions.parse(raw)

describe('dataset de misiones', () => {
  it('pasa la validación del esquema', () => expect(missions.length).toBeGreaterThanOrEqual(30))

  it('no repite ids', () => {
    expect(new Set(missions.map((m) => m.id)).size).toBe(missions.length)
  })

  it('tiene fuente https en cada fila', () => {
    for (const m of missions) for (const s of m.sources) expect(s.url.startsWith('https://')).toBe(true)
  })

  it('no tiene fechas futuras ni anteriores a 1966', () => {
    for (const m of missions) {
      const t = Date.parse(m.landedAt)
      expect(t).toBeGreaterThan(Date.parse('1966-01-01'))
      expect(t).toBeLessThan(Date.now())
    }
  })

  it('las misiones tripuladas son exactamente las seis Apolo', () => {
    expect(missions.filter((m) => m.crewed).map((m) => m.name)).toEqual([
      'Apolo 11', 'Apolo 12', 'Apolo 14', 'Apolo 15', 'Apolo 16', 'Apolo 17',
    ])
  })
})
