import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#analyze', label: 'Analyze' },
  { href: '#how', label: 'How it works' },
  { href: '#coverage', label: 'Coverage' },
  { href: '#faq', label: 'FAQ' },
]

export default function NavBar({ health }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const status = health.state === 'ready' ? 'online' : health.state === 'loading' ? 'connecting' : 'offline'

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20c0-8 5.5-13 16-13 0 9-5.5 13.5-16 13z" />
              <path d="M4 20c3.6-4.2 7.5-7 11.5-8.6" />
            </svg>
          </span>
          <span className="brand__text">
            Fresh<span>Vision</span>
          </span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__right">
          <span className={`status status--${status}`} title={health.message || status}>
            <i />
            {status === 'online' ? 'Models online' : status === 'connecting' ? 'Connecting' : 'API offline'}
          </span>
          <button
            className="nav__toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
