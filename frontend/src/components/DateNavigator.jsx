import { toShortDate, toISODate, isToday } from '../utils/dateHelpers'

export default function DateNavigator({ selectedDate, onPrev, onNext, onToday, weekDays }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Datum-Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onPrev}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Vorheriger Tag"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <div className="font-bold text-gray-900 text-lg">
              {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            {isToday(selectedDate) && (
              <span className="text-xs text-rot-700 font-semibold">Heute</span>
            )}
          </div>

          <button
            onClick={onNext}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Nächster Tag"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Wochenübersicht */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rot-700 text-white flex-shrink-0 hover:bg-rot-800 transition-colors"
          >
            Heute
          </button>
          {weekDays.map((day) => {
            const isSelected = toISODate(day) === toISODate(selectedDate)
            const todayFlag = isToday(day)
            return (
              <button
                key={toISODate(day)}
                onClick={() => {
                  // Wir brauchen ein onClick pro Datum – wird vom Elternteil gehandhabt
                  const event = new CustomEvent('selectDate', { detail: day })
                  document.dispatchEvent(event)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-rot-700 text-white'
                    : todayFlag
                    ? 'bg-rot-100 text-rot-700 border border-rot-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {toShortDate(day)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
