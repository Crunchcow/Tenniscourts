import { useState, useEffect } from 'react'
import CourtColumn from './CourtColumn'
import {
  PIXELS_PER_HOUR, TOTAL_HOURS,
  getTimeLabels, getCurrentTimePx,
} from '../utils/slotHelpers'
import { isToday as checkToday } from '../utils/dateHelpers'

export default function TimeGrid({ schedule, selectedDate, onBookClick }) {
  const [currentTimePx, setCurrentTimePx] = useState(getCurrentTimePx)
  const [activeCourt, setActiveCourt] = useState(0)
  const todayFlag = checkToday(selectedDate)

  // Aktuelle-Zeit-Linie jede Minute aktualisieren
  useEffect(() => {
    if (!todayFlag) return
    const interval = setInterval(() => setCurrentTimePx(getCurrentTimePx()), 60_000)
    return () => clearInterval(interval)
  }, [todayFlag])

  const timeLabels = getTimeLabels()
  const courts = schedule?.courts || []

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-40 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p>Lade Belegungsplan …</p>
        </div>
      </div>
    )
  }

  // Zeitachse (gemeinsam für beide Layouts)
  const TimeAxis = () => (
    <div className="flex-shrink-0 w-12 mr-2 flex flex-col">
      <div className="h-20 flex-shrink-0" />
      <div className="relative" style={{ height: `${TOTAL_HOURS * PIXELS_PER_HOUR}px` }}>
        {timeLabels.map(({ label, px }) => (
          <div
            key={label}
            className="absolute right-0 text-[11px] text-gray-400 font-medium pr-1"
            style={{ top: `${px - 8}px`, lineHeight: '16px' }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="time-grid-container animate-in">

      {/* ── MOBILE: Platz-Tabs + eine Spalte ─────────────────────────────── */}
      <div className="sm:hidden">
        {/* Platz-Tabs */}
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden mb-3 shadow-sm">
          {courts.map((court, i) => (
            <button
              key={court.id}
              onClick={() => setActiveCourt(i)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                activeCourt === i
                  ? 'bg-rot-700 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {court.name}
            </button>
          ))}
        </div>
        {/* Eine Spalte */}
        <div className="flex">
          <TimeAxis />
          <div className="flex-1">
            {courts[activeCourt] && (
              <CourtColumn
                key={courts[activeCourt].id}
                court={courts[activeCourt]}
                onBookClick={onBookClick}
                currentTimePx={currentTimePx}
                isToday={todayFlag}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: alle Spalten nebeneinander ───────────────────────────── */}
      <div className="hidden sm:flex">
        <TimeAxis />
        <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: `repeat(${courts.length || 3}, 1fr)` }}>
          {courts.map((court) => (
            <CourtColumn
              key={court.id}
              court={court}
              onBookClick={onBookClick}
              currentTimePx={currentTimePx}
              isToday={todayFlag}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
