import { Stars, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { CameraRig } from './CameraRig'
import { Markers } from './Markers'
import { Moon } from './Moon'
import { SunLight } from './SunLight'

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function Loading() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <p className="absolute inset-x-0 top-1/2 text-center text-dim" role="status">
      Cargando el mapa de la Luna… {Math.round(progress)} %
    </p>
  )
}

export function MoonGlobe() {
  const webgl = useMemo(hasWebGL, [])
  if (!webgl) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-dim">
        <p className="max-w-sm">
          Este navegador no puede mostrar el globo 3D. Igual podés comparar misiones con la lista y la línea de tiempo.
        </p>
      </div>
    )
  }
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 3.3], fov: 34, near: 0.05, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        aria-label="Globo 3D de la Luna con los sitios de alunizaje. Arrastrá para girarlo."
      >
        <color attach="background" args={['#070b1e']} />
        <ambientLight intensity={0.07} />
        <SunLight />
        <Stars radius={80} depth={20} count={1800} factor={2.2} saturation={0} fade={false} speed={0} />
        <Suspense fallback={null}>
          <Moon />
        </Suspense>
        <Markers />
        <CameraRig />
      </Canvas>
      <Loading />
    </div>
  )
}
