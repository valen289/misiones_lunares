import type { Outcome } from '../data/schema'

/** Misma forma que en el globo: círculo = éxito, anillo con punto = parcial, rombo hueco = fallida. */
export function OutcomeIcon({ outcome, color, size = 12 }: { outcome: Outcome; color?: string; size?: number }) {
  const c = color ?? (outcome === 'fallida' ? 'var(--color-fail)' : 'currentColor')
  return (
    <svg width={size} height={size} viewBox="-6 -6 12 12" aria-hidden="true" className="shrink-0">
      {outcome === 'exito' && <circle r="5" fill={c} />}
      {outcome === 'parcial' && (
        <>
          <circle r="4.1" fill="none" stroke={c} strokeWidth="1.8" />
          <circle r="1.6" fill={c} />
        </>
      )}
      {outcome === 'fallida' && <rect x="-3.4" y="-3.4" width="6.8" height="6.8" transform="rotate(45)" fill="none" stroke={c} strokeWidth="1.6" />}
    </svg>
  )
}
