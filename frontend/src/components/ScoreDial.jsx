export default function ScoreDial({ value, color, caption }) {
  const size = 168
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="dial">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct.toFixed(0)} percent`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}
        />
        <circle
          className="dial__progress"
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="dial__center">
        <span className="dial__value" style={{ color }}>{pct.toFixed(0)}<i>%</i></span>
        <span className="dial__caption">{caption}</span>
      </div>
    </div>
  )
}
