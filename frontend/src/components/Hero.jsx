const STATS = [
  { value: '14', label: 'Produce classes' },
  { value: '5', label: 'Freshness levels' },
  { value: '3', label: 'Neural networks' },
  { value: '<1s', label: 'Typical inference' },
]

const TRUST = [
  'Nothing is stored',
  'Every confidence shown',
  'Runs fully offline',
]

const PREVIEW_BARS = [
  { label: 'Very Fresh', value: 92, color: 'linear-gradient(90deg, var(--green-bright), var(--teal))' },
  { label: 'Fresh', value: 41, color: 'linear-gradient(90deg, #65c466, #9ad99b)' },
  { label: 'Slightly Rotten', value: 12, color: 'linear-gradient(90deg, var(--amber-bright), #fcd34d)' },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export default function Hero({ onCta }) {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero__inner">
          <div className="hero__copy">
            <span className="pill">
              <i className="pill__dot" />
              <b>MobileNetV2</b> · Two-stage vision pipeline
            </span>

            <h1 className="hero__title">
              Know if produce is
              <span className="hero__title-accent"> fresh or rotten </span>
              in one shot.
            </h1>

            <p className="hero__sub">
              Fresh Vision runs an ImageNet gatekeeper, a 14-class produce identifier and a
              calibrated freshness classifier over your photo — and returns a graded verdict with
              confidence breakdowns you can actually audit.
            </p>

            <div className="hero__actions">
              <button className="btn btn--primary" onClick={onCta}>
                Analyze an image
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <a className="btn btn--ghost" href="#how">See how it works</a>
            </div>

            <div className="hero__trust">
              {TRUST.map((item) => (
                <span key={item}>
                  <CheckIcon />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="hero__float hero__float--a">
              <em>⚡</em> 0.8s inference
            </div>

            <div className="preview">
              <div className="preview__bar">
                <i /><i /><i />
                <span>freshvision · /api/predict</span>
              </div>

              <div className="preview__body">
                <div className="preview__row">
                  <div className="preview__thumb">🍎</div>
                  <div className="preview__meta">
                    <strong>Apple</strong>
                    <small>98.4% identification confidence</small>
                  </div>
                  <span className="preview__verdict"><i /> Very Fresh</span>
                </div>

                <div className="preview__bars">
                  {PREVIEW_BARS.map((bar) => (
                    <div className="pbar" key={bar.label}>
                      <div className="pbar__top">
                        <span>{bar.label}</span>
                        <span>{bar.value.toFixed(1)}%</span>
                      </div>
                      <div className="pbar__track">
                        <div className="pbar__fill" style={{ width: `${bar.value}%`, background: bar.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="preview__foot">
                  <span>Est. shelf life · <b>5–7 days</b></span>
                  <span>Gatekeeper: passed</span>
                </div>
              </div>
            </div>

            <div className="hero__float hero__float--b">
              <em>🎯</em> Calibrated softmax
            </div>
          </div>
        </div>

        <div className="hero__orb" aria-hidden="true" />
      </section>

      <div className="stats-strip">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat">
            <div className="stat__value">{stat.value}</div>
            <div className="stat__label">{stat.label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
