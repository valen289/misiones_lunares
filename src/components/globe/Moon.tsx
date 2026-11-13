import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { NoColorSpace, SRGBColorSpace } from 'three'
import { textureSize, textureUrls } from './textures'

const SIZE = textureSize()

/**
 * Esfera con el mosaico de color de LROC y relieve derivado de LOLA (NASA SVS, CGI Moon Kit).
 * El mapa está centrado en la longitud 0; se rota -90° para que esa longitud mire a +Z.
 */
export function Moon() {
  const [color, normal] = useTexture(textureUrls(SIZE))
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy())

  useLayoutEffect(() => {
    color.colorSpace = SRGBColorSpace
    normal.colorSpace = NoColorSpace
    color.anisotropy = maxAniso
    normal.anisotropy = maxAniso
    color.needsUpdate = true
    normal.needsUpdate = true
  }, [color, normal, maxAniso])

  return (
    <mesh
      rotation={[0, -Math.PI / 2, 0]}
      // La esfera tapa los marcadores de la cara de atrás: corta la propagación de eventos.
      onPointerOver={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <sphereGeometry args={[1, 160, 80]} />
      <meshStandardMaterial map={color} normalMap={normal} roughness={1} metalness={0} />
    </mesh>
  )
}
