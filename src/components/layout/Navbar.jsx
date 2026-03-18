import { useEffect, useRef } from 'react'

export default function Navbar() {
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

    overlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open')
        overlay.classList.remove('open')
      })
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <nav id="nav" ref={navRef}>
        <div className="nav-inner">
          <a href="#hero" className="nav-brand">V<span className="nb-dot">.</span>I</a>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#education">Education</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
            <li>
              <a href="#game" className="nav-arcade-link" id="navArcadeLink">
                <span className="nav-arcade-lock">🔒</span>
                <span className="nav-arcade-text">???</span>
              </a>
            </li>
          </ul>
          <button className="nav-hamburger" id="hamburger" ref={hamburgerRef} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className="nav-mobile-overlay" id="mob-overlay" ref={overlayRef}>
        <a href="#about" className="mob-link">About</a>
        <a href="#skills" className="mob-link">Skills</a>
        <a href="#experience" className="mob-link">Experience</a>
        <a href="#education" className="mob-link">Education</a>
        <a href="#projects" className="mob-link">Projects</a>
        <a href="#contact" className="mob-link">Contact</a>
        <a href="#game" className="mob-link mob-arcade-link" id="mobArcadeLink">🔒 ???</a>
        <a href="Vito_Iannone_CV.pdf" download className="mob-cv">↓ Scarica CV</a>
      </div>
    </>
  )
}
