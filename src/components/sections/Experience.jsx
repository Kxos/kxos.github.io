import { useLang } from '../../i18n/LangContext'

export default function Experience() {
  const { t } = useLang()
  return (
    <section id="experience">
      <canvas className="section-canvas" data-sec="experience"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">03</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">{t.experience.title}</h2>
        <div className="timeline">
          {t.experience.items.map((item, i) => (
            <div className="titem" key={i}>
              <div className="tdot"></div>
              <div className="tdate">{item.date}</div>
              <div className="trole">{item.role}</div>
              <div className="tcompany">{item.company}</div>
              <div className="tdesc">{item.desc}</div>
              {item.bullets.length > 0 && (
                <ul className="tlist">
                  {item.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
              <div className="ttechs">
                {item.tags.map(tag => <span className="tt" key={tag}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
