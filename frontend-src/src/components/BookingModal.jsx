import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { X, Check, AlertCircle } from 'lucide-react'
import { createBooking } from '../api.js'

export default function BookingModal({ courtId, courtName, date, auth, onClose, onBooked, onError }) {
  const [name,  setName]  = useState(auth?.name  ?? '')
  const [email, setEmail] = useState(auth?.email ?? '')
  const [phone, setPhone] = useState('')
  const [start, setStart] = useState('')
  const [end,   setEnd]   = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    setTimeout(() => firstRef.current?.focus(), 80)
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const dateStr  = format(date, 'yyyy-MM-dd')
  const dateLabel = format(date, 'EEEE, d. MMMM yyyy', { locale: de })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!start || !end) { setError('Bitte Start- und Endzeit angeben.'); return }
    setLoading(true)
    try {
      await createBooking({
        court: courtId,
        booker_name:  name.trim(),
        booker_email: email.trim(),
        booker_phone: phone.trim(),
        notes:        notes.trim(),
        start_datetime: `${dateStr}T${start}:00`,
        end_datetime:   `${dateStr}T${end}:00`,
      })
      onBooked()
    } catch (err) {
      const data = err.data ?? {}
      const msg = data.non_field_errors?.join(' ')
        ?? data.detail
        ?? Object.values(data).flat().join(' ')
        ?? 'Unbekannter Fehler.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl animate-scale-in overflow-hidden sm:animate-scale-in animate-slide-in sm:animate-none">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-brand to-brand-dark px-6 pt-6 pb-5 text-white overflow-hidden">
          <div className="absolute inset-0 text-[7rem] opacity-[0.07] flex items-center justify-end pr-4 leading-none select-none">🎾</div>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black leading-tight">Platz buchen</h2>
              <p className="text-white/70 text-sm mt-1">{courtName} · {dateLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex-shrink-0 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dein Name *">
              <input ref={firstRef} required value={name} onChange={e => setName(e.target.value)}
                className={inp} placeholder="Max Mustermann" autoComplete="name" />
            </Field>
            <Field label="E-Mail *">
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className={inp} placeholder="max@example.de" autoComplete="email" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Von *">
              <input required type="time" value={start} onChange={e => setStart(e.target.value)}
                step="1800" className={inp} />
            </Field>
            <Field label="Bis *">
              <input required type="time" value={end} onChange={e => setEnd(e.target.value)}
                step="1800" className={inp} />
            </Field>
          </div>

          <Field label={<>Telefon <span className="text-slate-400 font-normal">(optional)</span></>}>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className={inp} placeholder="+49 151 …" autoComplete="tel" />
          </Field>

          <Field label={<>Anmerkungen <span className="text-slate-400 font-normal">(optional)</span></>}>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className={`${inp} resize-none`} placeholder="z.B. Turniervorbereitung…" />
          </Field>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1 pb-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-light disabled:opacity-60 text-white font-bold text-sm transition-all shadow-lg shadow-brand/30">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><Check size={15} /> Jetzt buchen</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inp = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all'

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      {children}
    </div>
  )
}
