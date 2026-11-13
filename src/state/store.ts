import { create } from 'zustand'
import { missionById, missions, type Mission } from '../data/missions'

export const MAX_SLOTS = 3
export const SLOT_LETTERS = ['A', 'B', 'C'] as const

export type KindFilter = 'todas' | 'tripuladas' | 'roboticas'
export type LightMode = 'alunizaje' | 'pleno'

type State = {
  /** Misiones elegidas para comparar, en ranuras fijas A/B/C (null = libre). */
  slots: (string | null)[]
  /** Orden en que se ocuparon las ranuras, para reemplazar la más antigua. */
  history: string[]
  /** Misión a la que mira la cámara y cuya iluminación se muestra. */
  focusId: string | null
  hoveredId: string | null
  kind: KindFilter
  includeFailed: boolean
  light: LightMode
  toggle: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  focus: (id: string | null) => void
  hover: (id: string | null) => void
  setKind: (k: KindFilter) => void
  setIncludeFailed: (v: boolean) => void
  setLight: (l: LightMode) => void
}

function readUrl(): string[] {
  if (typeof window === 'undefined') return []
  const ids = new URLSearchParams(window.location.search).get('m')?.split(',') ?? []
  return ids.filter((id) => missionById.has(id)).slice(0, MAX_SLOTS)
}

const initialIds = readUrl()

export const useStore = create<State>((set, get) => ({
  slots: [0, 1, 2].map((i) => initialIds[i] ?? null),
  history: initialIds,
  focusId: initialIds.at(-1) ?? null,
  hoveredId: null,
  kind: 'todas',
  includeFailed: true,
  light: 'alunizaje',

  toggle: (id) => {
    const { slots, history } = get()
    if (slots.includes(id)) return get().remove(id)
    const next = [...slots]
    let nextHistory = [...history]
    const free = next.indexOf(null)
    if (free >= 0) {
      next[free] = id
    } else {
      const oldest = nextHistory[0]
      next[next.indexOf(oldest)] = id
      nextHistory = nextHistory.slice(1)
    }
    set({ slots: next, history: [...nextHistory, id], focusId: id })
  },

  remove: (id) => {
    const { slots, history, focusId } = get()
    const nextHistory = history.filter((h) => h !== id)
    set({
      slots: slots.map((s) => (s === id ? null : s)),
      history: nextHistory,
      focusId: focusId === id ? (nextHistory.at(-1) ?? null) : focusId,
    })
  },

  clear: () => set({ slots: [null, null, null], history: [], focusId: null }),
  focus: (id) => set({ focusId: id }),
  hover: (id) => set({ hoveredId: id }),
  setKind: (kind) => set({ kind }),
  setIncludeFailed: (includeFailed) => set({ includeFailed }),
  setLight: (light) => set({ light }),
}))

// Mantener la URL sincronizada para poder compartir una comparación (por ejemplo, con un QR).
useStore.subscribe((s, prev) => {
  if (s.slots === prev.slots || typeof window === 'undefined') return
  const ids = s.slots.filter(Boolean)
  const url = new URL(window.location.href)
  if (ids.length) url.searchParams.set('m', ids.join(','))
  else url.searchParams.delete('m')
  window.history.replaceState(null, '', url)
})

export function slotIndexOf(slots: (string | null)[], id: string): number {
  return slots.indexOf(id)
}

export function matchesFilters(m: Mission, kind: KindFilter, includeFailed: boolean): boolean {
  if (!includeFailed && m.outcome === 'fallida') return false
  if (kind === 'tripuladas') return m.crewed
  if (kind === 'roboticas') return !m.crewed
  return true
}

/** Misiones visibles: las que pasan los filtros, más las elegidas (nunca se ocultan). */
export function useVisibleMissions(): Mission[] {
  const kind = useStore((s) => s.kind)
  const includeFailed = useStore((s) => s.includeFailed)
  const slots = useStore((s) => s.slots)
  return missions.filter((m) => slots.includes(m.id) || matchesFilters(m, kind, includeFailed))
}
