import { useState } from 'react'
import { Plus, CalendarPlus, Lock, Clock } from 'lucide-react'
import { isToday } from 'date-fns'

const HOUR_START  = 9
const HOUR_END    = 21
const PX_PER_HOUR = 56
const TOTAL_MIN   = (HOUR_END - HOUR_START) * 60
const TIME_W      = 52   // width of shared time gutter in px

function minutesToPx(min) { return (min / 60) * PX_PER_HOUR }
function pad(n)            { return String(n).padStart(2, '0') }
function minToTime(min)    {
  const h = Math.floor(min / 60) + HOUR_START
  const m = min % 60
  return `${pad(h)}:${pad(m)}`
}

const SLOT_META = {
  booking:     { bg: '#2563eb', icon: '👤', label: 'Buchung'       },
  training:    { bg: '#15803d', icon: '🏃', label: 'Training'      },
  match:       { bg: '#b45309', icon: '🏆', label: 'Spieltag'      },
  maintenance: { bg: '#c0000c', icon: '🔧', label: 'Platzsperrung' },
  event:       { bg: '#7c3aed', icon: '🎉', label: 'Veranstaltung' },
}

function getSlotMeta(slot) {
  if (slot.type === 'booking') return SLOT_META.booking
  return SLOT_META[slot.block_type] ?? SLOT_META.training
}

function getFreeWindows(slots) {
  const sorted = [...(slots ?? [])].sort((a, b) => a.start_minutes - b.start_minutes)
  const windows = []
  let cursor = 0
  for (const s of sorted) {
    const ss = s.start_minutes - HOUR_START * 60
    const se = s.end_minutes   - HOUR_START * 60
    if (ss > cursor) windows.push({ startMin: cursor, endMin: ss })
    if (se > cursor) cursor = se
  }
  if (cursor < TOTAL_MIN) windows.push({ startMin: cursor, endMin: TOTAL_MIN })
  return windows.filter(w => w.endMin - w.startMin >= 30)
}

export default function DayView({ date, data, onBook }) {
  const [tooltip, setTooltip] = useState(null)

  if (!data?.courts?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <span className="text-4xl">🎾</span>
        <p className="text-sm font-medium">Keine Plätze konfiguriert.</p>
      </div>
    )
  }

  const now       = new Date()
  const nowMin    = now.getHours() * 60 + now.getMinutes() - HOUR_START * 60
  const showNow   = isToday(date) && nowMin >= 0 && nowMin <= TOTAL_MIN
  const todayFlag = isToday(date)
  const hours     = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
  const courts    = data.courts
  const timelineH = TOTAL_MIN / 60 * PX_PER_HOUR

  return (
    <div className="animate-fade-up pt-4 pb-8">

      {/* Subtle SVG background */}
      <div className="fixed inset-0 -z-10 opacity-[0.035] bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: 'url(/court-bg.svg)' }} />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(SLOT_META).map(([key, { bg, icon, label }]) => (
          <span key={key} className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-sm">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: bg }} />
            {icon} {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          ✅ Frei – klickbar
        </span>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-green-900/20 bg-white">

        {/* ── Court header row ── */}
        <div className="flex border-b border-green-900/15"
          style={{ background: 'linear-gradient(180deg, #1a5c2e 0%, #166534 100%)' }}>

          {/* Time gutter placeholder */}
          <div className="flex-shrink-0" style={{ width: TIME_W + 'px' }} />

          {/* One header per court */}
          {courts.map((court, ci) => (
            <div key={court.id}
              className={`flex-1 relative px-3 py-3 overflow-hidden ${ci > 0 ? 'border-l border-white/10' : ''}`}>
              {/* decorative lines */}
              <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="xMidYMid slice">
                <rect x="5%" y="10%" width="90%" height="80%" fill="none" stroke="white" strokeWidth="1.5"/>
                <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="white" strokeWidth="1"/>
                <line x1="50%" y1="30%" x2="50%" y2="70%" stroke="white" strokeWidth="1"/>
              </svg>
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🎾</span>
                  <div className="min-w-0">
                    <p className="font-black text-white text-sm leading-tight truncate">{court.name}</p>
                    {court.description && (
                      <p className="text-white/55 text-[0.62rem] truncate">{court.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onBook(court.id, court.name)}
                  className="flex items-center justify-center gap-1 bg-white/90 hover:bg-white text-green-800 font-black text-[0.65rem] px-3 py-1.5 rounded-full transition-all shadow-sm hover:shadow-md w-full"
                >
                  <Plus size={11} strokeWidth={3} />
                  Buchen
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Timeline body ── */}
        <div className="flex" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>

          {/* Shared time gutter */}
          <div className="flex-shrink-0 border-r border-green-100/80" style={{ width: TIME_W + 'px' }}>
            {hours.map(h => (
              <div key={h} className="flex items-start justify-end pr-2 pt-0.5"
                style={{ height: PX_PER_HOUR + 'px' }}>
                <span className="text-[0.55rem] font-bold text-green-800/35 tabular-nums">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Court columns — side by side */}
          {courts.map((court, ci) => {
            const freeWindows = getFreeWindows(court.slots)
            const hasSlots    = (court.slots?.length ?? 0) > 0

            return (
              <div key={court.id}
                className={`flex-1 relative ${ci > 0 ? 'border-l border-green-100/60' : ''}`}
                style={{ height: timelineH + 'px' }}
              >
                {/* Hour bands */}
                {hours.map((h, i) => (
                  <div key={h} className="absolute left-0 right-0 pointer-events-none" style={{
                    top: i * PX_PER_HOUR + 'px', height: PX_PER_HOUR + 'px',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(22,101,52,0.018)',
                    borderBottom: '1px solid rgba(22,101,52,0.06)',
                  }} />
                ))}

                {/* FREE WINDOWS */}
                {freeWindows.map((w, i) => {
                  const h         = w.endMin - w.startMin
                  const tall      = h >= 60
                  const isPast    = todayFlag && w.endMin <= nowMin
                  const isCurrent = todayFlag && w.startMin < nowMin && w.endMin > nowMin
                  const bookStart = isCurrent
                    ? minToTime(Math.ceil(nowMin / 30) * 30)
                    : minToTime(w.startMin)

                  if (isPast) return (
                    <div key={i} className="absolute left-0 right-0 flex items-center justify-center" style={{
                      top: minutesToPx(w.startMin) + 'px', height: minutesToPx(h) + 'px',
                      background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 4px, transparent 4px, transparent 10px)',
                    }}>
                      {tall && <span className="text-[0.5rem] text-slate-300 font-semibold rotate-0">vergangen</span>}
                    </div>
                  )

                  return (
                    <button key={i}
                      onClick={() => onBook(court.id, court.name, bookStart, minToTime(Math.min(w.startMin + 90, w.endMin)))}
                      className="absolute left-0 right-0 group flex flex-col items-center justify-center gap-0.5 transition-all hover:z-10"
                      style={{
                        top: minutesToPx(w.startMin) + 'px', height: minutesToPx(h) + 'px',
                        background: 'rgba(22,163,74,0.055)',
                        borderTop:    '1.5px dashed rgba(22,163,74,0.25)',
                        borderBottom: '1.5px dashed rgba(22,163,74,0.25)',
                      }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-all px-1 w-full flex justify-center">
                        <div className="flex items-center gap-1 bg-green-500 text-white text-[0.62rem] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-green-500/30 whitespace-nowrap">
                          <CalendarPlus size={10} />
                          {bookStart} buchen
                        </div>
                      </div>
                      {tall && (
                        <span className="text-[0.55rem] text-green-600/35 font-semibold group-hover:opacity-0 transition-opacity">
                          frei
                        </span>
                      )}
                    </button>
                  )
                })}

                {/* EMPTY state */}
                {!hasSlots && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[0.6rem] text-green-500/40 font-bold rotate-0">ganztags frei</span>
                  </div>
                )}

                {/* Now indicator — only on first court to avoid duplication */}
                {showNow && ci === 0 && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: minutesToPx(nowMin) + 'px' }}>
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand shadow-md flex-shrink-0 -ml-1" />
                      <div className="flex-1 h-px bg-brand opacity-50" />
                    </div>
                  </div>
                )}
                {/* Now line without dot on other courts */}
                {showNow && ci > 0 && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: minutesToPx(nowMin) + 'px' }}>
                    <div className="h-px w-full bg-brand opacity-35" />
                  </div>
                )}

                {/* SLOTS */}
                {court.slots?.map((slot, i) => {
                  const topMin    = slot.start_minutes - HOUR_START * 60
                  const heightMin = slot.end_minutes   - slot.start_minutes
                  const short     = heightMin <= 30
                  const meta      = getSlotMeta(slot)
                  const tipKey    = `${court.id}-${i}`
                  const showTip   = tooltip === tipKey

                  return (
                    <div key={i}
                      className="absolute rounded-lg overflow-hidden transition-all hover:z-30 cursor-not-allowed"
                      style={{
                        top:    minutesToPx(topMin) + 2 + 'px',
                        height: Math.max(minutesToPx(heightMin) - 4, 20) + 'px',
                        left: 4, right: 4,
                        backgroundColor: meta.bg,
                        boxShadow: `0 2px 8px ${meta.bg}44`,
                      }}
                      onMouseEnter={() => setTooltip(tipKey)}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => setTooltip(showTip ? null : tipKey)}
                    >
                      <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 8px)',
                      }} />
                      <div className="relative px-2 py-1 flex items-start gap-1 h-full">
                        <Lock size={8} className="text-white/60 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-[0.65rem] leading-tight truncate">
                            {slot.type === 'booking' ? slot.booker_name : slot.title}
                          </p>
                          {!short && (
                            <p className="text-white/60 text-[0.56rem] font-medium mt-0.5 truncate">
                              {slot.start}–{slot.end}
                            </p>
                          )}
                        </div>
                      </div>

                      {showTip && (
                        <div className="absolute left-0 right-0 -top-1 -translate-y-full z-40 px-1">
                          <div className="bg-slate-900 text-white text-[0.68rem] rounded-xl px-3 py-2 shadow-xl">
                            <div className="font-bold flex items-center gap-1 mb-0.5">
                              {meta.icon} {meta.label} – {slot.type === 'booking' ? slot.booker_name : slot.title}
                            </div>
                            <div className="text-white/55 flex items-center gap-1">
                              <Clock size={9} />
                              {slot.start} – {slot.end} · nicht buchbar
                            </div>
                          </div>
                          <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 mx-auto -mt-1 rounded-sm" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
