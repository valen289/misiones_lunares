import { useStore, type KindFilter } from '../state/store'

const KINDS: { value: KindFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'tripuladas', label: 'Tripuladas' },
  { value: 'roboticas', label: 'Robóticas' },
]

export function Filters() {
  const kind = useStore((s) => s.kind)
  const setKind = useStore((s) => s.setKind)
  const includeFailed = useStore((s) => s.includeFailed)
  const setIncludeFailed = useStore((s) => s.setIncludeFailed)

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      <fieldset className="flex rounded-full border border-rule p-0.5">
        <legend className="sr-only">Tipo de misión</legend>
        {KINDS.map((k) => (
          <label
            key={k.value}
            className="cursor-pointer rounded-full px-3 py-1 text-dim has-checked:bg-ink has-checked:text-space has-focus-visible:outline-2 has-focus-visible:outline-slot-b"
          >
            <input
              type="radio"
              name="kind"
              value={k.value}
              checked={kind === k.value}
              onChange={() => setKind(k.value)}
              className="sr-only"
            />
            {k.label}
          </label>
        ))}
      </fieldset>
      <label className="flex cursor-pointer items-center gap-2 text-dim">
        <input
          type="checkbox"
          checked={includeFailed}
          onChange={(e) => setIncludeFailed(e.target.checked)}
          className="size-4 accent-slot-b"
        />
        Mostrar intentos fallidos
      </label>
    </div>
  )
}
