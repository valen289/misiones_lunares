import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { DirectionalLight, Vector3 } from 'three'
import { missionById } from '../../data/missions'
import { subsolarPoint } from '../../lib/astro'
import { latLonToVector } from '../../lib/geo'
import { useStore } from '../../state/store'

const tmp = new Vector3()
const side = new Vector3()

/**
 * Luz del Sol. En modo "alunizaje" se ubica sobre el punto subsolar del instante en que
 * alunizó la misión enfocada: la línea entre el día y la noche queda como la vieron.
 * En modo "pleno" acompaña a la cámara para ver todo iluminado.
 */
export function SunLight() {
  const ref = useRef<DirectionalLight>(null)
  const focusId = useStore((s) => s.focusId)
  const light = useStore((s) => s.light)

  const sunDir = useMemo(() => {
    const m = focusId ? missionById.get(focusId) : null
    if (!m || light !== 'alunizaje') return null
    const p = subsolarPoint(new Date(m.landedAt))
    return new Vector3(...latLonToVector(p.lat, p.lon)).normalize()
  }, [focusId, light])

  useFrame(({ camera }, dt) => {
    const l = ref.current
    if (!l) return
    if (sunDir) {
      tmp.copy(sunDir)
    } else {
      // Luz de frente, apenas desplazada a la izquierda y arriba para conservar relieve.
      tmp.copy(camera.position).normalize()
      side.set(0, 1, 0).cross(tmp).normalize()
      tmp.addScaledVector(side, -0.35).addScaledVector(camera.up, 0.25).normalize()
    }
    const current = l.position.clone().normalize()
    current.lerp(tmp, Math.min(1, dt * 4)).normalize()
    l.position.copy(current).multiplyScalar(10)
  })

  return <directionalLight ref={ref} position={[0, 0, 10]} intensity={3.2} />
}
