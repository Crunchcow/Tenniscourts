import { useState, useEffect, useCallback } from 'react'
import { createBooking } from '../api/client'
import { toISODate, toLocalISOString } from '../utils/dateHelpers'
import { START_HOUR, END_HOUR } from '../utils/slotHelpers'

const MAX_DURATION = 90
const MIN_DURATION = 30

function pad(n) {
  return String(n).padStart(2, '0')
}

function generateStartTimes() {
  const times = []
  for (let h = START_HOUR; h < END_HOUR; h++) {
    times.push(`${pad(h)}:00`)
    if (h < END_HOUR - 1 || true) times.push(`${pad(h)}:30`)
  }
  // Letzte Buchung muss bis 21:00 enden → letzte mögliche Startzeit bei 90min: 19:30
  return times.filter((t) => {
    const [h, m] = t.split(':').map(Number)
    // Frühstens 09:00, spätestens so dass 30min Buchung bis 21:00 passt
    return h * 60 + m <= (END_HOUR * 60 - MIN_DURATION)
  })
}

const START_TIMES = generateStartTimes()

function calcEndTime(startStr, durationMin) {
  if (!startStr) return ''
  const [h, m] = startStr.split(':').map(Number)
  const endTotal = h * 60 + m + durationMin
  return `${pad(Math.floor(endTotal / 60))}:${pad(endTotal % 60)}`
}

function availableDurations(startStr) {
  if (!startStr) return [30, 60, 90]
  const [h, m] = startStr.split(':').map(Number)
  const startMin = h * 60 + m
  const maxEnd = END_HOUR * 60
  const available = []
  for (const d of [30, 60, 90]) {
    if (startMin + d <= maxEnd) available.push(d)
  }
  return available
}

export default function BookingModal({ isOpen, onClose, onSuccess, preselected }) {
  const [form, setForm] = useState({
    courtId: '',
    courtName: '',
    startTime: '',
    duration: 60,
    date: toISODate(new Date()),
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Vorauswahl übernehmen
  useEffect(() => {
    if (preselected && isOpen) {
      const startMinutes = preselected.startMinutes
      const h = Math.floor(startMinutes / 60)
      const m = startMinutes % 60
      const startTime = `${pad(h)}:${pad(m)}`
      const durs = availableDurations(startTime)
      setForm((f) => ({
        ...f,
        courtId: preselected.courtId,
        courtName: preselected.courtName,
        startTime,
        duration: durs.includes(60) ? 60 : durs[0],
        date: preselected.date ?? toISODate(new Date()),
      }))
    }
  }, [preselected, isOpen])

  // Reset beim Schließen
  useEffect(() => {
    if (!isOpen) {
      setErrors({})
      setLoading(false)
    }
  }, [isOpen])

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined, general: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Bitte Ihren Namen angeben.'
    if (!form.email.trim()) errs.email = 'Bitte Ihre E-Mail-Adresse angeben.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ungültige E-Mail-Adresse.'
    if (!form.startTime) errs.startTime = 'Bitte Startzeit wählen.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const [fh, fm] = form.startTime.split(':').map(Number)
    const baseDate = new Date(`${form.date}T${form.startTime}:00`)
    const endDate = new Date(baseDate.getTime() + form.duration * 60_000)

    setLoading(true)
    try {
      const result = await createBooking({
        court: form.courtId,
        booker_name: form.name.trim(),
        booker_email: form.email.trim(),
        booker_phone: form.phone.trim(),
        start_datetime: toLocalISOString(baseDate),
        end_datetime: toLocalISOString(endDate),
        notes: form.notes.trim(),
      })
      onSuccess(result)
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === 'object') {
        const msgs = Object.entries(detail)
          .map(([, v]) => (Array.isArray(v) ? v.join(' ') : v))
          .join(' ')
        setErrors({ general: msgs })
      } else {
        setErrors({ general: 'Die Buchung konnte nicht gespeichert werden.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const endTime = calcEndTime(form.startTime, form.duration)
  const durations = availableDurations(form.startTime)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] overflow-y-auto pb-safe">
        {/* Header */}
        <div className="bg-rot-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Platz buchen</h2>
            <p className="text-rot-200 text-sm">{form.courtName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rot-600 transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Datum & Zeit (Info-Row) */}
          <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Datum</span>
              <p className="font-semibold">
                {new Date(form.date + 'T12:00').toLocaleDateString('de-DE', {
                  weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Platz</span>
              <p className="font-semibold">{form.courtName}</p>
            </div>
          </div>

          {/* Startzeit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startzeit <span className="text-rot-700">*</span>
            </label>
            <select
              value={form.startTime}
              onChange={(e) => {
                const t = e.target.value
                const durs = availableDurations(t)
                set('startTime', t)
                if (!durs.includes(form.duration)) set('duration', durs[0] ?? 60)
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
            >
              <option value="">Bitte wählen …</option>
              {START_TIMES.map((t) => (
                <option key={t} value={t}>{t} Uhr</option>
              ))}
            </select>
            {errors.startTime && <p className="text-rot-700 text-xs mt-1">{errors.startTime}</p>}
          </div>

          {/* Dauer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dauer</label>
            <div className="flex gap-2">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={!durations.includes(d)}
                  onClick={() => set('duration', d)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.duration === d
                      ? 'bg-rot-700 text-white border-rot-700'
                      : durations.includes(d)
                      ? 'bg-white text-gray-700 border-gray-300 hover:border-rot-400'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  {d} Min
                </button>
              ))}
            </div>
            {form.startTime && (
              <p className="text-gray-500 text-xs mt-1">
                Ende: <strong>{endTime} Uhr</strong>
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-rot-700">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Vor- und Nachname"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
              autoComplete="name"
            />
            {errors.name && <p className="text-rot-700 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* E-Mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail <span className="text-rot-700">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="name@beispiel.de"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
              autoComplete="email"
            />
            {errors.email && <p className="text-rot-700 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="0123 456789"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
              autoComplete="tel"
            />
          </div>

          {/* Anmerkungen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anmerkungen <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              placeholder="z.B. Junioren, Doppel …"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700 resize-none"
            />
          </div>

          {/* Fehler */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {errors.general}
            </div>
          )}

          {/* Submits */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-rot-700 text-white text-sm font-semibold hover:bg-rot-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird gebucht …' : 'Jetzt buchen'}
            </button>
          </div>

          <p className="text-gray-400 text-xs text-center">
            Nach der Buchung erhalten Sie eine Bestätigungs-E-Mail mit Stornierungslink.
          </p>
        </form>
      </div>
    </div>
  )
}
