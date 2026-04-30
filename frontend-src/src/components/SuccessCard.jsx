import { useState } from 'react'
import { CheckCircle, X, Calendar, Clock, MapPin, AlertTriangle, Loader } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cancelBooking } from '../api.js'

export default function SuccessCard({ booking, courtName, date, onClose, onCancelled }) {
  const [cancelling, setCancelling] = useState(false)
  const [cancelled,  setCancelled]  = useState(false)
  const [confirm,    setConfirm]    = useState(false)
  const [error,      setError]      = useState('')

  const dateLabel = format(date, 'EEEE, d. MMMM yyyy', { locale: de })

  async function handleCancel() {
    setCancelling(true)
    setError('')
    try {
      await cancelBooking(booking.cancellation_token)
      setCancelled(true)
      setTimeout(() => { onCancelled?.(); onClose() }, 2200)
    } catch {
      setError('Stornierung fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl animate-scale-in overflow-hidden">

        {/* Green success header */}
        <div className="relative bg-gradient-to-br from-[#1a5c2e] to-[#166534] px-6 pt-6 pb-8 text-white overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="xMidYMid slice">
            <rect x="5%" y="10%" width="90%" height="80%" fill="none" stroke="white" strokeWidth="1.5"/>
            <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="white" strokeWidth="1.5"/>
            <line x1="15%" y1="10%" x2="15%" y2="90%" stroke="white" strokeWidth="1"/>
            <line x1="85%" y1="10%" x2="85%" y2="90%" stroke="white" strokeWidth="1"/>
          </svg>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start gap-3">
              {cancelled ? (
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <X size={24} className="text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-white" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-black leading-tight">
                  {cancelled ? 'Buchung storniert' : 'Buchung bestätigt!'}
                </h2>
                <p className="text-white/70 text-sm mt-0.5">
                  {cancelled ? 'Du erhältst eine Bestätigung per E-Mail.' : 'Eine Bestätigung wurde an deine E-Mail gesendet.'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Booking details card */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
            <div className="flex items-center gap-3 text-slate-700">
              <MapPin size={15} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Platz</p>
                <p className="text-sm font-bold">{courtName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar size={15} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Datum</p>
                <p className="text-sm font-bold">{dateLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Clock size={15} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Uhrzeit</p>
                <p className="text-sm font-bold">{booking.start} – {booking.end} Uhr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 space-y-3">
          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs font-semibold">
              <AlertTriangle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {!cancelled && !confirm && (
            <button
              onClick={() => setConfirm(true)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:border-red-300 hover:text-brand hover:bg-red-50 transition-all"
            >
              Buchung stornieren
            </button>
          )}

          {!cancelled && confirm && (
            <div className="space-y-2">
              <p className="text-xs text-center text-slate-500 font-medium">Wirklich stornieren?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Abbrechen
                </button>
                <button onClick={handleCancel} disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-light disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                  {cancelling ? <Loader size={14} className="animate-spin" /> : null}
                  Ja, stornieren
                </button>
              </div>
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#1a5c2e] text-white text-sm font-bold transition-colors">
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
