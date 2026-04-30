import { useState } from 'react'
import { Plus, CalendarPlus, Lock, Clock, ChevronRight } from 'lucide-react'
import { isToday } from 'date-fns'

const HOUR_START  = 9
const HOUR_END    = 21
const PX_PER_HOUR = 56
const TOTAL_MIN   = (HOUR_END - HOUR_START) * 60

function minutesToPx(min) { return (min / 60) * PX_PER_HOUR }
function pxToMinutes(px)  { return Math.round((px / PX_PER_HOUR) * 60) }
function pad(n)            { return String(n).padStart(2, '0') }
function minToTime(min)    {
  const h = Math.floor(min / 60) + HOUR_START
  const m = min % 60
  return `${pad(h)}:${pad(m)}`
}

const SLOT_META = {
  booking:     { bg: '#2563eb', icon: '👤', label: 'Buchung',      blocked: true  },
  training:    { bg: '#15803d', icon: '🏃', label: 'Training',     blocked: true  },
  match:       { bg: '#b45309', icon: '🏆', label: 'Spieltag',     blocked: true  },
  maintenance: { bg: '#c0000c', icon: '🔧', label: 'Platzsperrung',blocked: true  },
  event:       { bg: '#7c3aed', icon: '🎉', label: 'Veranstaltung',blocked: true  },
}

function getSlotMeta(slot) {
  if (slot.type === 'booking') return SLOT_META.booking
  return SLOT_META[slot.block_type] ?? SLOT_META.training
}

// Returns sorted list of free windows [{startMin, endMin}]
function getFreeWindows(slots) {
  const sorted = [...(slots ?? [])].sort((a, b) => a.start_minutes - b.start_minutes)
  const windows = []
  let cursor = 0
  for (const s of sorted) {
    const slotStart = s.start_minutes - HOUR_START * 60
    const slotEnd   = s.end_minutes   - HOUR_START * 60
    if (slotStart > cursor) windows.push({ startMin: cursor, endMin: slotStart })
    if (slotEnd > cursor) cursor = slotEnd
  }
  if (cursor < TOTAL_MIN) windows.push({ startMin: cursor, endMin: TOTAL_MIN })
  return windows.filter(w => w.endMin - w.startMin >= 30)
}

export default function DayView({ date, data, onBook }) {
  const [tooltip, setTooltip] = useState(null) // { slotIndex, courtId }

  if (!data?.courts?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <span className="text-4xl">🎾</span>
        <p className="text-sm font-medium">Keine Plätze konfiguriert.</p>
      </div>
    )
  }

  const now    = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes() - HOUR_START * 60
  const showNow = isToday(date) && nowMin >= 0 && nowMin <= TOTAL_MIN
  const hours  = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  return (
    <div className="animate-fade-up pt-4 pb-8">

      {/* Subtle court SVG background */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.035] bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: 'url(/court-bg.svg)' }}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(SLOT_META).map(([key, { bg, icon, label }]) => (
          <span key={key} className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-sm">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: bg }} />
            {icon} {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          ✅ Frei – klickbar
        </span>
      </div>

      {/* Court cards */}
      <div className="flex flex-col gap-5">
        {data.courts.map((court) => {
          const freeWindows = getFreeWindows(court.slots)
          const hasSlots    = (court.slots?.length ?? 0) > 0

          return (
            <div
              key={court.id}
              className="rounded-2xl overflow-hidden shadow-lg border border-green-900/20"
              style={{ background: 'linear-gradient(180deg, #1a5c2e 0%, #166534 100%)' }}
            >
              {/* Header */}
              <div className="relative px-5 py-4 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="xMidYMid slice">
                  <rect x="5%" y="10%" width="90%" height="80%" fill="none" stroke="white" strokeWidth="1.5"/>
                  <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="white" strokeWidth="1.5"/>
                  <line x1="15%" y1="10%" x2="15%" y2="90%" stroke="white" strokeWidth="1"/>
                  <line x1="85%" y1="10%" x2="85%" y2="90%" stroke="white" strokeWidth="1"/>
                  <line x1="15%" y1="30%" x2="85%" y2="30%" stroke="white" strokeWidth="1"/>
                  <line x1="15%" y1="70%" x2="85%" y2="70%" stroke="white" strokeWidth="1"/>
                  <line x1="50%" y1="30%" x2="50%" y2="70%" stroke="white" strokeWidth="1"/>
                </svg>
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg border border-white/20">🎾</div>
                    <div>
                      <p className="font-black text-white text-base leading-tight">{court.name}</p>
                      {court.description && <p className="text-white/60 text-xs mt-0.5">{court.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Free windows quick-pick */}
                    {freeWindows.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {freeWindows.slice(0, 3).map((w, i) => (
                          <button
                            key={i}
                            onClick={() => onBook(court.id, court.name, minToTime(w.startMin), minToTime(w.endMin > TOTAL_MIN ? TOTAL_MIN : Math.min(w.startMin + 90, w.endMin)))}
                            className="text-[0.65rem] font-bold bg-white/15 hover:bg-white/30 border border-white/25 text-white px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Clock size={10} />
                            {minToTime(w.startMin)}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => onBook(court.id, court.name)}
                      className="flex items-center gap-1.5 bg-white text-green-800 font-black text-xs px-4 py-2 rounded-full hover:bg-green-50 transition-all shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Plus size={13} strokeWidth={3} />
                      Buchen
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(240,253,244,0.97) 100%)' }}>

                {/* Time gutter */}
                <div className="flex-shrink-0 w-14 border-r border-green-100">
                  {hours.map(h => (
                    <div key={h} className="flex items-center justify-end pr-2.5" style={{ height: PX_PER_HOUR + 'px' }}>
                      <span className="text-[0.58rem] font-bold text-green-800/40 tabular-nums">{h}:00</span>
                    </div>
                  ))}
                </div>

                {/* Timeline body */}
                <div className="relative flex-1" style={{ height: TOTAL_MIN / 60 * PX_PER_HOUR + 'px' }}>

                  {/* Hour bands */}
                  {hours.map((h, i) => (
                    <div key={h} className="absolute left-0 right-0 pointer-events-none" style={{
                      top: i * PX_PER_HOUR + 'px', height: PX_PER_HOUR + 'px',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(22,101,52,0.02)',
                      borderBottom: '1px solid rgba(22,101,52,0.07)',
                    }} />
                  ))}

                  {/* ── FREE WINDOWS — clickable green bands ── */}
                  {freeWindows.map((w, i) => {
                    const h = w.endMin - w.startMin
                    const tall = h >= 60
                    return (
                      <button
                        key={i}
                        onClick={() => onBook(court.id, court.name, minToTime(w.startMin), minToTime(Math.min(w.startMin + 90, w.endMin)))}
                        className="absolute left-0 right-0 group flex flex-col items-center justify-center gap-1 transition-all hover:z-10"
                        style={{
                          top:    minutesToPx(w.startMin) + 'px',
                          height: minutesToPx(h) + 'px',
                          background: 'rgba(22,163,74,0.06)',
                          borderTop:    '1.5px dashed rgba(22,163,74,0.3)',
                          borderBottom: '1.5px dashed rgba(22,163,74,0.3)',
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5 bg-green-500 text-white text-[0.7rem] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30">
                            <CalendarPlus size={12} />
                            {minToTime(w.startMin)} – {minToTime(w.endMin)} · Buchen
                          </div>
                        </div>
                        {tall && (
                          <span className="text-[0.62rem] text-green-600/40 font-semibold group-hover:opacity-0 transition-opacity">
                            Frei · {minToTime(w.startMin)} – {minToTime(w.endMin)}
                          </span>
                        )}
                      </button>
                    )
                  })}

                  {/* ── FULL EMPTY CTA ── */}
                  {!hasSlots && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-11 h-11 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
                        <CalendarPlus size={20} className="text-green-400" />
                      </div>
                      <p className="text-xs text-green-600/50 font-semibold">Heute ganztags frei – klicke einen Bereich</p>
                    </div>
                  )}

                  {/* Now indicator */}
                  {showNow && (
                    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: minutesToPx(nowMin) + 'px' }}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-brand shadow-md flex-shrink-0 -ml-1.5" />
                        <div className="flex-1 h-0.5 bg-brand opacity-60" />
                      </div>
                    </div>
                  )}

                  {/* ── BOOKED / BLOCKED SLOTS ── */}
                  {court.slots?.map((slot, i) => {
                    const topMin    = slot.start_minutes - HOUR_START * 60
                    const heightMin = slot.end_minutes   - slot.start_minutes
                    const short     = heightMin <= 30
                    const meta      = getSlotMeta(slot)
                    const tipKey    = `${court.id}-${i}`
                    const showTip   = tooltip === tipKey

                    return (
                      <div
                        key={i}
                        className="absolute rounded-xl overflow-hidden transition-all hover:z-30 cursor-not-allowed group"
                        style={{
                          top:    minutesToPx(topMin) + 2 + 'px',
                          height: Math.max(minutesToPx(heightMin) - 4, 24) + 'px',
                          left: 10, right: 10,
                          backgroundColor: meta.bg,
                          boxShadow: `0 4px 14px ${meta.bg}44`,
                        }}
                        onMouseEnter={() => setTooltip(tipKey)}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => setTooltip(showTip ? null : tipKey)}
                      >
                        {/* Stripe pattern overlay — "blocked" feel */}
                        <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 10px)',
                        }} />

                        <div className="relative px-3 py-1.5 flex items-start gap-1.5 h-full">
                          <Lock size={10} className="text-white/70 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white text-[0.73rem] leading-tight truncate">
                              {slot.type === 'booking' ? slot.booker_name : slot.title}
                            </p>
                            {!short && (
                              <p className="text-white/65 text-[0.62rem] font-medium mt-0.5">
                                {slot.start} – {slot.end} · {meta.label}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tooltip on hover/tap */}
                        {showTip && (
                          <div className="absolute left-0 right-0 -top-1 -translate-y-full z-40 px-1">
                            <div className="bg-slate-900 text-white text-[0.72rem] rounded-xl px-3 py-2.5 shadow-xl leading-relaxed">
                              <div className="font-bold flex items-center gap-1.5 mb-1">
                                <span>{meta.icon}</span>
                                <span>{meta.label} – {slot.type === 'booking' ? slot.booker_name : slot.title}</span>
                              </div>
                              <div className="text-white/60 flex items-center gap-1">
                                <Clock size={10} />
                                {slot.start} – {slot.end} Uhr · Buchung in diesem Zeitraum nicht möglich
                              </div>
                            </div>
                            {/* Arrow */}
                            <div className="w-3 h-3 bg-slate-900 rotate-45 mx-auto -mt-1.5 rounded-sm" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
