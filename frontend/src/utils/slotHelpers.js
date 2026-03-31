export const START_HOUR = 9    // 09:00
export const END_HOUR = 21     // 21:00
export const PIXELS_PER_HOUR = 80
export const TOTAL_HOURS = END_HOUR - START_HOUR  // 12

export const SLOT_COLORS = {
  booking:     '#3b82f6',
  training:    '#f59e0b',
  match:       '#ef4444',
  maintenance: '#6b7280',
  event:       '#8b5cf6',
}

export const SLOT_LABELS = {
  booking:     'Buchung',
  training:    'Training',
  match:       'Spieltag',
  maintenance: 'Platzsperrung',
  event:       'Veranstaltung',
}

/** Wandelt "HH:MM" in Minuten ab 00:00 um */
export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/** Wandelt Minuten ab 00:00 in Pixel-Position relativ zum Start der Zeitachse um */
export function minutesToPx(minutes) {
  return ((minutes - START_HOUR * 60) / 60) * PIXELS_PER_HOUR
}

/** Gibt die aktuelle Zeit-Position in Pixeln zurück (oder null wenn außerhalb der Zeitachse) */
export function getCurrentTimePx() {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes < START_HOUR * 60 || minutes > END_HOUR * 60) return null
  return minutesToPx(minutes)
}

/** Generiert Zeitmarkierungen für die linke Achse */
export function getTimeLabels() {
  const labels = []
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    labels.push({
      label: `${String(h).padStart(2, '0')}:00`,
      px: minutesToPx(h * 60),
    })
  }
  return labels
}

/** Gibt Farbe für einen Slot zurück */
export function slotColor(slot) {
  if (slot.type === 'booking') return SLOT_COLORS.booking
  return SLOT_COLORS[slot.block_type] ?? '#9ca3af'
}

/** Gibt Label für einen Slot zurück */
export function slotLabel(slot) {
  if (slot.type === 'booking') return slot.booker_name
  return slot.title
}
