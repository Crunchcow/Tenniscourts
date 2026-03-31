import { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import DateNavigator from '../components/DateNavigator'
import TimeGrid from '../components/TimeGrid'
import WeekOverview from '../components/WeekOverview'
import BookingModal from '../components/BookingModal'
import SuccessModal from '../components/SuccessModal'
import Legend from '../components/Legend'
import { fetchSchedule, fetchWeekOverview } from '../api/client'
import { toISODate, getMondayOf, getWeekDays, isToday } from '../utils/dateHelpers'

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('day') // 'day' | 'week'
  const [schedule, setSchedule] = useState(null)
  const [weekData, setWeekData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [bookingModal, setBookingModal] = useState({ open: false, preselected: null })
  const [successModal, setSuccessModal] = useState({ open: false, booking: null })

  const monday = getMondayOf(selectedDate)
  const weekDays = getWeekDays(monday)

  // Datum aus Wochenstreifen-Clicks
  useEffect(() => {
    const handler = (e) => setSelectedDate(new Date(e.detail))
    document.addEventListener('selectDate', handler)
    return () => document.removeEventListener('selectDate', handler)
  }, [])

  // Schedule laden wenn Datum sich ändert (Tagesansicht)
  useEffect(() => {
    if (view !== 'day') return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchSchedule(toISODate(selectedDate))
      .then((data) => { if (!cancelled) setSchedule(data) })
      .catch(() => { if (!cancelled) setError('Der Belegungsplan konnte nicht geladen werden.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toISODate(selectedDate), view])

  // Wochendaten laden wenn Wochenansicht aktiv oder Woche sich ändert
  useEffect(() => {
    if (view !== 'week') return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchWeekOverview(toISODate(monday))
      .then((data) => { if (!cancelled) setWeekData(data) })
      .catch(() => { if (!cancelled) setError('Die Wochenübersicht konnte nicht geladen werden.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [toISODate(monday), view])

  const handleBookClick = useCallback((courtId, courtName, startMinutes) => {
    setBookingModal({
      open: true,
      preselected: { courtId, courtName, startMinutes, date: toISODate(selectedDate) },
    })
  }, [selectedDate])

  const handleBookingSuccess = useCallback((booking) => {
    setBookingModal({ open: false, preselected: null })
    setSuccessModal({ open: true, booking })
    // Plan neu laden
    fetchSchedule(toISODate(selectedDate)).then(setSchedule).catch(() => {})
    // Wochendaten auch aktualisieren
    fetchWeekOverview(toISODate(monday)).then(setWeekData).catch(() => {})
  }, [selectedDate])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <DateNavigator
        selectedDate={selectedDate}
        onPrev={() => {
          const d = new Date(selectedDate)
          d.setDate(d.getDate() - (view === 'week' ? 7 : 1))
          setSelectedDate(d)
        }}
        onNext={() => {
          const d = new Date(selectedDate)
          d.setDate(d.getDate() + (view === 'week' ? 7 : 1))
          setSelectedDate(d)
        }}
        onToday={() => setSelectedDate(new Date())}
        weekDays={weekDays}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
        {/* View-Toggle */}
        <div className="flex items-center justify-end mb-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                view === 'day'
                  ? 'bg-rot-700 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tagesansicht
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                view === 'week'
                  ? 'bg-rot-700 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Wochenübersicht
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {view === 'week' ? (
          <WeekOverview
            weekData={weekData}
            loading={loading}
            selectedDate={selectedDate}
            onSelectDay={(date) => {
              setSelectedDate(date)
              setView('day')
            }}
          />
        ) : loading && !schedule ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-rot-700 border-t-transparent rounded-full" />
          </div>
        ) : (
          <TimeGrid
            schedule={schedule}
            selectedDate={selectedDate}
            onBookClick={handleBookClick}
          />
        )}
      </main>

      <Legend />

      <BookingModal
        isOpen={bookingModal.open}
        preselected={bookingModal.preselected}
        onClose={() => setBookingModal({ open: false, preselected: null })}
        onSuccess={handleBookingSuccess}
      />

      <SuccessModal
        isOpen={successModal.open}
        booking={successModal.booking}
        onClose={() => {
          setSuccessModal({ open: false, booking: null })
        }}
      />
    </div>
  )
}
