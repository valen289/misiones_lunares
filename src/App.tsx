import { lazy, Suspense } from 'react'
import { ComparePanel } from './components/ComparePanel'
import { Filters } from './components/Filters'
import { GlobeOverlay } from './components/GlobeOverlay'
import { MissionList } from './components/MissionList'
import { Timeline } from './components/Timeline'
import { missions } from './data/missions'
import { formatYear } from './lib/format'

// El 3D va en un bloque aparte para que el resto de la página aparezca enseguida.
const MoonGlobe = lazy(() => import('./components/globe/MoonGlobe').then((m) => ({ default: m.MoonGlobe })))

const first = formatYear(missions[0].landedAt)
const last = formatYear(missions.at(-1)!.landedAt)
const failed = missions.filter((m) => m.outcome === 'fallida').length
const landed = missions.length - failed

export default function App() {
  return (
    <div className="app-grid">
      <header className="app-header flex flex-wrap items-end justify-between gap-x-8 gap-y-3 px-4 pt-4 sm:px-6">
        <div>
          <h1 className="type-wide text-2xl leading-tight font-bold sm:text-[1.75rem]">Explorador de misiones lunares</h1>
          <p className="text-dim">
            {landed} alunizajes y {failed} intentos fallidos, de {first} a {last}, sobre imágenes del Lunar
            Reconnaissance Orbiter.
          </p>
        </div>
        <Filters />
      </header>

      <main className="app-globe relative min-h-0">
        <div className="globe-stage">
          <Suspense fallback={<p className="p-6 text-dim">Preparando el globo…</p>}>
            <MoonGlobe />
          </Suspense>
        </div>
        <GlobeOverlay />
      </main>

      <section className="app-timeline border-t border-rule px-2 pt-2 sm:px-4" aria-label="Línea de tiempo">
        <Timeline />
      </section>

      <aside className="app-panel flex min-h-0 flex-col gap-8 overflow-y-auto border-rule px-4 py-5 sm:px-6">
        <ComparePanel />
        <MissionList />
        <footer className="mt-auto border-t border-rule pt-4 text-xs leading-relaxed text-faint">
          <p>
            Mapa de la Luna: NASA/GSFC/Arizona State University, Lunar Reconnaissance Orbiter (CGI Moon Kit del NASA
            Scientific Visualization Studio). Coordenadas: NSSDCA, LROC y fuentes de cada misión. Posición del Sol y la
            Tierra calculada con astronomy-engine.
          </p>
          <p className="mt-2">Proyecto educativo independiente; no es un producto oficial de la NASA.</p>
        </footer>
      </aside>
    </div>
  )
}
