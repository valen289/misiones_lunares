import { missionById } from '../data/missions'
import { formatDate, formatTime } from '../lib/format'
import { useStore } from '../state/store'
import { OutcomeIcon } from './OutcomeIcon'

/** Leyenda de formas e interruptor de iluminación, sobre el globo. */
export function GlobeOverlay() {
  const light = useStore((s) => s.light)
  const setLight = useStore((s) => s.setLight)
  const focusId = useStore((s) => s.focusId)
  const m = focusId ? missionById.get(focusId) : undefined

  let caption = 'Elegí una misión para ver la luz que tenía al alunizar.'
  if (m && light === 'alunizaje') {
    caption =
      m.timePrecision === 'dia'
        ? `Luz aproximada del ${formatDate(m.landedAt)} en ${m.name} (no se conoce la hora exacta).`
        : `Luz del Sol el ${formatDate(m.landedAt)} a las ${formatTime(m.landedAt)}, cuando alunizó ${m.name}.`
  } else if (light === 'pleno') {
    caption = 'Toda la cara que mirás está iluminada.'
  }

  return (
    <div className="globe-overlay pointer-events-none flex flex-wrap items-end justify-between gap-3 px-4 pb-3 text-sm sm:px-6 lg:px-4 lg:pb-4">
      <div className="overlay-text pointer-events-auto max-w-xs">
        <fieldset className="flex gap-1">
          <legend className="mb-1.5 text-dim">Iluminación</legend>
          {(
            [
              ['alunizaje', 'Como al alunizar'],
              ['pleno', 'Pareja'],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="cursor-pointer rounded-full border border-rule px-2.5 py-1 has-checked:border-ink has-checked:bg-ink has-checked:text-space has-focus-visible:outline-2 has-focus-visible:outline-slot-b"
            >
              <input
                type="radio"
                name="light"
                value={value}
                checked={light === value}
                onChange={() => setLight(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </fieldset>
        <p className="mt-2 text-dim" aria-live="polite">
          {caption}
        </p>
      </div>
      <ul className="overlay-text pointer-events-auto flex gap-3 text-dim" aria-label="Leyenda">
        <li className="flex items-center gap-1.5 text-ink">
          <OutcomeIcon outcome="exito" size={10} />
          <span className="text-dim">Éxito</span>
        </li>
        <li className="flex items-center gap-1.5 text-ink">
          <OutcomeIcon outcome="parcial" size={10} />
          <span className="text-dim">Parcial</span>
        </li>
        <li className="flex items-center gap-1.5">
          <OutcomeIcon outcome="fallida" size={10} />
          Fallida
        </li>
      </ul>
    </div>
  )
}
