/** Stilisierte Tennisplatz-Draufsicht als SVG-Dekoration */
export default function TennisCourtSVG({ className = '' }) {
  return (
    <svg
      viewBox="0 0 200 130"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Platzboden */}
      <rect width="200" height="130" fill="#3a7d44" rx="4" />

      {/* Außenlinien (Doppel) */}
      <rect x="10" y="10" width="180" height="110" fill="none" stroke="white" strokeWidth="2" />

      {/* Einzel-Seitenlinien */}
      <line x1="10" y1="27" x2="190" y2="27" stroke="white" strokeWidth="1.2" />
      <line x1="10" y1="103" x2="190" y2="103" stroke="white" strokeWidth="1.2" />

      {/* Aufschlaglinien */}
      <line x1="55" y1="27" x2="55" y2="103" stroke="white" strokeWidth="1.2" />
      <line x1="145" y1="27" x2="145" y2="103" stroke="white" strokeWidth="1.2" />

      {/* Netz */}
      <line x1="10" y1="65" x2="190" y2="65" stroke="white" strokeWidth="3" />
      <line x1="10" y1="65" x2="190" y2="65" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Mittellinie Aufschlag */}
      <line x1="100" y1="27" x2="100" y2="103" stroke="white" strokeWidth="1.2" />

      {/* Mittelpunkte (T) */}
      <line x1="95" y1="10" x2="105" y2="10" stroke="white" strokeWidth="1.5" />
      <line x1="95" y1="120" x2="105" y2="120" stroke="white" strokeWidth="1.5" />
      <circle cx="100" cy="65" r="2" fill="white" />
    </svg>
  )
}
