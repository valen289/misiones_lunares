const LOCALE = 'es-UY'

const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
const yearFmt = new Intl.DateTimeFormat(LOCALE, { year: 'numeric', timeZone: 'UTC' })

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return `${timeFmt.format(new Date(iso))} UTC`
}

export function formatYear(iso: string): string {
  return yearFmt.format(new Date(iso))
}

export function formatNumber(n: number, digits = 0): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n)
}

export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'O'
  return `${formatNumber(Math.abs(lat), 2)}° ${ns}, ${formatNumber(Math.abs(lon), 2)}° ${ew}`
}

/** Diferencia entre dos fechas expresada en años, meses y días (calendario UTC). */
export function formatInterval(isoA: string, isoB: string): string {
  let a = new Date(isoA)
  let b = new Date(isoB)
  if (a > b) [a, b] = [b, a]
  let years = b.getUTCFullYear() - a.getUTCFullYear()
  let months = b.getUTCMonth() - a.getUTCMonth()
  let days = b.getUTCDate() - a.getUTCDate()
  if (days < 0) {
    months -= 1
    days += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  const parts: string[] = []
  if (years) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`)
  if (months) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`)
  if (!years && days) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`)
  if (!parts.length) return 'el mismo día'
  return parts.length === 2 ? `${parts[0]} y ${parts[1]}` : parts[0]
}
