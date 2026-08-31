import { useEffect, useRef, useState } from 'react'

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${shown ? 'is-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const PIPELINE = [
  {
    step: '01',
    title: 'Preprocess',
    body: 'The image is converted to RGB, resized to 224×224 and normalised with the MobileNetV2 preprocessing function — exactly matching training conditions.',
  },
  {
    step: '02',
    title: 'Gatekeeper',
    body: 'A pretrained ImageNet MobileNetV2 scans the top-5 labels for produce keywords. Non-food images are rejected before they can be mislabelled as fruit.',
  },
  {
    step: '03',
    title: 'Identify',
    body: 'A fine-tuned classifier assigns one of 14 produce classes. Predictions under 65% confidence are surfaced as uncertain rather than guessed.',
  },
  {
    step: '04',
    title: 'Grade freshness',
    body: 'A second head predicts five decay levels. Calibration weights correct the training-set bias toward "slightly rotten" before the softmax is renormalised.',
  },
]

const FAQS = [
  {
    q: 'Why does the app sometimes say "Not a fruit or vegetable"?',
    a: 'The ImageNet gatekeeper runs first. If none of its top-5 labels match a produce keyword and it is more than 20% confident about what it does see, the request is rejected instead of forced into one of the 14 classes.',
  },
  {
    q: 'What does "calibrated" mean on the freshness chart?',
    a: 'The raw freshness head over-predicts "slightly rotten" and rarely fires "very rotten". Fixed multipliers (0.3×, 1.5×, 2.5×) reweight those logits and the distribution is renormalised so probabilities still sum to 1.',
  },
  {
    q: 'Is my image stored anywhere?',
    a: 'No. The image is held in memory for inference, a thumbnail is echoed back in the response, and nothing is written to disk or to a database.',
  },
  {
    q: 'What accuracy should I expect?',
    a: 'Identification is strong on clean, centred, well-lit single-item photos. Cluttered scenes, multiple items in frame, or unusual lighting will reduce confidence — which is why every confidence figure is shown rather than hidden.',
  },
]

const PRODUCE_EMOJI = {
  Apple: '🍎', Banana: '🍌', Bellpepper: '🫑', Carrot: '🥕', Cucumber: '🥒',
  Grape: '🍇', Guava: '🍈', Jujube: '🌰', Mango: '🥭', Orange: '🍊',
  Pomegranate: '🍒', Potato: '🥔', Strawberry: '🍓', Tomato: '🍅',
}

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <Reveal>
        <div className="section__head">
          <span className="eyebrow">Pipeline</span>
          <h2>Four stages, fully inspectable</h2>
          <p>
            Nothing is a black box. Each stage exposes its own confidence so you can see exactly why
            a verdict was reached.
          </p>
        </div>
      </Reveal>

      <div className="pipeline">
        {PIPELINE.map((item, i) => (
          <Reveal key={item.step} delay={i * 90}>
            <article className="pipeline__card">
              <span className="pipeline__step mono">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function Coverage({ classes }) {
  const produce = classes?.produce?.length ? classes.produce : Object.keys(PRODUCE_EMOJI)
  const freshness = classes?.freshness?.length
    ? classes.freshness
    : ['Fresh', 'Rotten', 'Slightly Rotten', 'Very Fresh', 'Very Rotten']

  return (
    <section className="section" id="coverage">
      <Reveal>
        <div className="section__head">
          <span className="eyebrow">Coverage</span>
          <h2>What the models recognise</h2>
          <p>Fourteen produce classes graded across five levels of decay.</p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="chips">
          {produce.map((name) => (
            <span key={name} className="chip">
              <em>{PRODUCE_EMOJI[name] || '🥗'}</em>
              {name}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div className="scale">
          {freshness
            .slice()
            .sort((a, b) => {
              const order = ['Very Fresh', 'Fresh', 'Slightly Rotten', 'Rotten', 'Very Rotten']
              return order.indexOf(a) - order.indexOf(b)
            })
            .map((level) => (
              <div key={level} className={`scale__item scale__item--${level.toLowerCase().replace(/\s+/g, '-')}`}>
                <span className="scale__dot" />
                {level}
              </div>
            ))}
        </div>
      </Reveal>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section" id="faq">
      <Reveal>
        <div className="section__head">
          <span className="eyebrow">FAQ</span>
          <h2>Questions worth asking</h2>
        </div>
      </Reveal>

      <div className="faq">
        {FAQS.map((item, i) => (
          <Reveal key={item.q} delay={i * 70}>
            <div className={`faq__item ${open === i ? 'is-open' : ''}`}>
              <button className="faq__q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{item.q}</span>
                <i aria-hidden="true" />
              </button>
              <div className="faq__a"><p>{item.a}</p></div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function CallToAction({ onCta }) {
  return (
    <section className="section" id="cta" style={{ paddingTop: 0 }}>
      <Reveal>
        <div className="cta">
          <h2>Grade your first image in under a second</h2>
          <p>
            No account, no upload limit, no data leaves the machine. Drop in a photo and see the
            full confidence breakdown for yourself.
          </p>
          <button className="btn btn--primary btn--light" onClick={onCta}>
            Try the analyzer
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </Reveal>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <a className="brand" href="#top">
            <span className="brand__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20c0-8 5.5-13 16-13 0 9-5.5 13.5-16 13z" />
                <path d="M4 20c3.6-4.2 7.5-7 11.5-8.6" />
              </svg>
            </span>
            <span className="brand__text">Fresh<span>Vision</span></span>
          </a>
          <p>
            AI-powered produce quality analysis. A two-stage MobileNetV2 pipeline that identifies
            what it sees, then grades how fresh it is — with every confidence figure on show.
          </p>
          <div className="footer__tech">
            {['TensorFlow', 'MobileNetV2', 'FastAPI', 'React', 'Vite'].map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Product</h4>
            <a href="#analyze">Analyzer</a>
            <a href="#how">Pipeline</a>
            <a href="#coverage">Coverage</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer__col">
            <h4>Models</h4>
            <span>Produce identifier · 14 classes</span>
            <span>Freshness head · 5 levels</span>
            <span>ImageNet gatekeeper</span>
          </div>
          <div className="footer__col">
            <h4>Privacy</h4>
            <span>No image storage</span>
            <span>No database writes</span>
            <span>In-memory inference only</span>
          </div>
        </div>
      </div>

      <div className="footer__bar">
        <span>© {new Date().getFullYear()} Fresh Vision · Built for produce quality research.</span>
        <span>Predictions are advisory — always confirm perishable goods manually.</span>
      </div>
    </footer>
  )
}
