import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminBookings, fetchAdminBlocks,
  createBlock, deleteBlock, updateBookingStatus,
} from '../api/client'
import Header from '../components/Header'
import { toISODate, toLocalISOString } from '../utils/dateHelpers'

const BLOCK_TYPES = [
  { value: 'training',    label: 'Training' },
  { value: 'match',       label: 'Spieltag' },
  { value: 'maintenance', label: 'Platzsperrung' },
  { value: 'event',       label: 'Veranstaltung' },
]

const STATUS_BADGE = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [authEmail, setAuthEmail] = useState('')

  const [tab, setTab] = useState('bookings') // bookings | blocks
  const [date, setDate] = useState(toISODate(new Date()))

  const [bookings, setBookings] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Block-Formular
  const [blockForm, setBlockForm] = useState({
    court: 1,
    title: '',
    block_type: 'training',
    start_date: toISODate(new Date()),
    start_time: '09:00',
    end_date: toISODate(new Date()),
    end_time: '10:00',
    note: '',
    created_by: 'Verwaltung',
  })

  useEffect(() => {
    fetch('/api/auth/status/', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => {
        setAuthenticated(data.authenticated === true)
        setAuthEmail(data.email || '')
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    if (!authenticated) return
    loadData()
  }, [authenticated, tab, date])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === 'bookings') {
        const data = await fetchAdminBookings(date)
        setBookings(data)
      } else {
        const data = await fetchAdminBlocks(date, date)
        setBlocks(data)
      }
    } catch (e) {
      if (e.response?.status === 401) {
        setAuthenticated(false)
        setAdminToken('')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    fetch('/api/auth/logout/', { credentials: 'same-origin' })
      .finally(() => {
        setAuthenticated(false)
        setAuthEmail('')
      })
  }

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Buchung wirklich stornieren?')) return
    await updateBookingStatus(id, 'cancelled')
    setMsg('Buchung storniert.')
    loadData()
  }

  const handleDeleteBlock = async (id) => {
    if (!window.confirm('Sperrzeit wirklich löschen?')) return
    await deleteBlock(id)
    setMsg('Sperrzeit gelöscht.')
    loadData()
  }

  const handleCreateBlock = async (e) => {
    e.preventDefault()
    try {
      const start = toLocalISOString(new Date(`${blockForm.start_date}T${blockForm.start_time}:00`))
      const end   = toLocalISOString(new Date(`${blockForm.end_date}T${blockForm.end_time}:00`))
      await createBlock({
        court: Number(blockForm.court),
        title: blockForm.title,
        block_type: blockForm.block_type,
        start_datetime: start,
        end_datetime: end,
        note: blockForm.note,
        created_by: blockForm.created_by,
      })
      setMsg('Sperrzeit erstellt.')
      loadData()
    } catch (err) {
      const detail = err.response?.data
      const msgs = typeof detail === 'object'
        ? Object.values(detail).flat().join(' ')
        : 'Fehler beim Erstellen.'
      setMsg(`Fehler: ${msgs}`)
    }
  }

  // ── Auth-Check läuft noch ─────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Prüfe Anmeldung …</p>
        </main>
      </div>
    )
  }

  // ── Login-Screen ──────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden">
            <div className="bg-rot-700 text-white px-6 py-4">
              <h2 className="font-bold text-lg">Verwaltung</h2>
              <p className="text-rot-200 text-sm">Anmeldung erforderlich</p>
            </div>
            <div className="p-6 space-y-4">
              <a
                href="/api/auth/login/"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rot-700 text-white font-semibold hover:bg-rot-800 transition-colors text-center"
              >
                🔐 Mit FCTM-Konto anmelden
              </a>
              <Link to="/" className="block text-center text-xs text-gray-400 hover:text-gray-600">
                ← Zurück zum Buchungsplan
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Admin-Panel ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-2">
            {['bookings', 'blocks'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? 'bg-rot-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'bookings' ? 'Buchungen' : 'Sperrzeiten'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {authEmail && <span className="text-xs text-gray-500">{authEmail}</span>}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
            />
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
            >
              ↻
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
              title="Abmelden"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 space-y-4">
        {msg && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-2 text-sm flex justify-between">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-blue-400 hover:text-blue-600">✕</button>
          </div>
        )}

        {/* ── Buchungen ─────────────────────────────────────────────────── */}
        {tab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Buchungen am {date}</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400">Lade …</div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Keine Buchungen an diesem Tag.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      {['Platz', 'Zeit', 'Name', 'E-Mail', 'Telefon', 'Status', 'Aktion'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{b.court_name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {new Date(b.start_datetime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(b.end_datetime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-2">{b.booker_name}</td>
                        <td className="px-4 py-2 text-gray-600">{b.booker_email}</td>
                        <td className="px-4 py-2 text-gray-600">{b.booker_phone || '–'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[b.status] || ''}`}>
                            {b.status === 'confirmed' ? 'Bestätigt' : b.status === 'pending' ? 'Ausstehend' : 'Storniert'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Stornieren
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Sperrzeiten ───────────────────────────────────────────────── */}
        {tab === 'blocks' && (
          <div className="space-y-4">
            {/* Neue Sperrzeit */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Neue Sperrzeit anlegen</h3>
              </div>
              <form onSubmit={handleCreateBlock} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Platz</label>
                  <select
                    value={blockForm.court}
                    onChange={(e) => setBlockForm((f) => ({ ...f, court: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  >
                    <option value={1}>Platz 1</option>
                    <option value={2}>Platz 2</option>
                    <option value={3}>Platz 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Typ</label>
                  <select
                    value={blockForm.block_type}
                    onChange={(e) => setBlockForm((f) => ({ ...f, block_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  >
                    {BLOCK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Bezeichnung</label>
                  <input
                    type="text"
                    value={blockForm.title}
                    onChange={(e) => setBlockForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    placeholder="z.B. Jugendtraining, Verbandsspiel 1. Herren …"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Startdatum</label>
                  <input type="date" value={blockForm.start_date}
                    onChange={(e) => setBlockForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Startzeit</label>
                  <input type="time" value={blockForm.start_time}
                    onChange={(e) => setBlockForm((f) => ({ ...f, start_time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Enddatum</label>
                  <input type="date" value={blockForm.end_date}
                    onChange={(e) => setBlockForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Endzeit</label>
                  <input type="time" value={blockForm.end_time}
                    onChange={(e) => setBlockForm((f) => ({ ...f, end_time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Notiz (optional)</label>
                  <input type="text" value={blockForm.note}
                    onChange={(e) => setBlockForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="Zusätzliche Informationen …"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rot-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rot-700 text-white font-semibold hover:bg-rot-800 transition-colors"
                  >
                    Sperrzeit anlegen
                  </button>
                </div>
              </form>
            </div>

            {/* Vorhandene Sperrzeiten */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Sperrzeiten am {date}</h3>
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-400">Lade …</div>
              ) : blocks.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Keine Sperrzeiten an diesem Tag.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {blocks.map((bl) => (
                    <div key={bl.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{bl.title}</div>
                        <div className="text-xs text-gray-500">
                          Platz {bl.court} · {BLOCK_TYPES.find((t) => t.value === bl.block_type)?.label ?? bl.block_type}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(bl.start_datetime).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(bl.end_datetime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBlock(bl.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Löschen"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
