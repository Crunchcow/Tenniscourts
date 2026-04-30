import { useState, useEffect, useCallback } from 'react'
import { format, addDays, startOfWeek, isToday, parseISO, isValid } from 'date-fns'
import { de } from 'date-fns/locale'
import { authStatus, getSchedule, getWeek } from './api.js'
import Topbar from './components/Topbar.jsx'
import DateNav from './components/DateNav.jsx'
import DayView from './components/DayView.jsx'
import WeekView from './components/WeekView.jsx'
import BookingModal from './components/BookingModal.jsx'
import SuccessCard from './components/SuccessCard.jsx'
import LoginPrompt from './components/LoginPrompt.jsx'
import Toast from './components/Toast.jsx'

function getInitialDate() {
  const p = new URLSearchParams(window.location.search).get('date')
  if (p) { const d = parseISO(p); if (isValid(d)) return d }
  return new Date()
}

export default function App() {
  const [date, setDate]         = useState(getInitialDate)
  const [view, setView]         = useState('day')
  const [auth, setAuth]         = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [weekData, setWeekData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)   // { courtId, courtName, start?, end? }
  const [success, setSuccess]   = useState(null)   // { booking, courtName }
  const [loginPrompt, setLoginPrompt] = useState(null) // { courtName }
  const [toast, setToast]       = useState(null)

  useEffect(() => {
    authStatus().then(setAuth).catch(() => setAuth({ authenticated: false }))
  }, [])

  // URL-Sync: date → ?date=yyyy-MM-dd
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newDate = format(date, 'yyyy-MM-dd')
    if (params.get('date') !== newDate) {
      params.set('date', newDate)
      window.history.replaceState(null, '', `?${params.toString()}`)
    }
  }, [date])

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

  const openModal = (courtId, courtName, start = '', end = '') => {
    if (!auth?.authenticated) {
      setLoginPrompt({ courtName })
      return
    }
    setModal({ courtId, courtName, start, end })
  }

  const onBooked = (booking, courtName) => {
    setModal(null)
    setSuccess({ booking, courtName })
    loadDay(date)
  }

  const onCancelled = () => {
    setSuccess(null)
    showToast('Buchung wurde storniert.', 'error')
    loadDay(date)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #f1f5f9 50%, #f0fdf4 100%)' }}>
      <Topbar auth={auth} />

      <DateNav
        date={date}
        view={view}
        onDateChange={setDate}
        onViewChange={setView}
      />

      <main className="max-w-screen-xl mx-auto px-4 pt-1 pb-16">
        {loading ? (
          <Loader />
        ) : view === 'day' ? (
          <DayView date={date} data={schedule} onBook={openModal} />
        ) : (
          <WeekView
            data={weekData}
            onDayClick={(d) => { setDate(parseISO(d)); setView('day') }}
          />
        )}
      </main>

      {loginPrompt && (
        <LoginPrompt
          courtName={loginPrompt.courtName}
          onClose={() => setLoginPrompt(null)}
        />
      )}

      {modal && (
        <BookingModal
          courtId={modal.courtId}
          courtName={modal.courtName}
          date={date}
          auth={auth}
          initialStart={modal.start}
          initialEnd={modal.end}
          onClose={() => setModal(null)}
          onBooked={onBooked}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {success && (
        <SuccessCard
          booking={success.booking}
          courtName={success.courtName}
          date={date}
          onClose={() => setSuccess(null)}
          onCancelled={onCancelled}
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
