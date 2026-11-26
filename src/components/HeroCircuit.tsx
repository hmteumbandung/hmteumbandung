/** Ilustrasi rangkaian elektronik: jalur PCB dengan denyut sinyal, resistor, dan chip pusat. Warna mengikuti tema. */
export function HeroCircuit() {
  const paths = [
    'M20 60 H120 V140 H200',
    'M20 200 H90 V260 H200',
    'M380 40 H300 V120 H260',
    'M380 300 H320 V230 H260',
    'M200 20 V70',
    'M200 330 V280',
  ]
  return (
    <svg viewBox="0 0 400 350" className="h-full w-full text-cyan-400" role="img" aria-label="Ilustrasi rangkaian elektronik">
      <defs>
        <linearGradient id="chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'rgb(var(--navy-700))' }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--navy-900))' }} />
        </linearGradient>
      </defs>
      {paths.map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
          <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="trace" />
        </g>
      ))}
      {[[20, 60], [20, 200], [380, 40], [380, 300], [200, 20], [200, 330]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" stroke="currentColor" strokeWidth="2" style={{ fill: 'rgb(var(--navy-900))' }} />
      ))}
      <path d="M60 60 l8 -10 l8 20 l8 -20 l8 20 l8 -10" fill="none" stroke="currentColor" strokeWidth="2" />
      <g stroke="currentColor" strokeWidth="2.5">
        <line x1="332" y1="214" x2="332" y2="246" />
        <line x1="344" y1="214" x2="344" y2="246" />
      </g>
      <rect x="150" y="100" width="100" height="130" rx="12" fill="url(#chip)" stroke="currentColor" strokeOpacity=".7" strokeWidth="2" />
      {[120, 150, 180, 210].map((y) => (
        <g key={y} stroke="currentColor" strokeOpacity=".6" strokeWidth="3">
          <line x1="138" y1={y} x2="150" y2={y} />
          <line x1="250" y1={y} x2="262" y2={y} />
        </g>
      ))}
      <path d="M168 168c6 0 6-24 13-24s7 48 14 48 7-48 14-48 7 24 22 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <text x="200" y="215" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" fontFamily="sans-serif">HMTE</text>
    </svg>
  )
}
