export default function Education() {
  return (
    <section id="education">
      <canvas className="section-canvas" data-sec="education"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">04</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">Formazione</h2>
        <div className="edu-grid">
          <div className="edu-card sr">
            <div className="edu-year">2019 — 2022</div>
            <div className="edu-degree">Laurea in Informatica e Tecnologie per la Produzione del Software</div>
            <div className="edu-school">Università degli Studi di Bari Aldo Moro</div>
            <div className="edu-desc">Sviluppo software in Java e Android, progettazione di basi di dati, UX design. Indirizzo TIC: sviluppo e analisi di software e applicazioni.</div>
            <div className="edu-badge">Voto: 95/110 · EQF 6</div>
          </div>
          <div className="edu-card sr">
            <div className="edu-year">2013 — 2017</div>
            <div className="edu-degree">Perito Capo Tecnico Informatico</div>
            <div className="edu-school">I.I.S.S &quot;Panetti-Pitagora&quot; · Bari</div>
            <div className="edu-desc">Diploma tecnico ad indirizzo informatico. Solide fondamenta in programmazione, reti e sistemi informatici.</div>
            <div className="edu-badge">EQF Livello 4</div>
          </div>
        </div>
      </div>
    </section>
  )
}
