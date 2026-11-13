import raw from './missions.json'
import { Missions, type Mission } from './schema'

/** Dataset validado al cargar: si un dato está mal formado, la app falla en desarrollo y no en el evento. */
export const missions: Mission[] = Missions.parse(raw).sort(
  (a, b) => Date.parse(a.landedAt) - Date.parse(b.landedAt),
)

export const missionById = new Map(missions.map((m) => [m.id, m]))

export type { Mission }
