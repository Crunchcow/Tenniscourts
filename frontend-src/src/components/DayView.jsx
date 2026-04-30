import { Plus, CalendarPlus } from 'lucide-react'
import { isToday } from 'date-fns'

const HOUR_START  = 9
const HOUR_END    = 21
const PX_PER_HOUR = 52   // kompakter — weniger leere Fläche

function minutesToPx(min) {
  return (min / 60) * PX_PER_HOUR
}

const SLOT_STYLES = {
  booking:     'bg-blue-500 text-white shadow-lg shadow-blue-500/25',
  training:    'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
  match:       'bg-amber-500 text-white shadow-lg shadow-amber-500/25',
  maintenance: 'bg-brand text-white shadow-lg shadow-brand/25',
  event:       'bg-purple-500 text-white shadow-lg shadow-purple-500/25',
}

function slotStyle(slot) {
  if (slot.type === 'booking') return SLOT_STYLES.booking
  return SLOT_STYLES[slot.block_type] ?? SLOT_STYLES.training
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

      {/* Court cards — stacked layout instead of side-by-side columns */}
      <div className="flex flex-col gap-4">
        {data.courts.map(court => {
          const hasSlots = court.slots?.length > 0
          return (
            <div key={court.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">

              {/* Court header bar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-brand to-brand-dark">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎾</span>
                  <div>
                    <p className="font-black text-white text-sm leading-tight">{court.name}</p>
                    {court.description && (
                      <p className="text-white/60 text-[0.68rem] font-medium">{court.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onBook(court.id, court.name)}
                  className="flex items-center gap-1.5 bg-white text-brand px-3.5 py-1.5 rounded-full text-xs font-black hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Plus size={12} />
                  Jetzt buchen
                </button>
              </div>

              {/* Timeline + slots */}
              <div className="flex">

                {/* Time gutter */}
                <div className="flex-shrink-0 w-12 border-r border-slate-100">
                  {hours.map(h => (
                    <div
                      key={h}
                      className="flex items-center justify-end pr-2 text-[0.6rem] font-semibold text-slate-300"
                      style={{ height: PX_PER_HOUR + 'px' }}
                    >
                      {h}:00
                    </div>
                  ))}
                </div>

                {/* Timeline body */}
                <div
                  className="relative flex-1"
                  style={{ height: (HOUR_END - HOUR_START) * PX_PER_HOUR + 'px' }}
                >
                  {/* Alternating hour bands */}
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      className={`absolute left-0 right-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                      style={{ top: i * PX_PER_HOUR + 'px', height: PX_PER_HOUR + 'px' }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 border-b border-slate-100" />
                    </div>
                  ))}

                  {/* Empty state CTA */}
                  {!hasSlots && (
                    <button
                      onClick={() => onBook(court.id, court.name)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                        <CalendarPlus size={18} className="text-slate-300 group-hover:text-brand transition-colors" />
                      </div>
                      <span className="text-xs text-slate-300 group-hover:text-brand font-semibold transition-colors">
                        Heute noch frei – Jetzt buchen
                      </span>
                    </button>
                  )}

                  {/* Current time indicator */}
                  {showNow && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: minutesToPx(nowMin) + 'px' }}
                    >
                      <div className="relative flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand flex-shrink-0 shadow shadow-brand/50" />
                        <div className="flex-1 h-px bg-brand opacity-60" />
                      </div>
                    </div>
                  )}

                  {/* Booking / Block slots */}
                  {court.slots?.map((slot, i) => {
                    const topMin    = slot.start_minutes - HOUR_START * 60
                    const heightMin = slot.end_minutes - slot.start_minutes
                    const short     = heightMin <= 30

                    return (
                      <div
                        key={i}
                        className={`absolute rounded-lg px-3 py-1.5 transition-all hover:brightness-110 hover:z-10 cursor-default ${slotStyle(slot)}`}
                        style={{
                          top:    minutesToPx(topMin) + 2 + 'px',
                          height: Math.max(minutesToPx(heightMin) - 4, 20) + 'px',
                          left:   8,
                          right:  8,
                        }}
                      >
                        <p className="font-bold text-[0.75rem] leading-tight truncate">
                          {slot.type === 'booking' ? slot.booker_name : slot.title}
                        </p>
                        {!short && (
                          <p className="text-[0.65rem] opacity-75 font-medium mt-0.5">
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
