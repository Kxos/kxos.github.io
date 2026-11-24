import { useLang } from '../../i18n/LangContext'

export default function Education() {
  const { t } = useLang()
  return (
    <section id="education">
      <canvas className="section-canvas" data-sec="education"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">04</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">{t.education.title}</h2>
        <div className="edu-grid">
          {t.education.items.map((e, i) => (
            <div className="edu-card sr" key={i}>
              <div className="edu-year">{e.year}</div>
              <div className="edu-degree">{e.degree}</div>
              <div className="edu-school">{e.school}</div>
              <div className="edu-desc">{e.desc}</div>
              <div className="edu-badge">{e.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
