import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { PerspectiveCamera, Quaternion, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { missionById } from '../../data/missions'
import { latLonToVector } from '../../lib/geo'
import { useStore } from '../../state/store'

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Gira la cámara hasta dejar enfrente el sitio de la misión enfocada. */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const focusId = useStore((s) => s.focusId)
  const anyoneSelected = useStore((s) => s.slots.some(Boolean))
  const anim = useRef<{ from: Vector3; q: Quaternion; t: number } | null>(null)
  const touched = useRef(false)

  useEffect(() => {
    const m = focusId ? missionById.get(focusId) : null
    if (!m) return
    // Limitar la latitud de la vista para que el globo no se vea "desde abajo".
    const lat = Math.max(-55, Math.min(55, m.lat))
    const to = new Vector3(...latLonToVector(lat, m.lon)).normalize()
    const from = camera.position.clone().normalize()
    anim.current = { from, q: new Quaternion().setFromUnitVectors(from, to), t: reducedMotion ? 1 : 0 }
  }, [focusId, camera])

  // Encuadrar el globo completo: más lejos en pantallas angostas (celular vertical).
  useEffect(() => {
    const fov = ((camera as PerspectiveCamera).fov * Math.PI) / 180
    camera.position.setLength(1.32 / (Math.tan(fov / 2) * Math.min(1, aspect)))
  }, [aspect, camera])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const stop = () => {
      anim.current = null
      touched.current = true
    }
    c.addEventListener('start', stop)
    return () => c.removeEventListener('start', stop)
  }, [])

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    c.autoRotate = !reducedMotion && !touched.current && !anyoneSelected
    const a = anim.current
    if (a) {
      a.t = Math.min(1, a.t + dt / 1.1)
      const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - (-2 * a.t + 2) ** 3 / 2
      const q = new Quaternion().slerp(a.q, e)
      const dist = camera.position.length()
      camera.position.copy(a.from).applyQuaternion(q).multiplyScalar(dist)
      if (a.t >= 1) anim.current = null
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      zoomSpeed={0.6}
      minDistance={1.35}
      maxDistance={9}
      autoRotateSpeed={0.35}
    />
  )
}
