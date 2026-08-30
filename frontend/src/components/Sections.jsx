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

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <strong>Fresh Vision</strong>
          <p>AI-powered produce quality analysis · MobileNetV2 · TensorFlow · FastAPI · React</p>
        </div>
        <p className="footer__note">Predictions are advisory. Always confirm perishable goods manually.</p>
      </div>
    </footer>
  )
}
