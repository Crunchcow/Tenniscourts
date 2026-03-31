import { SLOT_LABELS, SLOT_COLORS, slotColor, slotLabel, timeToMinutes, minutesToPx, PIXELS_PER_HOUR } from '../utils/slotHelpers'

const BLOCK_TYPE_BADGE = {
  booking:     { bg: '#3b82f6', label: 'Buchung' },
  training:    { bg: '#f59e0b', label: 'Training' },
  match:       { bg: '#ef4444', label: 'Spieltag' },
  maintenance: { bg: '#6b7280', label: 'Platzsperrung' },
  event:       { bg: '#8b5cf6', label: 'Veranstaltung' },
}

export default function SlotBlock({ slot }) {
  const startMin = slot.start_minutes ?? timeToMinutes(slot.start)
  const endMin   = slot.end_minutes   ?? timeToMinutes(slot.end)
  const durationMin = endMin - startMin

  const top    = minutesToPx(startMin)
  const height = Math.max((durationMin / 60) * PIXELS_PER_HOUR - 2, 20)
  const color  = slotColor(slot)

  const badge = slot.type === 'booking'
    ? BLOCK_TYPE_BADGE.booking
    : BLOCK_TYPE_BADGE[slot.block_type] ?? { bg: '#9ca3af', label: slot.block_type }

  const label = slotLabel(slot)
  const isShort = durationMin <= 30

  return (
    <div
      className="absolute left-1 right-1 rounded-md overflow-hidden text-white text-xs font-medium select-none z-10 shadow-sm"
      style={{ top: `${top}px`, height: `${height}px`, backgroundColor: color }}
      title={`${slot.start}–${slot.end} · ${label}`}
    >
      <div className="px-2 py-1 flex flex-col gap-0.5 h-full">
        {isShort ? (
          <span className="truncate leading-tight">{slot.start} {label}</span>
        ) : (
          <>
            <span className="font-semibold truncate leading-tight">{slot.start}–{slot.end}</span>
            <span className="truncate leading-none opacity-90">{label}</span>
            {durationMin >= 60 && (
              <span
                className="text-[10px] px-1 py-0.5 rounded self-start font-normal mt-auto"
                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
              >
                {badge.label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
