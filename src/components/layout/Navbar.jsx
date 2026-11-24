import { useEffect, useRef } from 'react'
import { useLang } from '../../i18n/LangContext'
import { CV_URL } from '../../i18n/content'

const SECTIONS = ['about', 'skills', 'experience', 'education', 'projects', 'contact']

function LangToggle({ className = '' }) {
  const { lang, t, toggle } = useLang()
  return (
    <button type="button" className={`lang-toggle ${className}`} onClick={toggle} aria-label={t.nav.switchTo} title={t.nav.switchTo}>
      <span className={lang === 'en' ? 'on' : ''}>EN</span>
      <span className="lang-sep">/</span>
      <span className={lang === 'it' ? 'on' : ''}>IT</span>
    </button>
  )
}

export default function Navbar() {
  const { t } = useLang()
  const navRef = useRef(null)
  const hamburgerRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const nav = navRef.current
    const hamburger = hamburgerRef.current
    const overlay = overlayRef.current
    if (!nav || !hamburger || !overlay) return

    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })

    const onHamburger = () => {
      hamburger.classList.toggle('open')
      overlay.classList.toggle('open')
    }
    hamburger.addEventListener('click', onHamburger)

    const close = () => {
      hamburger.classList.remove('open')
      overlay.classList.remove('open')
    }
    const links = overlay.querySelectorAll('a')
    links.forEach(a => a.addEventListener('click', close))

    return () => {
      window.removeEventListener('scroll', onScroll)
      hamburger.removeEventListener('click', onHamburger)
      links.forEach(a => a.removeEventListener('click', close))
    }
  }, [])

  return (
    <>
      <nav id="nav" ref={navRef}>
        <div className="nav-inner">
          <a href="#hero" className="nav-brand">V<span className="nb-dot">.</span>I</a>
          <ul className="nav-links">
            {SECTIONS.map(id => (
              <li key={id}><a href={`#${id}`}>{t.nav[id]}</a></li>
            ))}
            <li>
              <a href="#game" className="nav-arcade-link" id="navArcadeLink">
                <span className="nav-arcade-lock">🔒</span>
                <span className="nav-arcade-text">???</span>
              </a>
            </li>
            <li><LangToggle /></li>
          </ul>
          <button className="nav-hamburger" id="hamburger" ref={hamburgerRef} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className="nav-mobile-overlay" id="mob-overlay" ref={overlayRef}>
        {SECTIONS.map(id => (
          <a href={`#${id}`} className="mob-link" key={id}>{t.nav[id]}</a>
        ))}
        <a href="#game" className="mob-link mob-arcade-link" id="mobArcadeLink">🔒 ???</a>
        {CV_URL && <a href={CV_URL} download className="mob-cv">{t.nav.cv}</a>}
        <LangToggle className="lang-toggle-mobile" />
      </div>
    </>
  )
}
