export default function Toast({ msg, type }) {
  const colors = {
    success: 'bg-slate-900 text-white',
    error:   'bg-red-900 text-white',
  }
  return (
    <div className={`
      fixed bottom-6 right-5 z-[999] max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold
      animate-slide-in leading-snug
      ${colors[type] ?? colors.success}
    `}>
      {msg}
    </div>
  )
}
