import { LogIn, LogOut, Settings } from 'lucide-react'

export default function Topbar({ auth }) {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/5 shadow-2xl">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/wappen-farbig.png"
            alt="Wappen"
            className="h-10 w-auto flex-shrink-0 drop-shadow-lg"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[0.6rem] uppercase tracking-widest text-white/40 font-semibold hidden sm:block">
              SV Westfalia Osterwick · Tennisabteilung
            </span>
            <span className="text-white font-black text-sm sm:text-base tracking-wide leading-tight">
              TENNISPLATZ-BUCHUNG
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {auth?.authenticated && (
            <span className="hidden md:flex items-center gap-1.5 text-white/60 text-sm font-medium px-3 py-1.5 rounded-full bg-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {auth.name}
            </span>
          )}

          {auth?.is_admin && (
            <a
              href="/admin/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
            >
              <Settings size={13} />
              Verwaltung
            </a>
          )}

          {auth?.authenticated ? (
            <a
              href="/api/auth/logout/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <LogOut size={13} />
              Abmelden
            </a>
          ) : (
            <a
              href="/api/auth/login/"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand hover:bg-brand-light text-white text-xs font-bold transition-all shadow-lg shadow-brand/30"
            >
              <LogIn size={13} />
              Anmelden
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
