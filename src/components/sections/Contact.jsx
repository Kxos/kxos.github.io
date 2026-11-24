import { useLang } from '../../i18n/LangContext'
import { LINKS } from '../../i18n/content'
import { DownloadIcon, GitHubIcon } from '../ui/Icons'

export default function Contact() {
  const { t } = useLang()
  const c = t.contact
  return (
    <section id="contact">
      <canvas className="section-canvas" data-sec="contact"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">06</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">{c.title}</h2>
        <div className="contact-inner sr">
          <p className="contact-sub">{c.sub[0]}<br/>{c.sub[1]}</p>
          <div><a id="contact-email" className="contact-email-btn" href="#">vito.iannone90&#64;gmail.com</a></div>
          {t.cvUrl && (
            <div className="cv-block">
              <a id="cv-contact" href={t.cvUrl} download className="cv-btn">
                <DownloadIcon size={16} />
                {c.cv}
              </a>
            </div>
          )}
          <div className="socials">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="social-btn">
              <GitHubIcon />
              GitHub
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn
            </a>
            <a id="social-email" href="#" className="social-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {c.mail}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
