import { LogIn, X } from 'lucide-react'

export default function LoginPrompt({ courtName, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-5 pb-6 text-white overflow-hidden">
          <div className="absolute inset-0 text-[6rem] opacity-[0.06] flex items-center justify-end pr-3 leading-none select-none pointer-events-none">🎾</div>
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <LogIn size={20} className="text-white" />
              </div>
              <h2 className="text-base font-black leading-tight">Anmeldung erforderlich</h2>
              <p className="text-white/65 text-xs mt-1 leading-relaxed">
                Um <span className="font-semibold text-white/90">{courtName}</span> zu buchen, musst du dich mit deinem Vereins-Account anmelden.
              </p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-2">
          <a
            href="/api/auth/login/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand hover:bg-brand-light text-white font-bold text-sm transition-all shadow-lg shadow-brand/25"
          >
            <LogIn size={15} />
            Jetzt anmelden
          </a>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
