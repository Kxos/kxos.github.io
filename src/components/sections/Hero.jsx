export default function Hero() {
  return (
    <section id="hero">
      <canvas id="hero-canvas"></canvas>
      <div className="blob blob-tl"></div>
      <div className="blob blob-tr"></div>
      <div className="blob blob-bl"></div>
      <div className="hero-grid"></div>
      <div className="hero-sun-glow" id="heroSunGlow"></div>
      <div className="hero-sun" id="heroSun"></div>

      <svg className="hero-mtn" viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,160 L0,100 L80,60 L160,100 L260,30 L360,90 L440,50 L520,85 L620,10 L720,75 L800,40 L900,80 L980,35 L1060,70 L1160,20 L1260,65 L1360,45 L1440,80 L1440,160 Z" fill="#07050f" opacity=".95"/>
        <path d="M0,160 L0,120 L100,90 L200,115 L320,70 L420,110 L500,80 L600,105 L700,60 L800,100 L900,75 L1000,108 L1100,65 L1200,95 L1300,72 L1440,100 L1440,160 Z" fill="rgba(255,45,120,.06)"/>
      </svg>

      <div className="container" style={{position:'relative',zIndex:5}}>
        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-tag-line"></span>
            <span className="hero-tag-dot"></span>
            Software Engineer · Bari, Italia
          </div>
          <h1 className="hero-name">
            <span className="fn">Vito</span>
            <span className="ln">Iannone</span>
          </h1>
          <p className="hero-role">
            FE Team Lead &amp; Full Stack Dev <span className="at">@</span> DXC Technology
          </p>
          <p className="hero-desc">
            Costruisco sistemi web scalabili e interfacce ad alto impatto.<br/>
            Java · Spring Boot · React · Next.js — dal backend al pixel finale.
          </p>
          <div className="hero-btns">
            <a href="#contact" className="btn btn-primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Contattami
            </a>
            <a id="cv-hero" href="Vito_Iannone_CV.pdf" download className="btn btn-secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Scarica CV
            </a>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <div className="hs-line"></div>
        <span className="hs-text">scroll</span>
      </div>
    </section>
  )
}
