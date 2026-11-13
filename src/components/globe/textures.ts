/** Elige 2k (celulares) o 4k (pantallas grandes) según el tamaño real de la pantalla. */
export function textureSize(): 2 | 4 {
  if (typeof window === 'undefined') return 2
  const px = Math.max(window.screen.width, window.screen.height) * (window.devicePixelRatio || 1)
  return px >= 2400 ? 4 : 2
}

export function textureUrls(size: 2 | 4): [string, string] {
  const base = import.meta.env.BASE_URL
  return [`${base}textures/moon-color-${size}k.jpg`, `${base}textures/moon-normal-${size}k.jpg`]
}
