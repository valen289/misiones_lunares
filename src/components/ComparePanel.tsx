import type { ReactNode } from 'react'
import { missionById, type Mission } from '../data/missions'
import { factsFor, kindLabel, OUTCOME_LABEL } from '../lib/facts'
import { formatCoords, formatDate, formatInterval, formatNumber, formatTime } from '../lib/format'
import { surfaceDistanceKm } from '../lib/geo'
import { SLOT_LETTERS, useStore } from '../state/store'
import { OutcomeIcon } from './OutcomeIcon'
import { SLOT_VARS } from './slots'

type Picked = { m: Mission; slot: number }

const SUGGESTIONS: { label: string; ids: string[] }[] = [
  { label: 'Cara visible y cara oculta', ids: ['apolo-11', 'change-4'] },
  { label: 'Vecinos: Apolo 12 y Surveyor 3', ids: ['apolo-12', 'surveyor-3'] },
  { label: 'La carrera al polo sur', ids: ['chandrayaan-3', 'im-1', 'im-2'] },
  { label: 'Primeros en llegar', ids: ['luna-9', 'surveyor-1', 'apolo-11'] },
]

export function ComparePanel() {
  const slots = useStore((s) => s.slots)
  const picked: Picked[] = slots.flatMap((id, slot) => {
    const m = id ? missionById.get(id) : undefined
    return m ? [{ m, slot }] : []
  })

  if (!picked.length) return <EmptyState />

  return (
    <section aria-labelledby="compare-title" className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="compare-title" className="type-wide text-lg font-semibold">
          Comparación
        </h2>
        <ClearButton />
      </div>
      <CompareTable picked={picked} />
      {picked.length > 1 && <Pairs picked={picked} />}
      <Summaries picked={picked} />
    </section>
  )
}

function ClearButton() {
  const clear = useStore((s) => s.clear)
  return (
    <button type="button" onClick={clear} className="text-sm text-dim underline-offset-4 hover:text-ink hover:underline">
      Vaciar comparación
    </button>
  )
}

function EmptyState() {
  const toggle = useStore((s) => s.toggle)
  const clear = useStore((s) => s.clear)
  const load = (ids: string[]) => {
    clear()
    ids.forEach((id) => toggle(id))
  }
  return (
    <section aria-labelledby="compare-title" className="flex flex-col gap-4">
      <h2 id="compare-title" className="type-wide text-lg font-semibold">
        Compará alunizajes
      </h2>
      <p className="max-w-prose text-dim">
        Elegí hasta tres misiones en el globo, en la línea de tiempo o en la lista. Vas a ver dónde y cuándo bajó cada
        una, qué luz tenía y cuánta distancia y cuántos años las separan.
      </p>
      <div>
        <h3 className="mb-2 text-sm font-medium text-dim">Para empezar</h3>
        <ul className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => load(s.ids)}
                className="rounded-full border border-rule px-3 py-1.5 text-sm hover:border-slot-b hover:text-slot-b"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CompareTable({ picked }: { picked: Picked[] }) {
  const remove = useStore((s) => s.remove)
  const focus = useStore((s) => s.focus)
  const focusId = useStore((s) => s.focusId)

  const rows: { label: string; cell: (m: Mission) => ReactNode }[] = [
    {
      label: 'Fecha',
      cell: (m) => (
        <>
          {formatDate(m.landedAt)}
          <br />
          <span className="text-dim">{m.timePrecision === 'dia' ? 'hora incierta' : formatTime(m.landedAt)}</span>
        </>
      ),
    },
    {
      label: 'Quién',
      cell: (m) => (
        <>
          {m.operator}
          <br />
          <span className="text-dim">{m.country}</span>
        </>
      ),
    },
    { label: 'Tipo', cell: (m) => kindLabel(m) },
    {
      label: 'Resultado',
      cell: (m) => (
        <span className="inline-flex items-center gap-1.5">
          <OutcomeIcon outcome={m.outcome} size={11} />
          {OUTCOME_LABEL[m.outcome]}
        </span>
      ),
    },
    { label: 'Lugar', cell: (m) => m.site },
    {
      label: 'Coordenadas',
      cell: (m) => (
        <>
          {formatCoords(m.lat, m.lon).split(', ').map((part) => (
            <span key={part} className="block whitespace-nowrap">
              {part}
            </span>
          ))}
          {m.coordPrecision === 'nominal' && <span className="block text-dim">aproximadas</span>}
        </>
      ),
    },
    {
      label: 'Zona',
      cell: (m) => {
        const f = factsFor(m)
        return `${f.zone[0].toUpperCase()}${f.zone.slice(1)}, cara ${f.nearSide ? 'visible' : 'oculta'}`
      },
    },
    {
      label: 'Sol sobre el horizonte',
      cell: (m) => {
        const f = factsFor(m)
        return f.sun === null ? <span className="text-dim">sin hora exacta</span> : `${formatNumber(f.sun, 1)}°`
      },
    },
    {
      label: 'La Tierra en el cielo',
      cell: (m) => {
        const f = factsFor(m)
        if (f.earth === null) return <span className="text-dim">sin hora exacta</span>
        return f.earth < 0 ? 'No se ve' : `A ${formatNumber(f.earth, 0)}° de altura`
      },
    },
    {
      label: 'La Luna vista desde la Tierra',
      cell: (m) => {
        const p = factsFor(m).phase
        return `${p.name}, ${formatNumber(p.illuminated * 100, 0)} % iluminada`
      },
    },
  ]

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="type-narrow w-full border-collapse text-left text-sm leading-snug">
        <caption className="sr-only">Comparación de las misiones elegidas</caption>
        <thead>
          <tr>
            <td className="w-[7.5rem]" />
            {picked.map(({ m, slot }) => (
              <th key={m.id} scope="col" className="min-w-[6.5rem] pb-3 pl-3 align-bottom font-normal">
                <div className="flex flex-col items-start gap-1.5">
                  <span className="flex items-center gap-2">
                    <SlotBadge slot={slot} />
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      aria-label={`Quitar ${m.name} de la comparación`}
                      className="-m-2 p-2 text-dim hover:text-ink"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </span>
                  <button
                    type="button"
                    onClick={() => focus(m.id)}
                    aria-pressed={focusId === m.id}
                    className="text-left text-base font-semibold hover:underline aria-pressed:underline aria-pressed:decoration-2 aria-pressed:underline-offset-4"
                    style={{ textDecorationColor: SLOT_VARS[slot] }}
                    title="Girar el globo hacia este sitio y ver su luz"
                  >
                    {noBreak(m.name)}
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-rule">
              <th scope="row" className="py-2 pr-2 align-top font-normal text-dim">
                {r.label}
              </th>
              {picked.map(({ m }) => (
                <td key={m.id} className="py-2 pl-3 align-top">
                  {r.cell(m)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pairs({ picked }: { picked: Picked[] }) {
  const pairs: [Picked, Picked][] = []
  for (let i = 0; i < picked.length; i++) for (let j = i + 1; j < picked.length; j++) pairs.push([picked[i], picked[j]])
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-dim">Qué las separa</h3>
      <table className="type-narrow w-full text-left text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">Par</th>
            <th scope="col">Distancia sobre la superficie</th>
            <th scope="col">Tiempo entre alunizajes</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map(([a, b]) => {
            const km = surfaceDistanceKm(a.m.lat, a.m.lon, b.m.lat, b.m.lon)
            return (
              <tr key={`${a.m.id}-${b.m.id}`} className="border-t border-rule">
                <td className="py-2 pr-3 whitespace-nowrap">
                  <SlotBadge slot={a.slot} small /> <span className="text-dim">y</span> <SlotBadge slot={b.slot} small />
                </td>
                <td className="py-2 pr-3">
                  {km < 1 ? `${formatNumber(km * 1000, 0)} m` : `${formatNumber(km, 0)} km`}
                  <span className="text-dim"> de distancia</span>
                </td>
                <td className="py-2">{formatInterval(a.m.landedAt, b.m.landedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Summaries({ picked }: { picked: Picked[] }) {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {picked.map(({ m, slot }) => (
        <li key={m.id} className="flex gap-3">
          <SlotBadge slot={slot} small />
          <div className="max-w-prose">
            <p>{m.summary}</p>
            <p className="mt-1 text-dim">
              Fuente:{' '}
              {m.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ', '}
                  <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Evita que "Chandrayaan-3" se corte en el guion. */
function noBreak(name: string): string {
  return name.replace(/-/g, '\u2011')
}

export function SlotBadge({ slot, small = false }: { slot: number; small?: boolean }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-space ${small ? 'size-5 text-xs' : 'size-6 text-sm'}`}
      style={{ background: SLOT_VARS[slot] }}
      aria-label={`Misión ${SLOT_LETTERS[slot]}`}
    >
      {SLOT_LETTERS[slot]}
    </span>
  )
}
