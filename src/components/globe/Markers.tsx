import { Billboard, Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide, Group, PerspectiveCamera, Vector3 } from 'three'
import type { Mission } from '../../data/missions'
import { formatYear } from '../../lib/format'
import { latLonToVector } from '../../lib/geo'
import { SLOT_LETTERS, useStore, useVisibleMissions } from '../../state/store'

const SLOT_COLORS = ['#f59a4a', '#67bdf0', '#c4a3ff']
const INK = '#e8ebf4'
const FAIL = '#e0705f'
const HALO = '#070b1e'
const ALTITUDE = 1.006
/** Radio del marcador en píxeles de pantalla. */
const MARKER_PX = 5

const toCamera = new Vector3()
const normal = new Vector3()

export function Markers() {
  const visible = useVisibleMissions()
  return (
    <group>
      {visible.map((m) => (
        <Marker key={m.id} mission={m} />
      ))}
    </group>
  )
}

function Marker({ mission: m }: { mission: Mission }) {
  const group = useRef<Group>(null)
  const label = useRef<HTMLDivElement>(null)
  const slot = useStore((s) => s.slots.indexOf(m.id))
  const hovered = useStore((s) => s.hoveredId === m.id)
  const toggle = useStore((s) => s.toggle)
  const hover = useStore((s) => s.hover)
  const position = latLonToVector(m.lat, m.lon, ALTITUDE)
  const selected = slot >= 0
  const color = selected ? SLOT_COLORS[slot] : m.outcome === 'fallida' ? FAIL : INK
  const emphasis = selected ? 1.5 : hovered ? 1.3 : 1

  useFrame(({ camera, size }) => {
    const g = group.current
    if (!g) return
    // Tamaño constante en pantalla (en píxeles), sin importar el zoom ni la pantalla.
    const fov = (camera as PerspectiveCamera).fov * (Math.PI / 180)
    const worldPerPx = (2 * Math.tan(fov / 2) * camera.position.length()) / size.height
    g.scale.setScalar(MARKER_PX * emphasis * worldPerPx)
    // Ocultar lo que queda detrás del globo o pegado al borde (y que deje de recibir clics).
    normal.set(...position).normalize()
    toCamera.copy(camera.position).sub(normal).normalize()
    const facing = normal.dot(toCamera)
    g.visible = facing > 0.12
    if (label.current) label.current.style.opacity = facing > 0.2 ? '1' : '0'
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 6) return // fue un arrastre, no un clic
    toggle(m.id)
  }

  return (
    <group position={position}>
      <Billboard>
        <group ref={group}>
          {/* Halo oscuro para separar el marcador del terreno claro */}
          <mesh renderOrder={10}>
            <circleGeometry args={[1.45, 32]} />
            <meshBasicMaterial color={HALO} transparent opacity={0.55} depthWrite={false} depthTest={false} />
          </mesh>
          {m.outcome === 'exito' && (
            <mesh renderOrder={11}>
              <circleGeometry args={[1, 32]} />
              <meshBasicMaterial color={color} toneMapped={false} depthTest={false} transparent />
            </mesh>
          )}
          {m.outcome === 'parcial' && (
            <>
              <mesh renderOrder={11}>
                <ringGeometry args={[0.6, 1, 32]} />
                <meshBasicMaterial color={color} side={DoubleSide} toneMapped={false} depthTest={false} transparent />
              </mesh>
              <mesh renderOrder={11}>
                <circleGeometry args={[0.32, 24]} />
                <meshBasicMaterial color={color} toneMapped={false} depthTest={false} transparent />
              </mesh>
            </>
          )}
          {m.outcome === 'fallida' && (
            <mesh rotation={[0, 0, Math.PI / 4]} renderOrder={11}>
              <ringGeometry args={[0.62, 0.95, 4]} />
              <meshBasicMaterial color={color} side={DoubleSide} toneMapped={false} depthTest={false} transparent />
            </mesh>
          )}
          {/* Área táctil más grande que el dibujo */}
          <mesh
            onClick={onClick}
            onPointerOver={(e) => {
              e.stopPropagation()
              hover(m.id)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              hover(null)
              document.body.style.cursor = ''
            }}
          >
            <circleGeometry args={[2.6, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </Billboard>
      {(selected || hovered) && (
        <Html center={false} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={label} className="marker-label" data-slot={selected ? SLOT_LETTERS[slot] : undefined}>
            {selected && <span className="marker-letter">{SLOT_LETTERS[slot]}</span>}
            <span>
              {m.name} <span className="marker-year">{formatYear(m.landedAt)}</span>
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}
