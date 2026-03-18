export default function Projects() {
  return (
    <section id="projects">
      <canvas className="section-canvas" data-sec="projects"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">05</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">Progetti</h2>
        <div className="proj-grid">

          <div className="pcard">
            <div className="pcard-inner-glow"></div>
            <div className="pnum">// 001</div>
            <div className="ptitle">TPL Portal</div>
            <div className="psub">Ministero delle Infrastrutture e dei Trasporti</div>
            <div className="pdesc">Portale istituzionale per la gestione del Trasporto Pubblico Locale. Piattaforma centralizzata per il monitoraggio, la rendicontazione e l&apos;analisi dei servizi TPL su scala nazionale. Dashboard interattive e integrazione con i sistemi ministeriali esistenti.</div>
            <div className="ptechs"><span className="ptag">Next.js</span><span className="ptag">React</span><span className="ptag">Java</span><span className="ptag">Spring Boot</span><span className="ptag">REST API</span><span className="ptag">PostgreSQL</span></div>
            <div className="plinks">
              <span className="pnda">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:'11px',height:'11px'}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                NDA — Progetto riservato
              </span>
            </div>
          </div>

          <div className="pcard">
            <div className="pcard-inner-glow"></div>
            <div className="pnum">// 002</div>
            <div className="ptitle">PDND Gate</div>
            <div className="psub">Ministero della Giustizia</div>
            <div className="pdesc">Gateway di interoperabilità per la Piattaforma Digitale Nazionale Dati. Abilita lo scambio sicuro e tracciabile di informazioni tra enti pubblici secondo il Codice dell&apos;Amministrazione Digitale, con autenticazione OAuth2 e audit log completo.</div>
            <div className="ptechs"><span className="ptag">Java</span><span className="ptag">Spring Boot</span><span className="ptag">OAuth2</span><span className="ptag">React</span><span className="ptag">API Gateway</span><span className="ptag">PDND</span></div>
            <div className="plinks">
              <span className="pnda">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:'11px',height:'11px'}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                NDA — Progetto riservato
              </span>
            </div>
          </div>

          <div className="pcard">
            <div className="pcard-inner-glow"></div>
            <div className="pnum">// 003</div>
            <div className="ptitle">Tesi di Laurea</div>
            <div className="psub">Università degli Studi di Bari Aldo Moro</div>
            <div className="pdesc">Applicazione mobile Android sviluppata in Java. Progettazione dell&apos;architettura software, dell&apos;interazione utente e integrazione con database relazionale. Votazione finale 95/110.</div>
            <div className="ptechs"><span className="ptag">Android</span><span className="ptag">Java</span><span className="ptag">SQLite</span><span className="ptag">UX Design</span></div>
            <div className="plinks">
              <a href="https://github.com/Kxos" target="_blank" rel="noopener noreferrer" className="plink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
