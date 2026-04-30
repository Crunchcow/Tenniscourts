import { Plus, CalendarPlus } from 'lucide-react'
import { isToday } from 'date-fns'

const HOUR_START  = 9
const HOUR_END    = 21
const PX_PER_HOUR = 56

function minutesToPx(min) {
  return (min / 60) * PX_PER_HOUR
}

const SLOT_META = {
  booking:     { bg: '#2563eb', label: '👤 Buchung' },
  training:    { bg: '#16a34a', label: '🏃 Training' },
  match:       { bg: '#d97706', label: '🏆 Spieltag' },
  maintenance: { bg: '#c0000c', label: '🔧 Sperrung' },
  event:       { bg: '#7c3aed', label: '🎉 Veranstaltung' },
}

function getSlotMeta(slot) {
  if (slot.type === 'booking') return SLOT_META.booking
  return SLOT_META[slot.block_type] ?? SLOT_META.training
}

export default function DayView({ date, data, onBook }) {
  if (!data?.courts?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <span className="text-4xl">🎾</span>
        <p className="text-sm font-medium">Keine Plätze konfiguriert.</p>
      </div>
    )
  }

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes() - HOUR_START * 60
  const showNow = isToday(date) && nowMin >= 0 && nowMin <= (HOUR_END - HOUR_START) * 60
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  return (
    <div className="animate-fade-up pt-4 pb-8">

      {/* ── Page hero background ── */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.035] bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: 'url(/court-bg.svg)' }}
      />

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(SLOT_META).map(([key, { bg, label }]) => (
          <span key={key} className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: bg }} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Court cards ── */}
      <div className="flex flex-col gap-5">
        {data.courts.map((court, ci) => {
          const hasSlots = court.slots?.length > 0
          // Rotate court colors slightly for visual differentiation
          const courtHues = ['#1a5c2e', '#14532d', '#166534']
          const courtBg = courtHues[ci % courtHues.length]

          return (
            <div
              key={court.id}
              className="rounded-2xl overflow-hidden shadow-lg border border-green-900/20"
              style={{
                background: 'linear-gradient(180deg, #1a5c2e 0%, #166534 100%)',
              }}
            >
              {/* ── Court header ── */}
              <div className="relative px-5 py-4 overflow-hidden">
                {/* Tennis court lines pattern as overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="xMidYMid slice">
                  {/* Court boundary */}
                  <rect x="5%" y="10%" width="90%" height="80%" fill="none" stroke="white" strokeWidth="1.5"/>
                  {/* Net */}
                  <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="white" strokeWidth="1.5"/>
                  {/* Singles lines */}
                  <line x1="15%" y1="10%" x2="15%" y2="90%" stroke="white" strokeWidth="1"/>
                  <line x1="85%" y1="10%" x2="85%" y2="90%" stroke="white" strokeWidth="1"/>
                  {/* Service boxes */}
                  <line x1="15%" y1="30%" x2="85%" y2="30%" stroke="white" strokeWidth="1"/>
                  <line x1="15%" y1="70%" x2="85%" y2="70%" stroke="white" strokeWidth="1"/>
                  <line x1="50%" y1="30%" x2="50%" y2="70%" stroke="white" strokeWidth="1"/>
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-lg border border-white/20">
                      🎾
                    </div>
                    <div>
                      <p className="font-black text-white text-base leading-tight tracking-wide">{court.name}</p>
                      {court.description && (
                        <p className="text-white/60 text-xs font-medium mt-0.5">{court.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onBook(court.id, court.name)}
                    className="flex items-center gap-1.5 bg-white text-green-800 font-black text-xs px-4 py-2 rounded-full hover:bg-green-50 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
                  >
                    <Plus size={13} strokeWidth={3} />
                    Jetzt buchen
                  </button>
                </div>
              </div>

              {/* ── Timeline ── */}
              <div
                className="flex"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(240,253,244,0.97) 100%)',
                }}
              >
                {/* Time gutter */}
                <div className="flex-shrink-0 w-14 border-r border-green-100">
                  {hours.map(h => (
                    <div
                      key={h}
                      className="flex items-center justify-end pr-2.5"
                      style={{ height: PX_PER_HOUR + 'px' }}
                    >
                      <span className="text-[0.58rem] font-bold text-green-700/50 tabular-nums">{h}:00</span>
                    </div>
                  ))}
                </div>

                {/* Timeline body */}
                <div
                  className="relative flex-1"
                  style={{ height: (HOUR_END - HOUR_START) * PX_PER_HOUR + 'px' }}
                >
                  {/* Court-line background pattern */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
                    preserveAspectRatio="none"
                  >
                    <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="#166534" strokeWidth="3"/>
                    <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="#166534" strokeWidth="2"/>
                    <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="#166534" strokeWidth="3"/>
                    <line x1="10%" y1="25%" x2="90%" y2="25%" stroke="#166534" strokeWidth="1.5"/>
                    <line x1="10%" y1="75%" x2="90%" y2="75%" stroke="#166534" strokeWidth="1.5"/>
                  </svg>

                  {/* Hour bands */}
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{
                        top: i * PX_PER_HOUR + 'px',
                        height: PX_PER_HOUR + 'px',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(22,101,52,0.025)',
                        borderBottom: '1px solid rgba(22,101,52,0.08)',
                      }}
                    />
                  ))}

                  {/* Empty state CTA */}
                  {!hasSlots && (
                    <button
                      onClick={() => onBook(court.id, court.name)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-green-50 group-hover:bg-green-100 border border-green-200 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm">
                        <CalendarPlus size={22} className="text-green-400 group-hover:text-green-600 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-green-700/50 group-hover:text-green-700 transition-colors">
                          Heute noch frei
                        </p>
                        <p className="text-xs text-green-500/50 group-hover:text-green-500 transition-colors font-medium">
                          Klicken zum Buchen
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Now indicator */}
                  {showNow && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: minutesToPx(nowMin) + 'px' }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-brand shadow-md shadow-brand/40 flex-shrink-0 -ml-1.5" />
                        <div className="flex-1 h-0.5 bg-brand opacity-70" />
                      </div>
                    </div>
                  )}

                  {/* Slots */}
                  {court.slots?.map((slot, i) => {
                    const topMin    = slot.start_minutes - HOUR_START * 60
                    const heightMin = slot.end_minutes - slot.start_minutes
                    const short     = heightMin <= 30
                    const meta      = getSlotMeta(slot)

                    return (
                      <div
                        key={i}
                        className="absolute rounded-xl px-3 py-2 cursor-default hover:brightness-110 hover:z-10 transition-all hover:scale-[1.01]"
                        style={{
                          top:             minutesToPx(topMin) + 3 + 'px',
                          height:          Math.max(minutesToPx(heightMin) - 6, 22) + 'px',
                          left:            10,
                          right:           10,
                          backgroundColor: meta.bg,
                          boxShadow:       `0 4px 12px ${meta.bg}55`,
                        }}
                      >
                        <p className="font-bold text-white text-[0.75rem] leading-tight truncate">
                          {slot.type === 'booking' ? slot.booker_name : slot.title}
                        </p>
                        {!short && (
                          <p className="text-white/70 text-[0.62rem] font-medium mt-0.5">
                            {slot.start} – {slot.end}
                          </p>
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
