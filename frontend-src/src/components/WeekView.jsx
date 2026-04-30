import { format, parseISO, isToday } from 'date-fns'
import { de } from 'date-fns/locale'

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const HOUR_START = 9
const HOUR_END   = 21
const TOTAL_MIN  = (HOUR_END - HOUR_START) * 60

// Compute occupancy 0–1 from slots
function occupancy(slots) {
  if (!slots?.length) return 0
  let booked = 0
  for (const s of slots) {
    booked += (s.end_minutes ?? 0) - (s.start_minutes ?? 0)
  }
  return Math.min(booked / TOTAL_MIN, 1)
}

// Mini bar chart: shows slots as colored stripes on a timeline bar
function MiniBar({ slots }) {
  const totalW = 100
  return (
    <div className="relative w-full h-3 rounded-full bg-slate-100 overflow-hidden">
      {slots?.map((s, i) => {
        const start = s.start_minutes - HOUR_START * 60
        const dur   = s.end_minutes - s.start_minutes
        const left  = (start / TOTAL_MIN) * totalW
        const width = (dur   / TOTAL_MIN) * totalW
        const color = s.type === 'booking' ? '#2563eb'
          : s.block_type === 'training'    ? '#15803d'
          : s.block_type === 'match'       ? '#b45309'
          : s.block_type === 'event'       ? '#7c3aed'
          : '#c0000c'
        return (
          <div
            key={i}
            className="absolute top-0 h-full rounded-sm"
            style={{ left: `${left}%`, width: `${Math.max(width, 2)}%`, backgroundColor: color }}
          />
        )
      })}
    </div>
  )
}

export default function WeekView({ data, onDayClick }) {
  if (!data?.days?.length) {
    return <p className="text-center py-16 text-slate-400 text-sm">Keine Daten.</p>
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const courts   = data.days[0]?.courts ?? []

  return (
    <div className="animate-fade-up pt-4">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="grid border-b border-slate-200"
          style={{ gridTemplateColumns: `140px repeat(${data.days.length}, minmax(0,1fr))` }}>
          <div className="px-4 py-3 bg-slate-50 border-r border-slate-200 flex items-end pb-2">
            <span className="text-[0.6rem] text-slate-400 font-semibold uppercase tracking-wider">Platz</span>
          </div>
          {data.days.map(day => {
            const d     = parseISO(day.date)
            const today = day.date === todayStr
            return (
              <button key={day.date} onClick={() => onDayClick(day.date)}
                className={`px-2 py-3 text-center border-r border-slate-200 last:border-r-0 transition-colors
                  ${today ? 'bg-green-50' : 'bg-slate-50 hover:bg-slate-100'}`}>
                <p className={`text-[0.6rem] font-bold uppercase tracking-wider ${today ? 'text-[#166534]' : 'text-slate-400'}`}>
                  {WD[d.getDay()]}
                </p>
                <p className={`text-base font-black leading-tight ${today ? 'text-[#166534]' : 'text-slate-800'}`}>
                  {d.getDate()}
                </p>
                <p className="text-[0.55rem] text-slate-400 mt-0.5">{format(d, 'MMM', { locale: de })}</p>
                {today && <div className="w-1 h-1 rounded-full bg-brand mx-auto mt-1" />}
              </button>
            )
          })}
        </div>

        {/* Court rows */}
        {courts.map((court, ci) => (
          <div key={court.id} className="grid border-b border-slate-100 last:border-b-0"
            style={{ gridTemplateColumns: `140px repeat(${data.days.length}, minmax(0,1fr))` }}>

            {/* Court label */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/70 border-r border-slate-200">
              <span className="text-base leading-none">🎾</span>
              <span className="text-xs font-bold text-slate-700 leading-tight">{court.name}</span>
            </div>

            {/* Day cells */}
            {data.days.map(day => {
              const c     = day.courts[ci] ?? {}
              const today = day.date === todayStr
              const occ   = occupancy(c.slots)
              const pct   = Math.round(occ * 100)

              return (
                <button key={day.date} onClick={() => onDayClick(day.date)}
                  className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 border-r border-slate-100 last:border-r-0 transition-all group
                    ${today ? 'bg-green-50/60 hover:bg-green-100/50' : 'hover:bg-slate-50'}`}>

                  {c.has_activity ? (
                    <>
                      <div className="w-full px-1">
                        <MiniBar slots={c.slots} />
                      </div>
                      <span className={`text-[0.6rem] font-bold ${pct > 60 ? 'text-brand' : 'text-slate-500'}`}>
                        {pct}% belegt
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden">
                        <div className="h-full w-0" />
                      </div>
                      <span className="text-[0.6rem] font-bold text-emerald-600">Frei</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">
        Tag anklicken für die Detailansicht · Farben: 🔵 Buchung &nbsp;🟢 Training &nbsp;🟡 Spieltag &nbsp;🔴 Sperrung
      </p>
    </div>
  )
}
