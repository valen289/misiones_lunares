import { describe, expect, it } from 'vitest'
import { latLonToVector, surfaceDistanceKm, isNearSide, zoneOf } from './geo'

describe('latLonToVector', () => {
  const close = (v: number[], w: number[]) => v.forEach((x, i) => expect(x).toBeCloseTo(w[i], 9))

  it('pone la longitud 0 mirando a la cámara (+Z)', () => close(latLonToVector(0, 0), [0, 0, 1]))
  it('pone el este a la derecha (+X)', () => close(latLonToVector(0, 90), [1, 0, 0]))
  it('pone el oeste a la izquierda (-X)', () => close(latLonToVector(0, -90), [-1, 0, 0]))
  it('pone el norte arriba (+Y)', () => close(latLonToVector(90, 0), [0, 1, 0]))
  it('pone la cara oculta detrás (-Z)', () => close(latLonToVector(0, 180), [0, 0, -1]))
})

describe('surfaceDistanceKm', () => {
  it('da medio perímetro entre puntos antípodas', () => {
    expect(surfaceDistanceKm(0, 0, 0, 180)).toBeCloseTo(Math.PI * 1737.4, 3)
  })
  it('ubica al Apolo 12 a unos 180 m del Surveyor 3 (coordenadas LRO)', () => {
    const d = surfaceDistanceKm(-3.0128, -23.4219, -3.0162, -23.418) * 1000
    expect(d).toBeGreaterThan(130)
    expect(d).toBeLessThan(230)
  })
})

describe('clasificación', () => {
  it('distingue cara visible y oculta', () => {
    expect(isNearSide(23.47)).toBe(true)
    expect(isNearSide(177.6)).toBe(false)
    expect(isNearSide(-153.98)).toBe(false)
  })
  it('clasifica zonas por latitud', () => {
    expect(zoneOf(0.67)).toBe('ecuatorial')
    expect(zoneOf(-45.4)).toBe('latitudes medias')
    expect(zoneOf(-84.8)).toBe('polar')
  })
})
