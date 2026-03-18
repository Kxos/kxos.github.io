export default function Experience() {
  return (
    <section id="experience">
      <canvas className="section-canvas" data-sec="experience"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">03</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">Esperienze</h2>
        <div className="timeline">
          <div className="titem">
            <div className="tdot"></div>
            <div className="tdate">Giu 2022 — Presente</div>
            <div className="trole">Software Engineer · FE Team Lead</div>
            <div className="tcompany">DXC Technology · Bitritto (BA), Italia</div>
            <div className="tdesc">Sviluppo full stack su progetti enterprise e istituzionali. Frontend con Next.js e React, backend con Java e Spring Boot. Ruolo di Front-End Team Lead: code review, quality ownership, mentoring del team. Lavoro su commesse per il Ministero dei Trasporti e il Ministero della Giustizia.</div>
            <div className="ttechs"><span className="tt">Next.js</span><span className="tt">React</span><span className="tt">Java</span><span className="tt">Spring Boot</span><span className="tt">Jira</span><span className="tt">Scrum</span><span className="tt">GitLab</span></div>
          </div>
          <div className="titem">
            <div className="tdot"></div>
            <div className="tdate">Ott 2017 — Mar 2019</div>
            <div className="trole">Sviluppatore Software</div>
            <div className="tcompany">INFOR2000 S.R.L. · Modugno (BA), Italia</div>
            <div className="tdesc">Sviluppo di applicazioni Java e web (AngularJS, PHP). Gestione e progettazione di database relazionali su MySQL e Microsoft SQL Server.</div>
            <div className="ttechs"><span className="tt">Java</span><span className="tt">AngularJS</span><span className="tt">PHP</span><span className="tt">MySQL</span><span className="tt">SQL Server</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
