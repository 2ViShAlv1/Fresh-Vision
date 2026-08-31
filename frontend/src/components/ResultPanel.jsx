import ConfidenceBar from './ConfidenceBar'
import ScoreDial from './ScoreDial'
import { scoreOutOfTen, verdictTheme } from '../lib/format'

function EmptyState() {
  return (
    <div className="result result--empty">
      <span className="result__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <h3>No analysis yet</h3>
      <p>Upload a photo of a fruit or vegetable and the pipeline will grade it here.</p>
      <div className="result__tips">
        <span>🍎 One item per photo</span>
        <span>💡 Even lighting</span>
        <span>🎯 Centred in frame</span>
      </div>
    </div>
  )
}

function LoadingState() {
  const steps = ['Preprocessing to 224×224', 'ImageNet gatekeeper', 'Produce identifier', 'Freshness classifier']
  return (
    <div className="result result--loading">
      <div className="scanner" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
      <h3>Analyzing image…</h3>
      <ul className="steps">
        {steps.map((step, i) => (
          <li key={step} style={{ animationDelay: `${i * 0.35}s` }}>
            <i /> {step}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ResultPanel({ result, loading, error, onRetry }) {
  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="result result--error">
        <span className="result__glyph result__glyph--error" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.2v.1" />
          </svg>
        </span>
        <h3>Analysis failed</h3>
        <p>{error}</p>
        {onRetry ? <button className="btn btn--ghost btn--tiny" onClick={onRetry}>Try again</button> : null}
      </div>
    )
  }

  if (!result) return <EmptyState />

  const theme = verdictTheme(result)
  const score = scoreOutOfTen(result)
  const isOk = result.status === 'ok'

  return (
    <div className="result result--filled" style={{ '--accent': theme.color }}>
      <div className="result__top">
        <span className={`badge badge--${theme.tone}`}>
          <i /> {theme.label}
        </span>
        {result.latencyMs ? <span className="result__latency mono">{result.latencyMs} ms</span> : null}
      </div>

      <h2 className="result__headline" style={{ color: theme.color }}>{result.headline}</h2>
      {result.detail ? <p className="result__detail">{result.detail}</p> : null}

      {isOk ? (
        <>
          <div className="result__hero">
            <ScoreDial value={result.freshnessConfidence} color={theme.color} caption="Condition confidence" />
            <div className="result__facts">
              <div className="fact">
                <span className="fact__key">Produce</span>
                <span className="fact__val">{result.produce}</span>
              </div>
              <div className="fact">
                <span className="fact__key">Condition</span>
                <span className="fact__val" style={{ color: theme.color }}>{result.freshness}</span>
              </div>
              <div className="fact">
                <span className="fact__key">Freshness score</span>
                <span className="fact__val mono">{score?.toFixed(1)} / 10</span>
              </div>
              <div className="fact">
                <span className="fact__key">Est. shelf life</span>
                <span className="fact__val">{result.shelfLife}</span>
              </div>
            </div>
          </div>

          <div className="result__grid">
            <section className="panel">
              <h4>Produce identification</h4>
              {result.topProduce.map((item, i) => (
                <ConfidenceBar
                  key={item.label}
                  label={item.label}
                  value={item.confidence}
                  color={i === 0 ? 'linear-gradient(90deg, var(--blue), var(--teal))' : 'var(--border-strong)'}
                  mono
                />
              ))}
            </section>

            <section className="panel">
              <h4>Freshness distribution <em>calibrated</em></h4>
              {result.freshnessBreakdown.map((item) => (
                <ConfidenceBar
                  key={item.key}
                  label={item.label}
                  value={item.confidence}
                  color={item.key === result.freshnessKey ? theme.color : 'var(--border-strong)'}
                  mono
                />
              ))}
            </section>
          </div>
        </>
      ) : (
        <div className="result__grid">
          {result.gatekeeper?.label ? (
            <section className="panel">
              <h4>Gatekeeper (ImageNet)</h4>
              <ConfidenceBar label={result.gatekeeper.label} value={result.gatekeeper.confidence} color="var(--amber)" mono />
              <p className="panel__note">
                The MobileNetV2 gatekeeper screens out anything that is not produce before the
                freshness head runs.
              </p>
            </section>
          ) : null}
          {result.topProduce?.length ? (
            <section className="panel">
              <h4>Closest produce matches</h4>
              {result.topProduce.map((item) => (
                <ConfidenceBar key={item.label} label={item.label} value={item.confidence} color="var(--border-strong)" mono />
              ))}
            </section>
          ) : null}
        </div>
      )}

      <footer className="result__foot">
        <span className="mono">{result.filename}</span>
        <span>Gatekeeper: {result.gatekeeper?.label} · {result.gatekeeper?.confidence}%</span>
      </footer>
    </div>
  )
}
