import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid } from 'lucide-react'
import { format, addDays, isToday } from 'date-fns'
import { de } from 'date-fns/locale'

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export default function DateNav({ date, view, onDateChange, onViewChange }) {
  const chips = Array.from({ length: 9 }, (_, i) => addDays(date, i - 4))

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4">

        {/* Date row */}
        <div className="flex items-center justify-between py-4 gap-3">
          <button
            onClick={() => onDateChange(addDays(date, -1))}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand hover:text-brand hover:bg-red-50 transition-all flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-bold text-slate-900 text-lg leading-tight">
                {format(date, 'EEEE, d. MMMM yyyy', { locale: de })}
              </h2>
              {isToday(date) && (
                <span className="px-2 py-0.5 text-[0.65rem] font-bold bg-brand text-white rounded-full tracking-wide">
                  HEUTE
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onDateChange(addDays(date, 1))}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand hover:text-brand hover:bg-red-50 transition-all flex-shrink-0"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day chips */}
        <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-hide">
          {chips.map((d) => {
            const active = format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            const today  = isToday(d)
            return (
              <button
                key={d.toISOString()}
                onClick={() => onDateChange(d)}
                className={`
                  flex flex-col items-center min-w-[48px] px-2 py-2 rounded-xl border transition-all flex-shrink-0 relative
                  ${active
                    ? 'bg-brand border-brand text-white shadow-lg shadow-brand/25'
                    : 'border-slate-200 text-slate-600 hover:border-brand/40 hover:bg-red-50'
                  }
                `}
              >
                <span className={`text-[0.6rem] font-bold uppercase tracking-widest ${active ? 'text-white/70' : 'text-slate-400'}`}>
                  {WD[d.getDay()]}
                </span>
                <span className="text-sm font-black leading-tight">{d.getDate()}</span>
                {today && !active && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand" />
                )}
              </button>
            )
          })}
        </div>

        {/* View toggle */}
        <div className="flex justify-end pb-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {[
              { id: 'day',  icon: CalendarDays, label: 'Tag' },
              { id: 'week', icon: LayoutGrid,   label: 'Woche' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${view === id
                    ? 'bg-white text-brand shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
