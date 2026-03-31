import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchBookingByToken, cancelBookingByToken } from '../api/client'
import Header from '../components/Header'

export default function CancellationPage() {
  const { token } = useParams()
  const [booking, setBooking] = useState(null)
  const [state, setState] = useState('loading') // loading | found | not_found | cancelled | confirming | error

  useEffect(() => {
    fetchBookingByToken(token)
      .then((data) => {
        setBooking(data)
        setState(data.status === 'cancelled' ? 'already_cancelled' : 'found')
      })
      .catch(() => setState('not_found'))
  }, [token])

  const handleCancel = async () => {
    setState('confirming')
    try {
      await cancelBookingByToken(token)
      setState('cancelled')
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Stornierung fehlgeschlagen.'
      setState('error_msg')
      setBooking((b) => ({ ...b, _error: msg }))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden">

          {/* Loading */}
          {state === 'loading' && (
            <div className="p-10 flex flex-col items-center gap-4 text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-rot-700 border-t-transparent rounded-full" />
              <p>Buchung wird geladen …</p>
            </div>
          )}

          {/* Not found */}
          {state === 'not_found' && (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Buchung nicht gefunden</h2>
              <p className="text-gray-500 text-sm mb-4">Der Link ist ungültig oder bereits abgelaufen.</p>
              <Link to="/" className="text-rot-700 font-medium text-sm underline">Zur Startseite</Link>
            </div>
          )}

          {/* Already cancelled */}
          {state === 'already_cancelled' && (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Bereits storniert</h2>
              <p className="text-gray-500 text-sm mb-4">Diese Buchung wurde bereits storniert.</p>
              <Link to="/" className="text-rot-700 font-medium text-sm underline">Zur Startseite</Link>
            </div>
          )}

          {/* Found – confirm cancel */}
          {state === 'found' && booking && (
            <>
              <div className="bg-rot-700 text-white px-6 py-4">
                <h2 className="font-bold text-lg">Buchung stornieren</h2>
                <p className="text-rot-200 text-sm">Möchten Sie diese Buchung wirklich stornieren?</p>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <Row label="Platz"    value={booking.court} />
                  <Row label="Name"     value={booking.booker_name} />
                  <Row label="Datum"    value={booking.date} />
                  <Row label="Uhrzeit"  value={`${booking.start} – ${booking.end} Uhr`} />
                </div>
                <div className="flex gap-3 pt-1">
                  <Link
                    to="/"
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Abbrechen
                  </Link>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2.5 rounded-xl bg-rot-700 text-white text-sm font-semibold hover:bg-rot-800 transition-colors"
                  >
                    Jetzt stornieren
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Confirming */}
          {state === 'confirming' && (
            <div className="p-10 flex flex-col items-center gap-4 text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-rot-700 border-t-transparent rounded-full" />
              <p>Stornierung wird verarbeitet …</p>
            </div>
          )}

          {/* Success */}
          {state === 'cancelled' && (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Buchung storniert</h2>
              <p className="text-gray-500 text-sm mb-4">
                Ihre Buchung wurde erfolgreich storniert. Eine Bestätigung wurde an Ihre E-Mail gesendet.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-2.5 rounded-xl bg-rot-700 text-white font-semibold hover:bg-rot-800 transition-colors"
              >
                Zur Startseite
              </Link>
            </div>
          )}

          {/* Error */}
          {state === 'error_msg' && (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">Fehler</h2>
              <p className="text-gray-500 text-sm mb-4">{booking?._error}</p>
              <Link to="/" className="text-rot-700 font-medium text-sm underline">Zur Startseite</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  )
}
