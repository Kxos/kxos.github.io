export default function Skills() {
  return (
    <section id="skills">
      <canvas className="section-canvas" data-sec="skills"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">02</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">Skills &amp; Competenze</h2>
        <div className="skills-layout">
          <div className="sr-left">
            <div className="skill-group">
              <div className="skill-group-label">Backend</div>
              <div className="skill-tags"><span className="stag">Java</span><span className="stag">Spring Boot</span><span className="stag">REST API</span><span className="stag">Microservizi</span><span className="stag">PHP</span></div>
            </div>
            <div className="skill-group">
              <div className="skill-group-label">Frontend</div>
              <div className="skill-tags"><span className="stag">React</span><span className="stag">Next.js</span><span className="stag">TypeScript</span><span className="stag">JavaScript</span><span className="stag">AngularJS</span><span className="stag">HTML5</span><span className="stag">CSS3</span></div>
            </div>
            <div className="skill-group">
              <div className="skill-group-label">Database</div>
              <div className="skill-tags"><span className="stag">MySQL</span><span className="stag">SQL Server</span><span className="stag">PostgreSQL</span><span className="stag">DBMS Design</span></div>
            </div>
            <div className="skill-group">
              <div className="skill-group-label">Tools &amp; Metodologie</div>
              <div className="skill-tags"><span className="stag">GitHub</span><span className="stag">GitLab</span><span className="stag">Jira</span><span className="stag">Scrum</span><span className="stag">DevOps</span><span className="stag">Code Review</span><span className="stag">Android</span></div>
            </div>
          </div>
          <div className="sbar-wrap">
            <div className="sbar"><div className="sbar-top"><span className="sbar-name">Java / Spring Boot</span><span className="sbar-pct">90%</span></div><div className="sbar-track"><div className="sbar-fill" data-w="90"></div></div></div>
            <div className="sbar"><div className="sbar-top"><span className="sbar-name">React / Next.js</span><span className="sbar-pct">88%</span></div><div className="sbar-track"><div className="sbar-fill" data-w="88"></div></div></div>
            <div className="sbar"><div className="sbar-top"><span className="sbar-name">TypeScript / JavaScript</span><span className="sbar-pct">85%</span></div><div className="sbar-track"><div className="sbar-fill" data-w="85"></div></div></div>
            <div className="sbar"><div className="sbar-top"><span className="sbar-name">Database Design</span><span className="sbar-pct">82%</span></div><div className="sbar-track"><div className="sbar-fill" data-w="82"></div></div></div>
            <div className="sbar"><div className="sbar-top"><span className="sbar-name">Team Leadership</span><span className="sbar-pct">78%</span></div><div className="sbar-track"><div className="sbar-fill" data-w="78"></div></div></div>
            <div className="sbar"><div className="sbar-top"><span className="sbar-name">DevOps / Agile</span><span className="sbar-pct">75%</span></div><div className="sbar-track"><div className="sbar-fill" data-w="75"></div></div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
