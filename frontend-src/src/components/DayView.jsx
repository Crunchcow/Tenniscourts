import { Plus } from 'lucide-react'
import { isToday } from 'date-fns'

const HOUR_START  = 9
const HOUR_END    = 21
const PX_PER_HOUR = 72

function minutesToPx(min) {
  return (min / 60) * PX_PER_HOUR
}

const SLOT_STYLES = {
  booking:     'bg-gradient-to-br from-blue-50 to-blue-100 border-l-[3px] border-blue-500 text-blue-900',
  training:    'bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-[3px] border-emerald-500 text-emerald-900',
  match:       'bg-gradient-to-br from-amber-50 to-amber-100 border-l-[3px] border-amber-500 text-amber-900',
  maintenance: 'bg-gradient-to-br from-red-50 to-red-100 border-l-[3px] border-brand text-red-900',
  event:       'bg-gradient-to-br from-purple-50 to-purple-100 border-l-[3px] border-purple-500 text-purple-900',
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
  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i)

  return (
    <div className="animate-fade-up pt-4">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `56px repeat(${data.courts.length}, minmax(0, 1fr))` }}
      >
        {/* Time gutter */}
        <div className="pt-[72px]">
          {hours.map(h => (
            <div
              key={h}
              className="flex items-start justify-end pr-2 text-[0.65rem] font-semibold text-slate-400 leading-none"
              style={{ height: PX_PER_HOUR + 'px' }}
            >
              {h < HOUR_END ? `${h}:00` : ''}
            </div>
          ))}
        </div>

        {/* Court columns */}
        {data.courts.map(court => (
          <div key={court.id} className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white border border-slate-200 hover:shadow-xl transition-shadow duration-300">

            {/* Header */}
            <div className="relative bg-gradient-to-br from-brand to-brand-dark text-white px-4 py-3 overflow-hidden" style={{ height: '72px' }}>
              <div className="absolute inset-0 opacity-10 text-[4rem] flex items-center justify-end pr-3 leading-none select-none pointer-events-none">🎾</div>
              <p className="font-black text-base leading-tight relative z-10">{court.name}</p>
              {court.description && (
                <p className="text-[0.68rem] text-white/65 mt-0.5 relative z-10 line-clamp-1">{court.description}</p>
              )}
              <button
                onClick={() => onBook(court.id, court.name)}
                className="hidden sm:flex absolute bottom-2 right-2 items-center gap-1 text-[0.65rem] font-bold bg-white/15 hover:bg-white/30 border border-white/30 text-white px-2 py-1 rounded-full transition-all z-10"
              >
                <Plus size={10} />
                Buchen
              </button>
            </div>

            {/* Timeline */}
            <div
              className="relative flex-1"
              style={{ height: (HOUR_END - HOUR_START) * PX_PER_HOUR + 'px' }}
              onClick={(e) => {
                if (e.target === e.currentTarget) onBook(court.id, court.name)
              }}
            >
              {/* Hour lines */}
              {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-b border-slate-100 pointer-events-none"
                  style={{ top: i * PX_PER_HOUR + 'px', height: PX_PER_HOUR + 'px' }}
                >
                  <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-50 pointer-events-none" />
                </div>
              ))}

              {/* Current time */}
              {showNow && (
                <div
                  className="absolute left-0 right-0 z-10 pointer-events-none"
                  style={{ top: minutesToPx(nowMin) + 'px' }}
                >
                  <div className="relative">
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-brand shadow-md shadow-brand/40" />
                    <div className="h-0.5 bg-gradient-to-r from-brand to-transparent" />
                  </div>
                </div>
              )}

              {/* Slots */}
              {court.slots?.map((slot, i) => {
                const topMin = slot.start_minutes - HOUR_START * 60
                const heightMin = slot.end_minutes - slot.start_minutes
                const tooShort = heightMin < 30

                return (
                  <div
                    key={i}
                    className={`absolute mx-1 rounded-lg px-2 py-1 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] hover:z-10 cursor-default ${slotStyle(slot)}`}
                    style={{
                      top: minutesToPx(topMin) + 2 + 'px',
                      height: Math.max(minutesToPx(heightMin) - 4, 18) + 'px',
                      left: 4, right: 4,
                    }}
                  >
                    <p className="font-bold text-[0.72rem] leading-tight truncate">
                      {slot.type === 'booking' ? slot.booker_name : slot.title}
                    </p>
                    {!tooShort && (
                      <p className="text-[0.62rem] opacity-60 font-medium mt-0.5">
                        {slot.start} – {slot.end}
                      </p>
                    )}
                  </div>
                )
              })}

              {/* Click overlay for mobile */}
              <button
                className="absolute inset-0 w-full opacity-0"
                onClick={() => onBook(court.id, court.name)}
                aria-label={`${court.name} buchen`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
