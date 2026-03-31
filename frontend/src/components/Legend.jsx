import { SLOT_COLORS, SLOT_LABELS } from '../utils/slotHelpers'

const LEGEND_ITEMS = [
  { key: 'booking',     color: SLOT_COLORS.booking,     label: 'Buchung (Spieler)' },
  { key: 'training',    color: SLOT_COLORS.training,    label: 'Training' },
  { key: 'match',       color: SLOT_COLORS.match,       label: 'Spieltag' },
  { key: 'maintenance', color: SLOT_COLORS.maintenance, label: 'Platzsperrung' },
  { key: 'event',       color: SLOT_COLORS.event,       label: 'Veranstaltung' },
]

export default function Legend() {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Legende:</span>
          {LEGEND_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-white border border-gray-300 flex-shrink-0" />
            <span className="text-xs text-gray-600">Frei (klicken zum Buchen)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
