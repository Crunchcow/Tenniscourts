/** Formatiert ein Date-Objekt als YYYY-MM-DD */
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Formatiert ein Date-Objekt als DD.MM.YYYY (Deutsch) */
export function toDisplayDate(date) {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Kurzform des Wochentags */
export function toShortDate(date) {
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

/** Prüft ob ein Datum heute ist */
export function isToday(date) {
  const today = new Date()
  return toISODate(date) === toISODate(today)
}

/**
 * Erstellt eine ISO-8601 Datetime-Zeichenkette mit Ortszeit-Offset (Europe/Berlin).
 * Beispiel: "2026-03-31T09:00:00+02:00"
 */
export function toLocalISOString(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const absOffset = Math.abs(offset)
  const oh = pad(Math.floor(absOffset / 60))
  const om = pad(absOffset % 60)
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00${sign}${oh}:${om}`
  )
}

/** Gibt Montag der Woche zurück, die `date` enthält */
export function getMondayOf(date) {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Gibt alle 7 Tage einer Woche zurück (Mo-So) */
export function getWeekDays(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })
}
