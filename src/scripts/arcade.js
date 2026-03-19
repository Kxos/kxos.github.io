// ── Shared audio helper ──
function oneShot(nodes) {
  // nodes: array of {type,freq,freqEnd,dur,gain,gainEnd,start,oType}
  // simplified fire-and-forget for unlock/ui sounds
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    nodes.forEach(({ oType = 'sine', freq, freqEnd, dur, gain: gv, gainEnd, t = 0 }) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = oType; o.frequency.setValueAtTime(freq, ac.currentTime + t);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + t + dur);
      g.gain.setValueAtTime(gv, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(gainEnd || .001, ac.currentTime + t + dur);
      o.start(ac.currentTime + t); o.stop(ac.currentTime + t + dur + .01);
    });
  } catch (e) {}
}

// ── UNLOCK SEQUENCE ──
export function initArcadeUnlock() {
  const unlockBtn     = document.getElementById('arcadeUnlockBtn');
  const lockedWrap    = document.getElementById('arcadeLockedWrap');
  const unlockedWrap  = document.getElementById('arcadeUnlockedWrap');
  const unlockOverlay = document.getElementById('unlockOverlay');
  const unlockBar     = document.getElementById('unlockBar');
  const unlockText    = document.getElementById('unlockText');
  const unlockScanlines = document.getElementById('unlockScanlines');
  if (!unlockBtn) return;

  function updateNavLink(unlocked) {
    const navLink = document.getElementById('navArcadeLink');
    const mobLink = document.getElementById('mobArcadeLink');
    if (navLink && unlocked) {
      navLink.innerHTML = '<span class="nav-arcade-text">Arcade</span>';
      navLink.style.animation = 'none'; navLink.style.borderColor = 'transparent';
    }
    if (mobLink) mobLink.textContent = unlocked ? 'Arcade' : '🔒 ???';
  }

  const UNLOCKED_KEY = 'arcade_unlocked';
  if (sessionStorage.getItem(UNLOCKED_KEY)) {
    lockedWrap.style.display = 'none';
    unlockedWrap.classList.add('revealed');
    updateNavLink(true);
    return;
  }

  function playUnlock() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      // noise bursts
      for (let i = 0; i < 6; i++) {
        const buf = ac.createBuffer(1, ac.sampleRate * .08, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * .15;
        const src = ac.createBufferSource(), g = ac.createGain(), flt = ac.createBiquadFilter();
        flt.type = 'bandpass'; flt.frequency.value = 800 + i * 400; flt.Q.value = 2;
        src.buffer = buf; src.connect(flt); flt.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(.0, ac.currentTime + i * .07);
        g.gain.linearRampToValueAtTime(.18, ac.currentTime + i * .07 + .01);
        g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + i * .07 + .07);
        src.start(ac.currentTime + i * .07);
      }
      // alarm + arpeggio + bass (unchanged)
      [880,660,440,330].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination); o.type = 'square'; o.frequency.value = f;
        const t = ac.currentTime + .5 + i * .1;
        g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .12);
        o.start(t); o.stop(t + .12);
      });
      [220,277,330,440,554,659,880,1108].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination); o.type = 'sawtooth'; o.frequency.value = f;
        const t = ac.currentTime + 1.2 + i * .1;
        g.gain.setValueAtTime(.0, t); g.gain.linearRampToValueAtTime(.1, t + .04);
        g.gain.exponentialRampToValueAtTime(.001, t + .22); o.start(t); o.stop(t + .25);
      });
      const bass = ac.createOscillator(), bg = ac.createGain();
      bass.connect(bg); bg.connect(ac.destination); bass.type = 'sine';
      bass.frequency.setValueAtTime(80, ac.currentTime + 1.1);
      bass.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 1.5);
      bg.gain.setValueAtTime(.4, ac.currentTime + 1.1);
      bg.gain.exponentialRampToValueAtTime(.001, ac.currentTime + 1.6);
      bass.start(ac.currentTime + 1.1); bass.stop(ac.currentTime + 1.7);
    } catch (e) {}
  }

  const messages = ['ACCESSO NEGATO...','BYPASS IN CORSO...','FIREWALL VIOLATO','DECRITTAZIONE...','█ █ █ ACCESSO CONCESSO █ █ █'];
  unlockBtn.addEventListener('click', () => {
    unlockBtn.disabled = true;
    playUnlock();
    unlockOverlay.classList.add('active');
    unlockScanlines.classList.add('active');
    setTimeout(() => { unlockBar.style.width = '25%'; unlockText.textContent = messages[1]; }, 100);
    setTimeout(() => { unlockBar.style.width = '50%'; unlockText.textContent = messages[2]; }, 600);
    setTimeout(() => { unlockBar.style.width = '75%'; unlockText.textContent = messages[3]; }, 1100);
    setTimeout(() => { unlockBar.style.width = '100%'; unlockText.textContent = messages[4]; unlockText.style.color = 'var(--cyan)'; }, 1700);
    setTimeout(() => {
      unlockOverlay.classList.remove('active');
      lockedWrap.style.display = 'none';
      unlockedWrap.classList.add('revealed');
      updateNavLink(true);
      sessionStorage.setItem(UNLOCKED_KEY, '1');
      unlockedWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 2400);
  });
}

// ── ARCADE CABINET LOGIC ──
export function initArcadeLogic() {
  const cabinets    = document.querySelectorAll('.cabinet.active');
  const coinOverlay = document.getElementById('coinOverlay');
  const coinAnim    = document.getElementById('coinAnim');
  const coinFlash   = document.getElementById('coinFlash');
  const arcadePanel = document.getElementById('arcadePanel');
  const agpClose    = document.getElementById('agpClose');
  const agpName     = document.getElementById('agpName');

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

  function playCoin() {
    oneShot([
      { oType:'sine',     freq:1400, freqEnd:900,  dur:.25, gain:.35, t:0   },
      { oType:'triangle', freq:2200, freqEnd:1400, dur:.18, gain:.18, t:0   },
      { oType:'sine',     freq:180,  freqEnd:80,   dur:.15, gain:.20, t:.20 },
    ]);
  }
  function playBoot() {
    oneShot([440,554,659,880].map((freq, i) => ({ oType:'square', freq, freqEnd:freq*.5, dur:.18, gain:.15, t: i*.1 })));
  }
  function playEject() {
    oneShot([
      { oType:'square',   freq:180,  freqEnd:60,  dur:.08, gain:.18, t:0   },
      { oType:'sine',     freq:1800, freqEnd:600, dur:.40, gain:.22, t:.05 },
      { oType:'sawtooth', freq:440,  freqEnd:80,  dur:.30, gain:.10, t:.08 },
    ]);
  }
  function playBusy() {
    oneShot([[440,.12],[330,.18],[220,.28]].map(([freq, t]) => ({ oType:'sawtooth', freq, dur:.12, gain:.12, t })));
  }

  function showBusyToast(cab) {
    cab.querySelector('.cab-busy-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cab-busy-toast'; toast.textContent = 'GAME IN CORSO';
    cab.style.position = 'relative'; cab.appendChild(toast);
    setTimeout(() => toast.remove(), 600);
  }

  let activeGameId = null;

  // ── MOBILE FULLSCREEN HELPERS ──
  let _enteredFullscreen = false;
  function enterFullscreen(el) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (fn) { _enteredFullscreen = true; fn.call(el).catch(() => { _enteredFullscreen = false; }); }
    try { screen.orientation?.lock('landscape').catch(() => {}); } catch(e) {}
  }
  function exitFullscreen() {
    _enteredFullscreen = false;
    const fn = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (fn) fn.call(document).catch(() => {});
    try { screen.orientation?.unlock(); } catch(e) {}
  }
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
  }

  // Pause all non-game rAF loops when fullscreen game is active
  function freezePortfolio() {
    document.body.classList.add('game-fullscreen-active');
  }
  function unfreezePortfolio() {
    document.body.classList.remove('game-fullscreen-active');
  }

  function openGame(gameId, gameName) {
    activeGameId = gameId;
    coinOverlay.classList.add('active');
    setTimeout(() => { playCoin(); coinAnim.classList.add('dropping'); }, 300);
    setTimeout(() => { coinFlash.classList.add('flash'); }, 950);
    setTimeout(() => {
      coinOverlay.classList.remove('active');
      coinAnim.classList.remove('dropping');
      coinFlash.classList.remove('flash');
      agpName.textContent = gameName;
      document.querySelectorAll('.game-inner').forEach(g => g.classList.remove('active'));
      const target = document.getElementById('game' + gameId);
      if (target) target.classList.add('active');

      if (window._neonRunStop)  window._neonRunStop();
      if (window._brickStop)    window._brickStop();

      if (isMobile) {
        freezePortfolio();
        arcadePanel.classList.add('visible', 'mobile-fullscreen');
        enterFullscreen(arcadePanel);
        playBoot();
        setTimeout(() => {
          if (window._neonRunResize) window._neonRunResize();
          if (window._brickResize)   window._brickResize();
          if (gameId === 'neonrun'      && window._neonRunStart) window._neonRunStart();
          if (gameId === 'brickbreaker' && window._brickStart)   window._brickStart();
        }, 300);
      } else {
        arcadePanel.classList.add('visible');
        playBoot();
        setTimeout(() => {
          arcadePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (window._neonRunResize) window._neonRunResize();
          requestAnimationFrame(() => {
            if (window._brickResize) window._brickResize();
            if (gameId === 'neonrun'      && window._neonRunStart) window._neonRunStart();
            if (gameId === 'brickbreaker' && window._brickStart)   window._brickStart();
          });
        }, 200);
      }
    }, 1300);
  }

  let _ejecting = false;
  function closePanel() {
    if (_ejecting) return;
    _ejecting = true;

    playEject();
    if (window._neonRunStop) window._neonRunStop();
    if (window._brickStop)   window._brickStop();

    if (isMobile) {
      if (isFullscreen()) exitFullscreen();
      unfreezePortfolio();
      arcadePanel.classList.remove('visible', 'mobile-fullscreen', 'closing');
      activeGameId = null; _ejecting = false;
      document.querySelectorAll('.game-inner').forEach(g => g.classList.remove('active'));
      return;
    }

    // Desktop: curtain + coin animation
    const flash = document.getElementById('ejectFlash');
    agpClose.classList.add('ejecting');
    setTimeout(() => agpClose.classList.remove('ejecting'), 550);
    if (flash) {
      flash.classList.remove('active'); void flash.offsetWidth;
      flash.classList.add('active'); setTimeout(() => flash.classList.remove('active'), 600);
    }
    const r = agpClose.getBoundingClientRect();
    const coin = document.createElement('div');
    coin.className = 'coin-eject'; coin.textContent = '¢';
    coin.style.left = (r.left + r.width / 2 - 22) + 'px';
    coin.style.top  = (r.top  + r.height / 2 - 22) + 'px';
    document.body.appendChild(coin);
    void coin.offsetWidth; coin.classList.add('flying');
    setTimeout(() => coin.remove(), 750);

    arcadePanel.classList.add('closing');
    setTimeout(() => {
      activeGameId = null; _ejecting = false;
      arcadePanel.classList.remove('visible', 'closing');
      document.querySelectorAll('.game-inner').forEach(g => g.classList.remove('active'));
    }, 560);
  }

  // Handle hardware back button / OS fullscreen exit — solo se eravamo entrati noi nel fullscreen
  function onFullscreenChange() {
    if (!isFullscreen() && _enteredFullscreen && activeGameId) {
      _enteredFullscreen = false;
      closePanel();
    }
  }
  document.addEventListener('fullscreenchange',      onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  agpClose.addEventListener('click', closePanel);
  coinOverlay.addEventListener('click', e => { if (e.target === coinOverlay) coinOverlay.classList.remove('active'); });

  cabinets.forEach(cab => {
    cab.addEventListener('click', () => {
      const gameId   = cab.dataset.game;
      const gameName = cab.querySelector('.cab-title').textContent;

      // Se un gioco è attivo — qualsiasi cabinato — blocca e mostra errore
      if (activeGameId) {
        playBusy();
        const activeCab = document.querySelector(`.cabinet[data-game="${activeGameId}"]`) || cab;
        activeCab.classList.remove('busy'); void activeCab.offsetWidth; activeCab.classList.add('busy');
        showBusyToast(activeCab);
        setTimeout(() => activeCab.classList.remove('busy'), 600);
        return;
      }

      openGame(gameId, gameName);
    });
  });
}
