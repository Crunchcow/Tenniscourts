import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid } from 'lucide-react'
import { format, addDays, isToday } from 'date-fns'
import { de } from 'date-fns/locale'

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export default function DateNav({ date, view, onDateChange, onViewChange }) {
  const chips = Array.from({ length: 9 }, (_, i) => addDays(date, i - 4))

  return (
    <div className="bg-slate-100 border-b border-slate-200">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col gap-2">

        {/* Row 1: date + arrows + view toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDateChange(addDays(date, -1))}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand hover:text-brand transition-all flex-shrink-0 shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 text-sm leading-tight truncate">
              {format(date, 'EEEE, d. MMMM yyyy', { locale: de })}
            </h2>
            {isToday(date) && (
              <span className="flex-shrink-0 px-2 py-0.5 text-[0.6rem] font-bold bg-brand text-white rounded-full tracking-wide">
                HEUTE
              </span>
            )}
          </div>

          <button
            onClick={() => onDateChange(addDays(date, 1))}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand hover:text-brand transition-all flex-shrink-0 shadow-sm"
          >
            <ChevronRight size={16} />
          </button>

          {/* View toggle — inline rechts */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5 shadow-sm flex-shrink-0 ml-1">
            {[
              { id: 'day',  icon: CalendarDays, label: 'Tag' },
              { id: 'week', icon: LayoutGrid,   label: 'Woche' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`
                  flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.72rem] font-semibold transition-all
                  ${view === id
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: day chips */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {chips.map((d) => {
            const active = format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            const today  = isToday(d)
            return (
              <button
                key={d.toISOString()}
                onClick={() => onDateChange(d)}
                className={`
                  flex flex-col items-center min-w-[44px] px-2 py-1.5 rounded-xl border transition-all flex-shrink-0 relative
                  ${active
                    ? 'bg-brand border-brand text-white shadow-md shadow-brand/25'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand/50 hover:text-brand'
                  }
                `}
              >
                <span className={`text-[0.55rem] font-bold uppercase tracking-widest leading-none ${active ? 'text-white/70' : 'text-slate-400'}`}>
                  {WD[d.getDay()]}
                </span>
                <span className="text-sm font-black leading-snug">{d.getDate()}</span>
                {today && !active && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-brand" />
                )}
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
