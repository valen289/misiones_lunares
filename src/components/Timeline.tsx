import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { missions } from '../data/missions'
import { formatDate } from '../lib/format'
import { SLOT_LETTERS, useStore, useVisibleMissions } from '../state/store'
import { SLOT_VARS } from './slots'

const START = Date.UTC(1965, 0, 1)
const END = Date.UTC(2027, 0, 1)
const PAD_X = 20
const LANE = 13
const AXIS_GAP = 30
const MIN_WIDTH = 600

/** Los dos alunizajes que enmarcan el gran hueco de la historia. */
const GAP_FROM = missions.find((m) => m.id === 'luna-24')!
const GAP_TO = missions.find((m) => m.id === 'change-3')!

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(MIN_WIDTH)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(MIN_WIDTH, e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export function Timeline() {
  const [wrap, width] = useWidth<HTMLDivElement>()
  const visible = useVisibleMissions()
  const slots = useStore((s) => s.slots)
  const hoveredId = useStore((s) => s.hoveredId)
  const toggle = useStore((s) => s.toggle)
  const hover = useStore((s) => s.hover)

  const x = (iso: string | number) => {
    const t = typeof iso === 'number' ? iso : Date.parse(iso)
    return PAD_X + ((t - START) / (END - START)) * (width - 2 * PAD_X)
  }

  // Apilar en carriles las misiones que caen muy cerca en el tiempo.
  const placed = useMemo(() => {
    const lastX: number[] = []
    return visible.map((m) => {
      const px = PAD_X + ((Date.parse(m.landedAt) - START) / (END - START)) * (width - 2 * PAD_X)
      let lane = lastX.findIndex((lx) => px - lx >= 11)
      if (lane < 0) lane = lastX.length
      lastX[lane] = px
      return { m, px, lane }
    })
  }, [visible, width])

  const lanes = Math.max(3, ...placed.map((p) => p.lane + 1))
  const axisY = 16 + lanes * LANE
  const height = axisY + AXIS_GAP
  const decades = [1970, 1980, 1990, 2000, 2010, 2020]
  const gapA = x(GAP_FROM.landedAt) + 10
  const gapB = x(GAP_TO.landedAt) - 10

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(id)
    }
  }

  return (
    <div ref={wrap} className="overflow-x-auto overscroll-x-contain">
      <svg width={width} height={height} role="group" aria-label="Línea de tiempo de los alunizajes, de 1966 a 2025" className="block">
        {/* Eje y décadas */}
        <line x1={PAD_X} x2={width - PAD_X} y1={axisY} y2={axisY} stroke="var(--color-rule)" />
        {decades.map((d) => {
          const dx = x(Date.UTC(d, 0, 1))
          return (
            <g key={d}>
              <line x1={dx} x2={dx} y1={axisY} y2={axisY + 5} stroke="var(--color-faint)" />
              <text x={dx} y={axisY + 20} textAnchor="middle" fontSize="12" fill="var(--color-dim)">
                {d}
              </text>
            </g>
          )
        })}

        {/* El hueco: 37 años sin alunizajes */}
        {gapB - gapA > 160 && (
          <g aria-hidden="true">
            <line x1={gapA} x2={gapB} y1={axisY - 12} y2={axisY - 12} stroke="var(--color-faint)" strokeDasharray="2 4" />
            <text x={(gapA + gapB) / 2} y={axisY - 20} textAnchor="middle" fontSize="13" fill="var(--color-dim)">
              37 años sin alunizajes, de 1976 a 2013
            </text>
          </g>
        )}

        {/* Misiones (las elegidas al final, para que queden encima) */}
        {[...placed].sort((a, b) => Number(slots.includes(a.m.id)) - Number(slots.includes(b.m.id))).map(({ m, px, lane }) => {
          const slot = slots.indexOf(m.id)
          const y = axisY - 10 - lane * LANE
          const color = slot >= 0 ? SLOT_VARS[slot] : m.outcome === 'fallida' ? 'var(--color-fail)' : 'var(--color-ink)'
          const r = slot >= 0 ? 5.5 : hoveredId === m.id ? 5 : 4
          return (
            <g
              key={m.id}
              role="button"
              tabIndex={0}
              aria-pressed={slot >= 0}
              aria-label={`${m.name}, ${formatDate(m.landedAt)}`}
              onClick={() => toggle(m.id)}
              onKeyDown={(e) => onKey(e, m.id)}
              onMouseEnter={() => hover(m.id)}
              onMouseLeave={() => hover(null)}
              onFocus={() => hover(m.id)}
              onBlur={() => hover(null)}
              className="cursor-pointer outline-none [&:focus-visible>circle.focus]:opacity-100"
            >
              <circle className="focus opacity-0" cx={px} cy={y} r={r + 3.5} fill="none" stroke="var(--color-slot-b)" strokeWidth="1.5" />
              <circle cx={px} cy={y} r={9} fill="transparent" />
              {slot >= 0 && (
                <>
                  <line x1={px} x2={px} y1={y} y2={axisY} stroke={color} strokeWidth="1.5" />
                  <circle cx={px} cy={y} r={7.5} fill={color} stroke="var(--color-space)" strokeWidth="1.5" />
                  <text x={px} y={y + 3.8} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--color-space)">
                    {SLOT_LETTERS[slot]}
                  </text>
                </>
              )}
              {slot < 0 && m.outcome === 'exito' && <circle cx={px} cy={y} r={r} fill={color} />}
              {slot < 0 && m.outcome === 'parcial' && (
                <>
                  <circle cx={px} cy={y} r={r - 0.8} fill="none" stroke={color} strokeWidth="1.8" />
                  <circle cx={px} cy={y} r={1.6} fill={color} />
                </>
              )}
              {slot < 0 && m.outcome === 'fallida' && (
                <rect
                  x={px - r * 0.7}
                  y={y - r * 0.7}
                  width={r * 1.4}
                  height={r * 1.4}
                  transform={`rotate(45 ${px} ${y})`}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.6"
                />
              )}
              <title>{`${m.name}, ${formatDate(m.landedAt)}`}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
