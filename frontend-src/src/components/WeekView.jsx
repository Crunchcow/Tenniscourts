import { format, parseISO, isToday } from 'date-fns'
import { de } from 'date-fns/locale'

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export default function WeekView({ data, onDayClick }) {
  if (!data?.days?.length) {
    return <p className="text-center py-16 text-slate-400 text-sm">Keine Daten.</p>
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const courts = data.days[0]?.courts ?? []

  return (
    <div className="animate-fade-up pt-4">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">

        {/* Header row */}
        <div
          className="grid border-b border-slate-200"
          style={{ gridTemplateColumns: `140px repeat(${data.days.length}, minmax(0,1fr))` }}
        >
          <div className="px-4 py-3 bg-slate-50 border-r border-slate-200" />
          {data.days.map(day => {
            const d = parseISO(day.date)
            const today = day.date === todayStr
            return (
              <button
                key={day.date}
                onClick={() => onDayClick(day.date)}
                className={`
                  px-2 py-3 text-center border-r border-slate-200 last:border-r-0 transition-colors
                  ${today ? 'bg-red-50' : 'bg-slate-50 hover:bg-slate-100'}
                `}
              >
                <p className={`text-[0.65rem] font-bold uppercase tracking-wider ${today ? 'text-brand' : 'text-slate-400'}`}>
                  {WD[d.getDay()]}
                </p>
                <p className={`text-base font-black leading-tight ${today ? 'text-brand' : 'text-slate-800'}`}>
                  {d.getDate()}
                </p>
                <p className="text-[0.6rem] text-slate-400 mt-0.5">
                  {format(d, 'MMM', { locale: de })}
                </p>
              </button>
            )
          })}
        </div>

        {/* Court rows */}
        {courts.map((court, ci) => (
          <div
            key={court.id}
            className="grid border-b border-slate-100 last:border-b-0"
            style={{ gridTemplateColumns: `140px repeat(${data.days.length}, minmax(0,1fr))` }}
          >
            {/* Court label */}
            <div className="flex items-center gap-2 px-4 py-4 bg-slate-50/70 border-r border-slate-200">
              <span className="text-lg leading-none">🎾</span>
              <span className="text-sm font-bold text-slate-800 leading-tight">{court.name}</span>
            </div>

            {/* Day cells */}
            {data.days.map(day => {
              const c = day.courts[ci] ?? {}
              const today = day.date === todayStr
              return (
                <button
                  key={day.date}
                  onClick={() => onDayClick(day.date)}
                  className={`
                    flex items-center justify-center py-4 border-r border-slate-100 last:border-r-0 transition-all
                    ${today ? 'bg-red-50/60 hover:bg-red-100/60' : 'hover:bg-slate-50'}
                  `}
                >
                  {c.has_activity ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                      </div>
                      <span className="text-[0.62rem] text-brand font-semibold">Belegt</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[0.62rem] text-emerald-600 font-semibold">Frei</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Auf einen Tag klicken für die Tagesansicht
      </p>
    </div>
  )
}
