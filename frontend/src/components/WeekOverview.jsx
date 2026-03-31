import { toISODate, isToday } from '../utils/dateHelpers'

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function ActivityDot({ hasActivity }) {
  if (hasActivity === null) {
    // Ladestate
    return <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse mx-auto" />
  }
  return (
    <div
      className={`w-5 h-5 rounded-full mx-auto ${
        hasActivity ? 'bg-rot-600' : 'bg-green-500'
      }`}
      title={hasActivity ? 'Belegt' : 'Frei'}
    />
  )
}

export default function WeekOverview({ weekData, loading, onSelectDay, selectedDate }) {
  const courts = weekData?.days?.[0]?.courts ?? []

  // Dummy-Zeilen während des Ladens
  const rows = loading && !weekData
    ? Array.from({ length: 7 }, (_, i) => ({
        date: null,
        courts: courts.map((c) => ({ ...c, has_activity: null })),
      }))
    : weekData?.days ?? []

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-500 w-28">Tag</th>
            {courts.map((court) => (
              <th key={court.id} className="px-4 py-3 font-semibold text-gray-700 text-center">
                {court.name}
              </th>
            ))}
            {courts.length === 0 && (
              <>
                <th className="px-4 py-3 font-semibold text-gray-200 text-center">Platz 1</th>
                <th className="px-4 py-3 font-semibold text-gray-200 text-center">Platz 2</th>
                <th className="px-4 py-3 font-semibold text-gray-200 text-center">Platz 3</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((day, i) => {
            const dateObj = day.date ? new Date(day.date + 'T12:00:00') : null
            const isSelected = dateObj && toISODate(dateObj) === toISODate(selectedDate)
            const isTodayRow = dateObj && isToday(dateObj)

            return (
              <tr
                key={day.date ?? i}
                onClick={() => dateObj && onSelectDay(dateObj)}
                className={`
                  border-b border-gray-50 last:border-0 cursor-pointer transition-colors
                  ${isSelected ? 'bg-rot-50 hover:bg-rot-100' : 'hover:bg-gray-50'}
                `}
              >
                {/* Tag-Spalte */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isTodayRow ? 'text-rot-700' : 'text-gray-700'}`}>
                      {dateObj
                        ? DAY_NAMES[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1]
                        : '—'}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {dateObj
                        ? `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.`
                        : ''}
                    </span>
                    {isTodayRow && (
                      <span className="text-xs text-rot-600 font-bold">Heute</span>
                    )}
                  </div>
                </td>

                {/* Platz-Spalten */}
                {(day.courts ?? [null, null, null]).map((court, j) => (
                  <td key={court?.id ?? j} className="px-4 py-3 text-center">
                    <ActivityDot hasActivity={court?.has_activity ?? null} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legende */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50 rounded-b-xl text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Keine Buchungen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rot-600" />
          <span>Belegt / gesperrt</span>
        </div>
        <span className="ml-auto text-gray-400">Auf Tag klicken für Details</span>
      </div>
    </div>
  )
}
