import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#analyze', label: 'Analyze' },
  { href: '#how', label: 'How it works' },
  { href: '#coverage', label: 'Coverage' },
  { href: '#faq', label: 'FAQ' },
]

const STORAGE_KEY = 'freshvision-theme'

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export default function NavBar({ health }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(() => readStoredTheme() || 'light')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable — the in-memory theme still applies */
    }
  }, [theme])

  const status = health.state === 'ready' ? 'online' : health.state === 'loading' ? 'connecting' : 'offline'
  const isDark = theme === 'dark'

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
            className="theme-toggle"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>

          <button
            className={`nav__toggle ${open ? 'is-open' : ''}`}
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
