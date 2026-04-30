import { useState, useEffect, useCallback } from 'react'
import { format, addDays, startOfWeek, isToday, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { authStatus, getSchedule, getWeek } from './api.js'
import Topbar from './components/Topbar.jsx'
import DateNav from './components/DateNav.jsx'
import DayView from './components/DayView.jsx'
import WeekView from './components/WeekView.jsx'
import BookingModal from './components/BookingModal.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  const [date, setDate]       = useState(new Date())
  const [view, setView]       = useState('day')
  const [auth, setAuth]       = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [weekData, setWeekData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // { courtId, courtName }
  const [toast, setToast]     = useState(null)

  useEffect(() => {
    authStatus().then(setAuth).catch(() => setAuth({ authenticated: false }))
  }, [])

  const loadDay = useCallback(async (d) => {
    setLoading(true)
    try {
      const data = await getSchedule(format(d, 'yyyy-MM-dd'))
      setSchedule(data)
    } catch {
      setSchedule(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWeek = useCallback(async (d) => {
    setLoading(true)
    try {
      const mon = startOfWeek(d, { weekStartsOn: 1 })
      const data = await getWeek(format(mon, 'yyyy-MM-dd'))
      setWeekData(data)
    } catch {
      setWeekData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === 'day') loadDay(date)
    else loadWeek(date)
  }, [date, view, loadDay, loadWeek])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  const openModal = (courtId, courtName) => {
    if (!auth?.authenticated) {
      window.location.href = '/api/auth/login/'
      return
    }
    setModal({ courtId, courtName })
  }

  const onBooked = () => {
    setModal(null)
    showToast('✅ Buchung bestätigt! Bestätigung kommt per E-Mail.', 'success')
    loadDay(date)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Topbar auth={auth} />

      <DateNav
        date={date}
        view={view}
        onDateChange={setDate}
        onViewChange={setView}
      />

      <main className="max-w-screen-xl mx-auto px-4 pb-16">
        {loading ? (
          <Loader />
        ) : view === 'day' ? (
          <DayView
            date={date}
            data={schedule}
            onBook={openModal}
          />
        ) : (
          <WeekView
            data={weekData}
            onDayClick={(d) => { setDate(parseISO(d)); setView('day') }}
          />
        )}
      </main>

      {modal && (
        <BookingModal
          courtId={modal.courtId}
          courtName={modal.courtName}
          date={date}
          auth={auth}
          onClose={() => setModal(null)}
          onBooked={onBooked}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-400">
      <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-brand animate-spin" />
      <span className="text-sm font-medium">Lade Belegungsplan…</span>
    </div>
  )
}
