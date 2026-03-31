export default function SuccessModal({ isOpen, booking, onClose }) {
  if (!isOpen || !booking) return null

  const cancelUrl = `${window.location.origin}/stornieren/${booking.cancellation_token}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center overflow-hidden">
        {/* Icon */}
        <div className="bg-green-50 px-6 pt-8 pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Buchung bestätigt!</h2>
          <p className="text-gray-500 text-sm mt-1">Eine Bestätigung wurde an Ihre E-Mail gesendet.</p>
        </div>

        <div className="px-6 py-4 space-y-2 text-sm text-left bg-gray-50 mx-4 rounded-xl my-4">
          {booking.court_name && (
            <div className="flex justify-between">
              <span className="text-gray-500">Platz</span>
              <span className="font-semibold">{booking.court_name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Uhrzeit</span>
            <span className="font-semibold">
              {new Date(booking.start_datetime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              {' – '}
              {new Date(booking.end_datetime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-semibold">{booking.booker_name}</span>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <p className="text-xs text-gray-500">
            Möchten Sie stornieren?{' '}
            <a href={cancelUrl} className="text-rot-700 underline font-medium">
              Buchung stornieren
            </a>
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-rot-700 text-white font-semibold hover:bg-rot-800 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
