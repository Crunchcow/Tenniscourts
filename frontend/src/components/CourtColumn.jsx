import { useCallback } from 'react'
import SlotBlock from './SlotBlock'
import TennisCourtSVG from './TennisCourtSVG'
import {
  START_HOUR, END_HOUR, PIXELS_PER_HOUR, TOTAL_HOURS,
  minutesToPx, timeToMinutes,
} from '../utils/slotHelpers'

/** Klickbar freie Zeitbereiche werden als 30-min-Streifen gerendert */
function FreeSlots({ slots, onBookClick }) {
  const occupied = slots.map((s) => ({
    start: s.start_minutes ?? timeToMinutes(s.start),
    end:   s.end_minutes   ?? timeToMinutes(s.end),
  }))

  const FREE_STEP = 30
  const freeBlocks = []
  let t = START_HOUR * 60

  while (t < END_HOUR * 60) {
    const end = t + FREE_STEP
    const isFree = !occupied.some((o) => o.start < end && o.end > t)
    if (isFree) {
      freeBlocks.push({ start: t, end })
    }
    t = end
  }

  return (
    <>
      {freeBlocks.map((b) => (
        <div
          key={b.start}
          className="absolute left-0 right-0 free-slot-hover"
          style={{
            top:    `${minutesToPx(b.start)}px`,
            height: `${(FREE_STEP / 60) * PIXELS_PER_HOUR}px`,
            touchAction: 'manipulation',
          }}
          onClick={() => onBookClick(b.start)}
          onTouchEnd={(e) => { e.preventDefault(); onBookClick(b.start) }}
          title={`${String(Math.floor(b.start / 60)).padStart(2,'0')}:${String(b.start % 60).padStart(2,'0')} – frei, klicken zum Buchen`}
        />
      ))}
    </>
  )
}

export default function CourtColumn({ court, onBookClick, currentTimePx, isToday }) {
  const handleFreeClick = useCallback(
    (startMinutes) => onBookClick(court.id, court.name, startMinutes),
    [court, onBookClick],
  )

  return (
    <div className="court-card flex flex-col min-w-0">
      {/* Court-Header */}
      <div className="relative bg-rot-700 overflow-hidden">
        <TennisCourtSVG className="w-full h-20 opacity-30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-bold text-base leading-tight">{court.name}</span>
          {court.description && (
            <span className="text-rot-200 text-xs">{court.description}</span>
          )}
        </div>
      </div>

      {/* Zeit-Grid */}
      <div
        className="relative flex-1"
        style={{ height: `${TOTAL_HOURS * PIXELS_PER_HOUR}px` }}
      >
        {/* Stunden-Trennlinien */}
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: `${i * PIXELS_PER_HOUR}px` }}
          />
        ))}

        {/* Freie & klickbare Slots */}
        <FreeSlots slots={court.slots || []} onBookClick={handleFreeClick} />

        {/* Belegte Slots */}
        {(court.slots || []).map((slot, idx) => (
          <SlotBlock key={`${slot.type}-${slot.id}-${idx}`} slot={slot} />
        ))}

        {/* Aktuelle-Zeit-Linie */}
        {isToday && currentTimePx !== null && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimePx}px` }}
          >
            <div className="h-0.5 bg-rot-700" />
            <div
              className="absolute -top-1.5 -left-1 w-3 h-3 rounded-full bg-rot-700"
              style={{ left: '-4px' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
