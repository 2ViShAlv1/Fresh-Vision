export default function ConfidenceBar({ label, value, color, mono }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="cbar">
      <div className="cbar__head">
        <span className="cbar__label">{label}</span>
        <span className={`cbar__value ${mono ? 'mono' : ''}`}>{pct.toFixed(2)}%</span>
      </div>
      <div className="cbar__track">
        <div
          className="cbar__fill"
          style={{ width: `${pct}%`, background: color || 'var(--green)' }}
        />
      </div>
    </div>
  )
}
