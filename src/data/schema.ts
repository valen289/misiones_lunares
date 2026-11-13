import { z } from 'zod'

/**
 * Precisión de las coordenadas:
 * - "lro": coordenada medida sobre imágenes del Lunar Reconnaissance Orbiter.
 * - "nominal": coordenada histórica informada por la misión (puede diferir unos km del sitio real).
 */
export const CoordPrecision = z.enum(['lro', 'nominal'])

/** Precisión de la hora de alunizaje. */
export const TimePrecision = z.enum(['segundo', 'minuto', 'dia'])

export const Outcome = z.enum(['exito', 'parcial', 'fallida'])

export const Source = z.object({
  label: z.string().min(3),
  url: z.url(),
})

export const Mission = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  operator: z.string().min(2),
  country: z.string().min(2),
  operatorType: z.enum(['estatal', 'privada']),
  crewed: z.boolean(),
  rover: z.boolean(),
  sampleReturn: z.boolean(),
  outcome: Outcome,
  /** Momento del alunizaje (o del impacto, si fue fallido), en UTC. */
  landedAt: z.iso.datetime(),
  timePrecision: TimePrecision,
  /** Latitud selenográfica en grados, norte positivo. */
  lat: z.number().min(-90).max(90),
  /** Longitud selenográfica en grados, este positivo (-180 a 180). */
  lon: z.number().min(-180).max(180),
  coordPrecision: CoordPrecision,
  site: z.string().min(3),
  summary: z.string().min(10).max(160),
  sources: z.array(Source).min(1),
})

export const Missions = z.array(Mission)

export type Mission = z.infer<typeof Mission>
export type Outcome = z.infer<typeof Outcome>
