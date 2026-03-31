import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-rot-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Titel */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <img src="/wappen-farbig.png" alt="SV Westfalia Osterwick" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">Tennisplatz-Buchung</div>
            <div className="text-rot-200 text-xs font-medium tracking-wide">
              SV Westfalia Osterwick · Tennisabteilung
            </div>
          </div>
        </Link>

        {/* Desktop-Navigation */}
        <nav className="hidden sm:flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-rot-600 transition-colors"
          >
            Buchungsplan
          </Link>
          <Link
            to="/verwaltung"
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            Verwaltung
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-rot-600 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menü"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown-Menü */}
      {menuOpen && (
        <div className="sm:hidden border-t border-rot-600 bg-rot-700 px-4 pb-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-sm font-medium hover:text-rot-200 transition-colors"
          >
            Buchungsplan
          </Link>
          <Link
            to="/verwaltung"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-sm font-medium hover:text-rot-200 transition-colors"
          >
            Verwaltung
          </Link>
        </div>
      )}
    </header>
  )
}
