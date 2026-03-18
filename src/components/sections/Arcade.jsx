export default function Arcade() {
  return (
    <>
      <section id="game">
        <div className="container">

          {/* LOCKED STATE */}
          <div className="arcade-locked-wrap" id="arcadeLockedWrap">
            <div className="arcade-lock-scene sr">
              <div className="arcade-lock-eyebrow">
                <span className="sec-eyebrow-num">07</span>
                <span className="sec-eyebrow-line"></span>
              </div>
              <h2 className="arcade-lock-title">
                <span className="alt-text">// </span>ARCADE<span className="alt-text">?</span>
              </h2>
              <p className="arcade-lock-hint">Qualcosa si nasconde qui.<br/>Sei sicuro di voler scoprire cosa?</p>
              <button className="arcade-unlock-btn" id="arcadeUnlockBtn">
                <div className="aub-lock">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="aub-lock-icon" id="lockIcon">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path className="lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <div className="aub-chain">
                    <div className="chain-link"></div>
                    <div className="chain-link"></div>
                    <div className="chain-link"></div>
                  </div>
                </div>
                <span className="aub-label">SBLOCCA</span>
              </button>
              <p className="arcade-lock-warning">⚠ accesso non autorizzato potrebbe avere conseguenze</p>
            </div>
          </div>

          {/* UNLOCKED STATE */}
          <div className="arcade-unlocked-wrap" id="arcadeUnlockedWrap">
            <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">07</span><span className="sec-eyebrow-line"></span></div>
            <h2 className="sec-title sr">Arcade</h2>
            <p className="arcade-sub sr">Seleziona un cabinato, inserisci il gettone e gioca.</p>

            <div className="arcade-row sr">

              {/* CABINET 1: NEON RUN */}
              <div className="cabinet active" data-game="neonrun">
                <div className="cab-body">
                  <div className="cab-marquee"><span>NEON</span><span className="cab-marquee-accent">RUN</span></div>
                  <div className="cab-screen-bezel">
                    <div className="cab-screen">
                      <div className="cab-screen-content">
                        <div className="cab-preview-grid"></div>
                        <div className="cab-preview-sun"></div>
                        <div className="cab-preview-dino">
                          <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="8" width="20" height="22" fill="#00f5ff"/>
                            <rect x="6" y="0" width="20" height="14" fill="#00f5ff"/>
                            <rect x="24" y="3" width="5" height="5" fill="#04020e"/>
                            <rect x="26" y="11" width="5" height="2" fill="#00f5ff"/>
                            <rect x="-7" y="22" width="9" height="7" fill="#00f5ff"/>
                            <rect x="4" y="30" width="3" height="8" fill="#00f5ff"/>
                            <rect x="13" y="30" width="3" height="8" fill="#00f5ff"/>
                          </svg>
                        </div>
                        <div className="cab-screen-scanlines"></div>
                        <div className="cab-crt-glow"></div>
                      </div>
                    </div>
                  </div>
                  <div className="cab-info">
                    <div className="cab-title">NEON RUN</div>
                    <div className="cab-genre">ENDLESS RUNNER</div>
                  </div>
                  <div className="cab-controls">
                    <div className="cab-joystick"><div className="cab-stick"></div></div>
                    <div className="cab-buttons">
                      <div className="cab-btn cb-pink"></div>
                      <div className="cab-btn cb-cyan"></div>
                    </div>
                  </div>
                  <div className="cab-coin-slot">
                    <div className="cab-coin-label">INSERT COIN</div>
                    <div className="cab-slot"></div>
                  </div>
                  <div className="cab-legs"><div className="cab-leg"></div><div className="cab-leg"></div></div>
                </div>
                <div className="cab-glow-floor"></div>
              </div>

              {/* CABINET 2: BRICK BREAKER */}
              <div className="cabinet active" data-game="brickbreaker">
                <div className="cab-body">
                  <div className="cab-marquee"><span>BRICK</span><span className="cab-marquee-accent">WAVE</span></div>
                  <div className="cab-screen-bezel">
                    <div className="cab-screen">
                      <div className="cab-screen-content">
                        <canvas className="cab-preview-canvas" id="bb-preview-canvas"></canvas>
                        <div className="cab-screen-scanlines"></div>
                        <div className="cab-crt-glow"></div>
                      </div>
                    </div>
                  </div>
                  <div className="cab-info">
                    <div className="cab-title">BRICK WAVE</div>
                    <div className="cab-genre">BREAKOUT</div>
                  </div>
                  <div className="cab-controls">
                    <div className="cab-joystick"><div className="cab-stick"></div></div>
                    <div className="cab-buttons">
                      <div className="cab-btn cb-violet"></div>
                      <div className="cab-btn cb-gold"></div>
                    </div>
                  </div>
                  <div className="cab-coin-slot">
                    <div className="cab-coin-label">INSERT COIN</div>
                    <div className="cab-slot"></div>
                  </div>
                  <div className="cab-legs"><div className="cab-leg"></div><div className="cab-leg"></div></div>
                </div>
                <div className="cab-glow-floor"></div>
              </div>

              {/* CABINET 3: COMING SOON */}
              <div className="cabinet locked" data-game="future2">
                <div className="cab-body">
                  <div className="cab-marquee locked-mq"><span>???</span></div>
                  <div className="cab-screen-bezel">
                    <div className="cab-screen locked-screen">
                      <div className="cab-screen-content">
                        <div className="cab-locked-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                        <div className="cab-locked-text">COMING<br/>SOON</div>
                        <div className="cab-screen-scanlines"></div>
                      </div>
                    </div>
                  </div>
                  <div className="cab-info">
                    <div className="cab-title" style={{color:'var(--muted)'}}>CLASSIFIED</div>
                    <div className="cab-genre" style={{color:'var(--muted)'}}>??? GAME</div>
                  </div>
                  <div className="cab-controls">
                    <div className="cab-joystick locked-js"><div className="cab-stick"></div></div>
                    <div className="cab-buttons">
                      <div className="cab-btn" style={{background:'var(--muted)',opacity:.4}}></div>
                      <div className="cab-btn" style={{background:'var(--muted)',opacity:.4}}></div>
                    </div>
                  </div>
                  <div className="cab-coin-slot">
                    <div className="cab-coin-label" style={{color:'var(--muted)'}}>LOCKED</div>
                    <div className="cab-slot" style={{borderColor:'var(--muted)'}}></div>
                  </div>
                  <div className="cab-legs"><div className="cab-leg"></div><div className="cab-leg"></div></div>
                </div>
                <div className="cab-glow-floor" style={{background:'radial-gradient(ellipse 80% 18px at 50% 100%,rgba(100,100,120,.15),transparent)'}}></div>
              </div>

            </div>{/* /arcade-row */}

            {/* COIN OVERLAY */}
            <div className="coin-overlay" id="coinOverlay">
              <div className="coin-scene">
                <div className="coin-slot-visual">
                  <div className="coin-slot-label">INSERT COIN</div>
                  <div className="coin-slot-opening"></div>
                </div>
                <div className="coin-anim" id="coinAnim"><div className="coin-disc"><span>¢</span></div></div>
                <div className="coin-flash" id="coinFlash"></div>
              </div>
            </div>

            {/* GAME PANEL */}
            <div className="arcade-game-panel" id="arcadePanel">
              <div className="curtain-left" id="curtainLeft"></div>
              <div className="curtain-right" id="curtainRight"></div>
              <div className="agp-header">
                <div className="agp-title-wrap">
                  <span className="agp-game-name" id="agpName">NEON RUN</span>
                  <span className="agp-credits">CREDIT 01</span>
                </div>
                <button className="agp-close" id="agpClose">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  EJECT
                </button>
              </div>
              <div className="game-inner" id="gameneonrun">
                <div className="game-header">
                  <div className="game-title-wrap">
                    <span className="game-label">Press <kbd style={{border:'1px solid var(--border2)',padding:'.1rem .4rem',fontFamily:'var(--fm)',fontSize:'.55rem',color:'var(--cyan)'}}>SPACE</kbd> or tap to start</span>
                  </div>
                  <div className="game-score-wrap">
                    <span className="game-score-label">Score</span>
                    <span className="game-score-val" id="score-display">00000</span>
                  </div>
                </div>
                <div className="game-canvas-wrap">
                  <canvas id="dino-canvas"></canvas>
                  <div className="game-msg" id="game-start-msg">
                    <span>⬡ NEON_RUN ⬡</span>
                    <span className="gm-key">SPACE / TAP per iniziare</span>
                  </div>
                  <div className="game-over-msg" id="game-over-msg">
                    <span>GAME OVER</span>
                    <span className="game-over-sub">Press SPACE / TAP to retry</span>
                  </div>
                </div>
                <div className="game-hint">
                  <span><kbd>Space</kbd> Salta</span>
                  <span><kbd>↓</kbd> Abbassati</span>
                  <span><kbd>Tap</kbd> Mobile</span>
                </div>
                <div className="game-mobile-btns">
                  <button className="gmb duck-btn" id="btn-duck">▼ Abbassati</button>
                  <button className="gmb jump-btn" id="btn-jump">▲ Salta</button>
                </div>
              </div>

              {/* BRICK BREAKER */}
              <div className="game-inner" id="gamebrickbreaker">
                <div className="game-header">
                  <div className="game-title-wrap">
                    <span className="game-label">Muovi il mouse / <kbd style={{border:'1px solid var(--border2)',padding:'.1rem .4rem',fontFamily:'var(--fm)',fontSize:'.55rem',color:'var(--violet)'}}>←→</kbd> per giocare</span>
                  </div>
                  <div className="game-score-wrap">
                    <span className="game-score-label">Score</span>
                    <span className="game-score-val" id="bb-score-display">00000</span>
                  </div>
                </div>
                <div className="game-canvas-wrap">
                  <canvas id="bb-canvas"></canvas>
                  <div className="game-msg" id="bb-start-msg">
                    <span>⬡ BRICK_WAVE ⬡</span>
                    <span className="gm-key">SPACE / TAP per iniziare</span>
                  </div>
                  <div className="game-over-msg" id="bb-over-msg">
                    <span>GAME OVER</span>
                    <span className="game-over-sub">Press SPACE / TAP to retry</span>
                  </div>
                  <div className="game-over-msg" id="bb-win-msg" style={{background:'rgba(0,245,255,.08)',borderColor:'var(--cyan)'}}>
                    <span style={{color:'var(--cyan)'}}>YOU WIN!</span>
                    <span className="game-over-sub">Press SPACE / TAP per livello successivo</span>
                  </div>
                </div>
                <div className="game-hint">
                  <span><kbd>←→</kbd> Muovi</span>
                  <span><kbd>Mouse</kbd> Paddle</span>
                  <span><kbd>Tap</kbd> Mobile</span>
                </div>
                <div className="game-mobile-btns">
                  <button className="gmb duck-btn" id="bb-btn-left">◀ Sinistra</button>
                  <button className="gmb jump-btn" id="bb-btn-right">Destra ▶</button>
                </div>
              </div>
            </div>

          </div>{/* /arcade-unlocked-wrap */}
        </div>
      </section>

      {/* UNLOCK OVERLAY — fuori dalla section, nel body */}
      <div className="unlock-overlay" id="unlockOverlay">
        <div className="unlock-scanline-burst" id="unlockScanlines"></div>
        <div className="unlock-text" id="unlockText">ACCESSO NEGATO...</div>
        <div className="unlock-bar-wrap"><div className="unlock-bar" id="unlockBar"></div></div>
      </div>

      {/* EJECT FX */}
      <div className="eject-flash" id="ejectFlash"></div>
    </>
  )
}
