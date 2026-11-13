import { OUTCOME_LABEL } from '../lib/facts'
import { formatYear } from '../lib/format'
import { useStore, useVisibleMissions } from '../state/store'
import { SlotBadge } from './ComparePanel'
import { OutcomeIcon } from './OutcomeIcon'

/** Lista accesible con teclado: la otra forma de elegir misiones, además del globo. */
export function MissionList() {
  const visible = useVisibleMissions()
  const slots = useStore((s) => s.slots)
  const hoveredId = useStore((s) => s.hoveredId)
  const toggle = useStore((s) => s.toggle)
  const hover = useStore((s) => s.hover)

  return (
    <section aria-labelledby="list-title">
      <h2 id="list-title" className="mb-2 text-sm font-medium text-dim">
        Misiones ({visible.length})
      </h2>
      <ul className="type-narrow -mx-2 text-sm">
        {visible.map((m) => {
          const slot = slots.indexOf(m.id)
          return (
            <li key={m.id}>
              <button
                type="button"
                aria-pressed={slot >= 0}
                aria-label={`${m.name}, ${formatYear(m.landedAt)}, ${m.operator}, ${OUTCOME_LABEL[m.outcome].toLowerCase()}`}
                onClick={() => toggle(m.id)}
                onMouseEnter={() => hover(m.id)}
                onMouseLeave={() => hover(null)}
                onFocus={() => hover(m.id)}
                onBlur={() => hover(null)}
                className={`grid w-full grid-cols-[1.25rem_3rem_1fr_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-deck ${hoveredId === m.id ? 'bg-deck' : ''}`}
              >
                {slot >= 0 ? (
                  <SlotBadge slot={slot} small />
                ) : (
                  <span className="grid place-items-center text-ink">
                    <OutcomeIcon outcome={m.outcome} size={10} />
                  </span>
                )}
                <span className="text-dim">{formatYear(m.landedAt)}</span>
                <span className="truncate">{m.name}</span>
                <span className="truncate text-right text-faint">{m.operator}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
