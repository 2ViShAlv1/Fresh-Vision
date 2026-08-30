const STATS = [
  { value: '14', label: 'Produce classes' },
  { value: '5', label: 'Freshness levels' },
  { value: '3', label: 'Neural networks' },
  { value: '<1s', label: 'Typical inference' },
]

export default function Hero({ onCta }) {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <span className="pill">
          <i className="pill__dot" />
          MobileNetV2 · Two-stage pipeline
        </span>

        <h1 className="hero__title">
          Know if produce is
          <span className="hero__title-accent"> fresh or rotten </span>
          in one shot.
        </h1>

        <p className="hero__sub">
          Fresh Vision runs an ImageNet gatekeeper, a 14-class produce identifier and a calibrated
          freshness classifier over your photo — and returns a graded verdict with confidence
          breakdowns you can actually audit.
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

        <div className="hero__stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat__value">{stat.value}</div>
              <div className="stat__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero__orb" aria-hidden="true" />
    </section>
  )
}
