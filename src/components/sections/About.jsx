export default function About() {
  return (
    <section id="about">
      <canvas className="section-canvas" data-sec="about"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr">
          <span className="sec-eyebrow-num">01</span>
          <span className="sec-eyebrow-line"></span>
        </div>
        <h2 className="sec-title sr">About Me</h2>

        <div className="about-wrap">
          <div className="about-body sr-left">
            <p>Ciao! Sono <strong>Vito Iannone</strong>, <span className="hl-p">Software Engineer</span> con base a <strong>Bitritto (BA)</strong>. Lavoro in <strong>DXC Technology</strong> come sviluppatore full stack e <span className="hl-c">Front-End Team Lead</span>.</p>
            <p>Ogni giorno scrivo <strong>Java / Spring Boot</strong> sul backend e <strong>React / Next.js</strong> sul frontend. Ho lavorato su progetti per istituzioni dello stato italiano — dal <strong>Ministero dei Trasporti</strong> al <strong>Ministero della Giustizia</strong>.</p>
            <p>La mia ossessione? Codice pulito, architetture scalabili e un&apos;esperienza utente che non fa rimpiangere nessuna scelta di design.</p>
            <div className="about-meta">
              <div className="about-meta-row"><span className="amr-key">Email</span><span className="amr-val"><a id="meta-email" href="#">vito.iannone90&#64;gmail.com</a></span></div>
              <div className="about-meta-row"><span className="amr-key">Location</span><span className="amr-val">Bitritto, Bari — Italia</span></div>
              <div className="about-meta-row"><span className="amr-key">Lingue</span><span className="amr-val">Italiano (nativo) · Inglese (C1)</span></div>
            </div>
          </div>

          <div className="about-cards sr">
            <div className="acard"><div className="acard-val">6+</div><div className="acard-label">Anni exp.</div><div className="acard-bg">6</div></div>
            <div className="acard"><div className="acard-val">2</div><div className="acard-label">Aziende</div><div className="acard-bg">2</div></div>
            <div className="acard"><div className="acard-val">95</div><div className="acard-label">Laurea /110</div><div className="acard-bg">95</div></div>
            <div className="acard"><div className="acard-val">∞</div><div className="acard-label">Caffè</div><div className="acard-bg">∞</div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
