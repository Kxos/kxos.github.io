import { useLang } from '../../i18n/LangContext'

export default function About() {
  const { t } = useLang()
  const a = t.about
  return (
    <section id="about">
      <canvas className="section-canvas" data-sec="about"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr">
          <span className="sec-eyebrow-num">01</span>
          <span className="sec-eyebrow-line"></span>
        </div>
        <h2 className="sec-title sr">{a.title}</h2>

        <div className="about-wrap">
          <div className="about-body sr-left">
            {a.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            <div className="about-meta">
              {a.meta.map((row, i) => (
                <div className="about-meta-row" key={i}>
                  <span className="amr-key">{row.key}</span>
                  <span className="amr-val">
                    {row.email ? <a id="meta-email" href="#">vito.iannone90&#64;gmail.com</a> : row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-cards sr">
            {a.cards.map((c, i) => (
              <div className="acard" key={i}>
                <div className="acard-val">{c.val}</div>
                <div className="acard-label">{c.label}</div>
                <div className="acard-bg">{c.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
