import { describe, expect, it } from 'vitest'
import { sunElevation, earthElevation, moonPhase } from './astro'

/**
 * Altura del Sol en el momento del alunizaje según los informes de misión Apollo.
 * Es una prueba independiente de toda la cadena: efemérides, modelo de rotación IAU
 * de la Luna y nuestra convención de coordenadas.
 */
const apollo = [
  { name: 'Apolo 11', at: '1969-07-20T20:17:40Z', lat: 0.67416, lon: 23.47314, sun: 10.8 },
  { name: 'Apolo 12', at: '1969-11-19T06:54:35Z', lat: -3.0128, lon: -23.4219, sun: 5.1 },
  { name: 'Apolo 14', at: '1971-02-05T09:18:11Z', lat: -3.64589, lon: -17.47194, sun: 10.3 },
  { name: 'Apolo 15', at: '1971-07-30T22:16:29Z', lat: 26.13239, lon: 3.6333, sun: 12.2 },
  // Apolo 16 tenía planificados 11,9° pero alunizó casi 6 h tarde por una falla del motor
  // del módulo de comando; el Sol sube ~0,5°/h en la Luna. Se prueban ambos instantes.
  { name: 'Apolo 16 (hora planificada)', at: '1972-04-20T20:41:35Z', lat: -8.9734, lon: 15.5011, sun: 11.9 },
  { name: 'Apolo 16 (hora real)', at: '1972-04-21T02:23:35Z', lat: -8.9734, lon: 15.5011, sun: 14.8 },
  { name: 'Apolo 17', at: '1972-12-11T19:54:58Z', lat: 20.1911, lon: 30.7723, sun: 13.3 },
]

describe('sunElevation', () => {
  for (const m of apollo) {
    it(`${m.name}: Sol a ~${m.sun}° al alunizar`, () => {
      expect(sunElevation(new Date(m.at), m.lat, m.lon)).toBeCloseTo(m.sun, 0)
    })
  }
})

describe('earthElevation', () => {
  it('la Tierra se ve alta desde el Apolo 11', () => {
    expect(earthElevation(new Date('1969-07-20T20:17:40Z'), 0.67, 23.47)).toBeGreaterThan(55)
  })
  it('la Tierra no se ve desde el Chang\'e 4 (cara oculta)', () => {
    expect(earthElevation(new Date('2019-01-03T02:26:00Z'), -45.44, 177.6)).toBeLessThan(0)
  })
})

describe('moonPhase', () => {
  it('reconoce la Luna llena del 2 de agosto de 2012', () => {
    expect(moonPhase(new Date('2012-08-02T03:27:00Z')).name).toBe('Luna llena')
  })
  it('Apolo 11 alunizó con la Luna creciente vista desde la Tierra', () => {
    const p = moonPhase(new Date('1969-07-20T20:17:40Z'))
    expect(p.angle).toBeGreaterThan(0)
    expect(p.angle).toBeLessThan(90)
  })
})
