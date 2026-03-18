/* ═══════════════════════════════════
   HERO INTERACTIVE CANVAS
═══════════════════════════════════ */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');
  const sunEl = document.getElementById('heroSun');
  const sunGlowEl = document.getElementById('heroSunGlow');

  let W, H, mx=0, my=0, rmx=0, rmy=0; // raw and relative mouse
  let frame = 0;

  function resize(){
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  // track mouse only inside hero
  hero.addEventListener('mousemove', e=>{
    const r = hero.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
    rmx = (mx / W) * 2 - 1; // -1..1
    rmy = (my / H) * 2 - 1;
  }, {passive:true});
  hero.addEventListener('mouseleave', ()=>{ rmx=0; rmy=0; });

  // ── STARS ──
  const STAR_COUNT = 120;
  const stars = Array.from({length: STAR_COUNT}, ()=>({
    x: Math.random(), y: Math.random() * .6,
    r: Math.random() * 1.4 + .3,
    blink: Math.random() * Math.PI * 2,
    speed: Math.random() * .0003 + .0001,
    ox: 0, oy: 0,
    vx: 0, vy: 0,
  }));

  // ── PARTICLES ──
  const particles = [];
  function spawnParticle(px, py){
    const angle = Math.random() * Math.PI * 2;
    const spd   = Math.random() * 1.2 + .3;
    particles.push({
      x: px, y: py,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - .8,
      life: 1,
      decay: .012 + Math.random() * .018,
      r: Math.random() * 2.5 + 1,
      hue: Math.random() < .5 ? 'pink' : 'cyan',
    });
  }
  let lastSpawn = 0;
  hero.addEventListener('mousemove', e=>{
    if(Date.now() - lastSpawn < 40) return;
    lastSpawn = Date.now();
    const r = hero.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    for(let i=0; i<3; i++) spawnParticle(px, py);
  }, {passive:true});

  // ── RIPPLES ──
  const ripples = [];
  hero.addEventListener('click', e=>{
    const r = hero.getBoundingClientRect();
    ripples.push({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      radius: 0,
      maxR: 180,
      life: 1,
      color: Math.random() < .5 ? '255,45,120' : '0,245,255',
    });
  });

  // ── DRAW ──
  function draw(){
    ctx.clearRect(0,0,W,H);
    frame++;

    // ── stars with mouse pull ──
    const ATTRACT_RADIUS = 120; // px — solo stelle entro questo raggio vengono attirate
    const MAX_DRIFT = 140;
    stars.forEach(s=>{
      const sx = s.x * W, sy = s.y * H;

      // distanza del cursore dalla posizione ORIGINALE della stella
      const odx = mx - sx, ody = my - sy;
      const originDist = Math.sqrt(odx*odx + ody*ody);

      // distanza offset corrente dall'origine
      const driftDist = Math.sqrt(s.ox*s.ox + s.oy*s.oy);

      if(originDist < ATTRACT_RADIUS && driftDist < MAX_DRIFT){
        // attrai lentamente verso il cursore
        const tdx = mx - (sx + s.ox);
        const tdy = my - (sy + s.oy);
        s.vx += tdx * .0014;
        s.vy += tdy * .0014;
        s.vx *= .92;
        s.vy *= .92;
      } else {
        // fuori raggio o troppo spostata — ritorna molto lentamente all'origine
        s.vx = s.vx * .96 - s.ox * .004;
        s.vy = s.vy * .96 - s.oy * .004;
      }

      s.ox += s.vx;
      s.oy += s.vy;

      const px = sx + s.ox;
      const py = sy + s.oy;
      const b  = .5 + .5 * Math.sin(s.blink + frame * s.speed * 60);
      const cursorDist = Math.sqrt((px-mx)**2 + (py-my)**2);
      const nearGlow   = Math.max(0, 1 - cursorDist / 60);

      ctx.beginPath();
      ctx.arc(px, py, s.r * (1 + nearGlow * .8), 0, Math.PI * 2);
      ctx.fillStyle = nearGlow > .15
        ? `rgba(0,245,255,${.5 + nearGlow * .4})`
        : `rgba(240,236,255,${.15 + .55 * b})`;
      ctx.shadowColor = nearGlow > .15 ? '#00f5ff' : 'white';
      ctx.shadowBlur  = nearGlow > .15 ? 10 * nearGlow : 5 * b;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // ── mouse aurora — radial glow that follows cursor ──
    if(mx > 0 || my > 0){
      const auraGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
      const hue = Math.sin(frame*.008) > 0 ? '255,45,120' : '76,201,240';
      auraGrad.addColorStop(0,   `rgba(${hue},.07)`);
      auraGrad.addColorStop(.4,  `rgba(${hue},.03)`);
      auraGrad.addColorStop(1,   'transparent');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // ── particles ──
    for(let i = particles.length-1; i >= 0; i--){
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += .04; // gravity
      p.life -= p.decay;
      if(p.life <= 0){ particles.splice(i,1); continue; }

      const color = p.hue === 'pink' ? '255,45,120' : '0,245,255';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, Math.PI*2);
      ctx.fillStyle = `rgba(${color},${p.life * .8})`;
      ctx.shadowColor = `rgb(${color})`;
      ctx.shadowBlur  = 6 * p.life;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ── ripples ──
    for(let i = ripples.length-1; i >= 0; i--){
      const rp = ripples[i];
      rp.radius += (rp.maxR - rp.radius) * .06 + .8;
      rp.life   -= .025;
      if(rp.life <= 0){ ripples.splice(i,1); continue; }

      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(${rp.color},${rp.life * .6})`;
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = `rgb(${rp.color})`;
      ctx.shadowBlur  = 12 * rp.life;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // inner ring
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius * .55, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(${rp.color},${rp.life * .3})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    // ── sun: posizione fissa, no parallax ──
    if(sunEl && sunGlowEl){
      sunEl.style.transform     = `translateX(-50%)`;
      sunGlowEl.style.transform = `translateX(-50%)`;
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════
   ARCADE UNLOCK SEQUENCE
═══════════════════════════════════ */
(function(){
  const unlockBtn      = document.getElementById('arcadeUnlockBtn');
  const lockedWrap     = document.getElementById('arcadeLockedWrap');
  const unlockedWrap   = document.getElementById('arcadeUnlockedWrap');
  const unlockOverlay  = document.getElementById('unlockOverlay');
  const unlockBar      = document.getElementById('unlockBar');
  const unlockText     = document.getElementById('unlockText');
  const unlockScanlines= document.getElementById('unlockScanlines');
  const navArcadeLink  = document.getElementById('navArcadeLink');
  const mobArcadeLink  = document.getElementById('mobArcadeLink');
  if(!unlockBtn) return;

  // persist unlock state
  const UNLOCKED_KEY = 'arcade_unlocked';
  if(sessionStorage.getItem(UNLOCKED_KEY)){
    lockedWrap.style.display = 'none';
    unlockedWrap.classList.add('revealed');
    updateNavLink(true);
    return;
  }

  function updateNavLink(unlocked){
    if(navArcadeLink){
      if(unlocked){
        navArcadeLink.innerHTML = '<span class="nav-arcade-text">Arcade</span>';
        navArcadeLink.style.animation = 'none';
        navArcadeLink.style.borderColor = 'transparent';
      }
    }
    if(mobArcadeLink){
      mobArcadeLink.textContent = unlocked ? 'Arcade' : '🔒 ???';
    }
  }

  // ── SYNTHWAVE UNLOCK SOUNDS ──
  function playUnlockSequence(){
    try{
      const ctx = new(window.AudioContext||window.webkitAudioContext)();

      // phase 1: glitchy noise bursts (0–0.4s)
      for(let i=0;i<6;i++){
        const buf = ctx.createBuffer(1, ctx.sampleRate*.08, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*.15;
        const src = ctx.createBufferSource();
        const g = ctx.createGain(), flt = ctx.createBiquadFilter();
        flt.type='bandpass'; flt.frequency.value=800+i*400; flt.Q.value=2;
        src.buffer=buf; src.connect(flt); flt.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(.0, ctx.currentTime+i*.07);
        g.gain.linearRampToValueAtTime(.18, ctx.currentTime+i*.07+.01);
        g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+i*.07+.07);
        src.start(ctx.currentTime+i*.07);
      }

      // phase 2: descending alarm (0.5–0.9s)
      [880,660,440,330].forEach((f,i)=>{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='square'; o.frequency.value=f;
        const t=ctx.currentTime+.5+i*.1;
        g.gain.setValueAtTime(.12,t);
        g.gain.exponentialRampToValueAtTime(.001,t+.12);
        o.start(t); o.stop(t+.12);
      });

      // phase 3: rising synthwave arpeggio (1.2–2.0s) — access granted
      [220,277,330,440,554,659,880,1108].forEach((f,i)=>{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='sawtooth'; o.frequency.value=f;
        const t=ctx.currentTime+1.2+i*.1;
        g.gain.setValueAtTime(.0,t);
        g.gain.linearRampToValueAtTime(.1,t+.04);
        g.gain.exponentialRampToValueAtTime(.001,t+.22);
        o.start(t); o.stop(t+.25);
      });

      // phase 4: deep bass thump (1.1s)
      const bass=ctx.createOscillator(), bg=ctx.createGain();
      bass.connect(bg); bg.connect(ctx.destination);
      bass.type='sine'; bass.frequency.setValueAtTime(80,ctx.currentTime+1.1);
      bass.frequency.exponentialRampToValueAtTime(40,ctx.currentTime+1.5);
      bg.gain.setValueAtTime(.4,ctx.currentTime+1.1);
      bg.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.6);
      bass.start(ctx.currentTime+1.1); bass.stop(ctx.currentTime+1.7);

    }catch(e){}
  }

  const messages = [
    'ACCESSO NEGATO...',
    'BYPASS IN CORSO...',
    'FIREWALL VIOLATO',
    'DECRITTAZIONE...',
    '█ █ █ ACCESSO CONCESSO █ █ █',
  ];

  unlockBtn.addEventListener('click', ()=>{
    unlockBtn.disabled = true;
    playUnlockSequence();

    unlockOverlay.classList.add('active');
    unlockScanlines.classList.add('active');

    // animate progress bar and text messages
    setTimeout(()=>{ unlockBar.style.width='25%'; unlockText.textContent=messages[1]; }, 100);
    setTimeout(()=>{ unlockBar.style.width='50%'; unlockText.textContent=messages[2]; }, 600);
    setTimeout(()=>{ unlockBar.style.width='75%'; unlockText.textContent=messages[3]; }, 1100);
    setTimeout(()=>{ unlockBar.style.width='100%'; unlockText.textContent=messages[4];
      unlockText.style.color='var(--cyan)';
    }, 1700);

    // reveal arcade
    setTimeout(()=>{
      unlockOverlay.classList.remove('active');
      lockedWrap.style.display = 'none';
      unlockedWrap.classList.add('revealed');
      updateNavLink(true);
      sessionStorage.setItem(UNLOCKED_KEY, '1');
      unlockedWrap.scrollIntoView({behavior:'smooth', block:'start'});
    }, 2400);
  });
})();

/* ═══════════════════════════════════
   EMAIL (assembled at runtime)
═══════════════════════════════════ */
(function(){
  const m='mailto:'+['vito.iannone90','gmail.com'].join('@');
  ['contact-email','social-email','meta-email'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.href=m;
  });
})();

/* ═══════════════════════════════════
   CURSOR (desktop only)
═══════════════════════════════════ */
if(window.matchMedia('(pointer:fine)').matches){
  const curEl=document.getElementById('cursor');
  const curRing=document.getElementById('cur-ring');
  let mx=0,my=0,rx=0,ry=0;
  window.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    curEl.style.transform=`translate(${mx}px,${my}px)`;
  });
  (function animCur(){
    rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
    curRing.style.left=rx+'px'; curRing.style.top=ry+'px';
    requestAnimationFrame(animCur);
  })();
}

/* ═══════════════════════════════════
   NAV
═══════════════════════════════════ */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>60),{passive:true});

// Hamburger
const hamburger=document.getElementById('hamburger');
const mobOverlay=document.getElementById('mob-overlay');
hamburger.addEventListener('click',()=>{
  hamburger.classList.toggle('open');
  mobOverlay.classList.toggle('open');
});
mobOverlay.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click',()=>{
    hamburger.classList.remove('open');
    mobOverlay.classList.remove('open');
  });
});

/* ═══════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════ */
const srObs=new IntersectionObserver((entries)=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('in'),i*80);
      srObs.unobserve(e.target);
    }
  });
},{threshold:0.1});
document.querySelectorAll('.sr,.sr-left,.titem,.pcard,.sbar').forEach(el=>srObs.observe(el));

/* ═══════════════════════════════════
   SKILL BARS
═══════════════════════════════════ */
const barObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const f=e.target.querySelector('.sbar-fill');
      if(f){ setTimeout(()=>{ f.style.width=f.dataset.w+'%'; setTimeout(()=>f.classList.add('done'),1400); },250); }
      barObs.unobserve(e.target);
    }
  });
},{threshold:0.5});
document.querySelectorAll('.sbar').forEach(el=>barObs.observe(el));

/* ═══════════════════════════════════
   PARALLAX BLOBS (desktop only)
═══════════════════════════════════ */
if(window.matchMedia('(pointer:fine)').matches){
  window.addEventListener('mousemove',e=>{
    const blobs=document.querySelectorAll('.blob');
    const dx=(e.clientX/innerWidth-.5);
    const dy=(e.clientY/innerHeight-.5);
    blobs.forEach((b,i)=>{ const f=(i+1)*10; b.style.transform=`translate(${dx*f}px,${dy*f}px)`; });
  },{passive:true});
}

/* ═══════════════════════════════════
   HERO NAME SPOTLIGHT
   Tracks mouse position over each word
   and paints a radial colour spotlight
   only around the cursor
═══════════════════════════════════ */
(function(){
  const fn = document.querySelector('.hero-name .fn');
  const ln = document.querySelector('.hero-name .ln');
  if(!fn || !ln) return;

  // spotlight radius in px (relative to element width)
  const R = 120;

  function applySpotlight(el, e, colors){
    const rect = el.getBoundingClientRect();
    // position of mouse relative to element (0→1)
    const px = (e.clientX - rect.left) / rect.width * 100;
    const py = (e.clientY - rect.top)  / rect.height * 100;
    el.style.backgroundImage =
      `radial-gradient(circle ${R}px at ${px}% ${py}%, ${colors.hot} 0%, ${colors.mid} 40%, ${colors.cold} 100%)`;
  }

  function clearSpotlight(el, fallback){
    el.style.backgroundImage = fallback;
  }

  // --- .fn (Vito) ---
  fn.addEventListener('mousemove', e => {
    applySpotlight(fn, e, {
      hot:  '#00f5ff',   // cyan at cursor
      mid:  '#b44fff',   // violet fading out
      cold: 'var(--text)',
    });
  });
  fn.addEventListener('mouseleave', () => {
    clearSpotlight(fn, 'linear-gradient(90deg, var(--text) 0%, var(--text) 100%)');
  });

  // --- .ln (Iannone) ---
  ln.addEventListener('mousemove', e => {
    const rect = ln.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * 100;
    const py = (e.clientY - rect.top)  / rect.height * 100;
    // overlay a tight white-cyan radial spotlight ON TOP of the original gradient
    ln.style.backgroundImage =
      `radial-gradient(circle ${R}px at ${px}% ${py}%, rgba(255,255,255,.95) 0%, rgba(0,245,255,.4) 30%, transparent 65%),
       linear-gradient(90deg, var(--pink) 0%, var(--violet) 50%, var(--cyan) 100%)`;
  });
  ln.addEventListener('mouseleave', () => {
    clearSpotlight(ln, 'linear-gradient(90deg, var(--pink) 0%, var(--violet) 50%, var(--cyan) 100%)');
  });
})();

/* ═══════════════════════════════════
   ARCADE LOGIC
═══════════════════════════════════ */
(function(){
  const cabinets   = document.querySelectorAll('.cabinet.active');
  const coinOverlay= document.getElementById('coinOverlay');
  const coinAnim   = document.getElementById('coinAnim');
  const coinFlash  = document.getElementById('coinFlash');
  const arcadePanel= document.getElementById('arcadePanel');
  const agpClose   = document.getElementById('agpClose');
  const agpName    = document.getElementById('agpName');

  // ── Web Audio coin sound ──
  function playCoinSound(){
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();

      // metallic ping
      const osc1=ctx.createOscillator();
      const gain1=ctx.createGain();
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.type='sine'; osc1.frequency.setValueAtTime(1400,ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+.18);
      gain1.gain.setValueAtTime(.35,ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.25);
      osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime+.25);

      // higher overtone
      const osc2=ctx.createOscillator();
      const gain2=ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.type='triangle'; osc2.frequency.setValueAtTime(2200,ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1400,ctx.currentTime+.12);
      gain2.gain.setValueAtTime(.18,ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);
      osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime+.18);

      // soft thud when it lands
      const osc3=ctx.createOscillator();
      const gain3=ctx.createGain();
      osc3.connect(gain3); gain3.connect(ctx.destination);
      osc3.type='sine'; osc3.frequency.setValueAtTime(180,ctx.currentTime+.2);
      osc3.frequency.exponentialRampToValueAtTime(80,ctx.currentTime+.35);
      gain3.gain.setValueAtTime(.2,ctx.currentTime+.2);
      gain3.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.38);
      osc3.start(ctx.currentTime+.2); osc3.stop(ctx.currentTime+.38);
    }catch(e){}
  }

  // ── Boot-up chime when game panel opens ──
  function playBootSound(){
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const notes=[440,554,659,880];
      notes.forEach((freq,i)=>{
        const osc=ctx.createOscillator();
        const g=ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type='square'; osc.frequency.value=freq;
        const t=ctx.currentTime+i*.1;
        g.gain.setValueAtTime(.0,t);
        g.gain.linearRampToValueAtTime(.15,t+.04);
        g.gain.exponentialRampToValueAtTime(.001,t+.18);
        osc.start(t); osc.stop(t+.2);
      });
    }catch(e){}
  }

  function openGame(gameId, gameName){
    activeGameId = gameId;
    // show overlay
    coinOverlay.classList.add('active');

    // drop coin after brief delay
    setTimeout(()=>{
      playCoinSound();
      coinAnim.classList.add('dropping');
    }, 300);

    // flash on landing
    setTimeout(()=>{
      coinFlash.classList.add('flash');
    }, 950);

    // hide overlay, reveal panel
    setTimeout(()=>{
      coinOverlay.classList.remove('active');
      coinAnim.classList.remove('dropping');
      coinFlash.classList.remove('flash');

      // set panel title
      agpName.textContent = gameName;

      // activate correct game inner FIRST (so canvas has CSS display before resize)
      document.querySelectorAll('.game-inner').forEach(g=>g.classList.remove('active'));
      const target = document.getElementById('game' + gameId);
      if(target) target.classList.add('active');

      // avvia (o riavvia) il loop del gioco
      if(window._neonRunStop)  window._neonRunStop();
      if(window._brickStop)    window._brickStop();

      if(gameId === 'neonrun' && window._neonRunStart) window._neonRunStart();
      if(gameId === 'brickbreaker' && window._brickStart) window._brickStart();

      // show panel
      arcadePanel.classList.add('visible');
      playBootSound();

      // scroll and resize after browser has painted
      setTimeout(()=>{
        arcadePanel.scrollIntoView({behavior:'smooth', block:'start'});
        if(window._neonRunResize) window._neonRunResize();
        // brick needs a second rAF after scroll to get real dimensions
        requestAnimationFrame(()=>{
          if(window._brickResize) window._brickResize();
        });
      }, 200);

    }, 1300);
  }

  // ── EJECT SOUND ──
  function playEjectSound(){
    try{
      const ctx = new(window.AudioContext||window.webkitAudioContext)();

      // rising mechanical click
      const o1=ctx.createOscillator(), g1=ctx.createGain();
      o1.connect(g1); g1.connect(ctx.destination);
      o1.type='square';
      o1.frequency.setValueAtTime(180, ctx.currentTime);
      o1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime+.05);
      g1.gain.setValueAtTime(.18, ctx.currentTime);
      g1.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+.08);
      o1.start(); o1.stop(ctx.currentTime+.09);

      // coin spin shimmer — metallic ring
      const o2=ctx.createOscillator(), g2=ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.type='sine';
      o2.frequency.setValueAtTime(1800, ctx.currentTime+.05);
      o2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime+.4);
      g2.gain.setValueAtTime(.22, ctx.currentTime+.05);
      g2.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+.45);
      o2.start(ctx.currentTime+.05); o2.stop(ctx.currentTime+.46);

      // descending whoosh — panel closing
      const o3=ctx.createOscillator(), g3=ctx.createGain();
      o3.connect(g3); g3.connect(ctx.destination);
      o3.type='sawtooth';
      o3.frequency.setValueAtTime(440, ctx.currentTime+.08);
      o3.frequency.exponentialRampToValueAtTime(80, ctx.currentTime+.35);
      g3.gain.setValueAtTime(.1, ctx.currentTime+.08);
      g3.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+.38);
      o3.start(ctx.currentTime+.08); o3.stop(ctx.currentTime+.39);
    }catch(e){}
  }

  let _ejecting = false;
  function closePanel(){
    if(_ejecting) return;          // guard — ignora click multipli
    _ejecting = true;

    const btn     = document.getElementById('agpClose');
    const flash   = document.getElementById('ejectFlash');

    // button sweep animation
    if(btn){
      btn.classList.add('ejecting');
      setTimeout(()=>btn.classList.remove('ejecting'), 550);
    }

    // flash overlay
    if(flash){
      flash.classList.remove('active');
      void flash.offsetWidth;
      flash.classList.add('active');
      setTimeout(()=>flash.classList.remove('active'), 600);
    }

    // flying coin from button position
    if(btn){
      const r   = btn.getBoundingClientRect();
      const coin= document.createElement('div');
      coin.className = 'coin-eject';
      coin.textContent = '¢';
      coin.style.left = (r.left + r.width/2 - 22) + 'px';
      coin.style.top  = (r.top  + r.height/2 - 22) + 'px';
      document.body.appendChild(coin);
      void coin.offsetWidth;
      coin.classList.add('flying');
      setTimeout(()=>coin.remove(), 750);
    }

    playEjectSound();

    // ferma subito il loop del gioco
    if(window._neonRunStop) window._neonRunStop();
    if(window._brickStop)   window._brickStop();

    // tenda synthwave: le due ante scorrono verso il centro (.52s),
    // poi chiudiamo davvero il pannello e resettiamo le tende
    arcadePanel.classList.add('closing');
    setTimeout(()=>{
      activeGameId = null;
      _ejecting = false;           // guard reset — ora si può riaprire
      arcadePanel.classList.remove('visible');
      arcadePanel.classList.remove('closing');
      document.querySelectorAll('.game-inner').forEach(g=>g.classList.remove('active'));
    }, 560);
  }

  // close button
  agpClose.addEventListener('click', closePanel);
  function playBusySound(){
    try{
      const ctx = new(window.AudioContext||window.webkitAudioContext)();
      // descending buzz — "no entry"
      [[440,.12],[330,.18],[220,.28]].forEach(([freq,t])=>{
        const osc=ctx.createOscillator(), g=ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type='sawtooth'; osc.frequency.value=freq;
        g.gain.setValueAtTime(.12, ctx.currentTime+t);
        g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+t+.12);
        osc.start(ctx.currentTime+t); osc.stop(ctx.currentTime+t+.15);
      });
    }catch(e){}
  }

  function showBusyToast(cab){
    // remove any existing toast first
    cab.querySelector('.cab-busy-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cab-busy-toast';
    toast.textContent = 'GAME IN CORSO';
    cab.style.position = 'relative';
    cab.appendChild(toast);
    setTimeout(()=>toast.remove(), 600);
  }

  // track which gameId is currently active
  let activeGameId = null;

  // cabinet clicks
  cabinets.forEach(cab=>{
    cab.addEventListener('click',()=>{
      const gameId   = cab.dataset.game;
      const gameName = cab.querySelector('.cab-title').textContent;

      // if this cabinet's game is already running — reject
      if(activeGameId === gameId){
        playBusySound();
        // trigger shake animation (remove+re-add to restart it)
        cab.classList.remove('busy');
        void cab.offsetWidth; // reflow to restart animation
        cab.classList.add('busy');
        showBusyToast(cab);
        setTimeout(()=>cab.classList.remove('busy'), 600);
        return;
      }

      openGame(gameId, gameName);
    });
  });

  // close on overlay click
  coinOverlay.addEventListener('click', e=>{
    if(e.target===coinOverlay){ coinOverlay.classList.remove('active'); }
  });
})();

/* ═══════════════════════════════════
   SYNTHWAVE DINO GAME
   Fixed: canvas DPI scaling, jump logic,
   mobile touch controls
═══════════════════════════════════ */
(function(){
  const canvas  = document.getElementById('dino-canvas');
  const ctx     = canvas.getContext('2d');
  const startMsg= document.getElementById('game-start-msg');
  const overMsg = document.getElementById('game-over-msg');
  const scoreDis= document.getElementById('score-display');
  const btnJump = document.getElementById('btn-jump');
  const btnDuck = document.getElementById('btn-duck');

  // ── SYNTHWAVE AUDIO ENGINE ──
  let _audioCtx = null;
  function getACtx(){
    if(!_audioCtx) _audioCtx = new(window.AudioContext||window.webkitAudioContext)();
    if(_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  }

  // master gain so everything is controlled together
  let _masterGain = null;
  function getMaster(){
    if(!_masterGain){
      const ctx = getACtx();
      _masterGain = ctx.createGain();
      _masterGain.gain.value = .55;
      _masterGain.connect(ctx.destination);
    }
    return _masterGain;
  }

  function snd_jump(){
    try{
      const ctx = getACtx(), out = getMaster();
      // quick rising sine — light, bouncy
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.type = 'sine';
      o.frequency.setValueAtTime(320, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + .12);
      g.gain.setValueAtTime(.32, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .22);
      o.start(); o.stop(ctx.currentTime + .23);

      // subtle overtone shimmer
      const o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o2.connect(g2); g2.connect(out);
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(640, ctx.currentTime);
      o2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + .1);
      g2.gain.setValueAtTime(.1, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .14);
      o2.start(); o2.stop(ctx.currentTime + .15);
    }catch(e){}
  }

  function snd_land(){
    try{
      const ctx = getACtx(), out = getMaster();
      // short descending thud — feels like touching ground
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.type = 'sine';
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + .08);
      g.gain.setValueAtTime(.28, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .1);
      o.start(); o.stop(ctx.currentTime + .11);
    }catch(e){}
  }

  function snd_duck(){
    try{
      const ctx = getACtx(), out = getMaster();
      // short downward whoosh
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(500, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + .1);
      g.gain.setValueAtTime(.14, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .12);
      o.start(); o.stop(ctx.currentTime + .13);
    }catch(e){}
  }

  function snd_die(){
    try{
      const ctx = getACtx(), out = getMaster();
      // dramatic descending chord + noise burst
      [220, 165, 110].forEach((freq, i)=>{
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(out);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq * 1.5, ctx.currentTime + i*.07);
        o.frequency.exponentialRampToValueAtTime(freq * .5, ctx.currentTime + i*.07 + .35);
        g.gain.setValueAtTime(.22, ctx.currentTime + i*.07);
        g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + i*.07 + .38);
        o.start(ctx.currentTime + i*.07);
        o.stop(ctx.currentTime + i*.07 + .4);
      });
      // noise crackle
      const buf = ctx.createBuffer(1, ctx.sampleRate*.15, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * .12;
      const src = ctx.createBufferSource(), gn = ctx.createGain();
      src.buffer = buf; src.connect(gn); gn.connect(out);
      gn.gain.setValueAtTime(.3, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .15);
      src.start();
    }catch(e){}
  }

  function snd_milestone(){
    try{
      const ctx = getACtx(), out = getMaster();
      // quick ascending arpeggio — every 100 pts
      const base = 440;
      const notes = [1, 1.25, 1.5, 2];
      notes.forEach((mult, i)=>{
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(out);
        o.type = 'triangle';
        o.frequency.value = base * mult;
        const t = ctx.currentTime + i * .07;
        g.gain.setValueAtTime(.0, t);
        g.gain.linearRampToValueAtTime(.16, t + .03);
        g.gain.exponentialRampToValueAtTime(.001, t + .16);
        o.start(t); o.stop(t + .18);
      });
    }catch(e){}
  }

  // footstep tick — subtle metronome while running
  function snd_step(fr, spd){
    try{
      const interval = Math.max(6, Math.round(12 - spd));
      if(fr % interval !== 0) return;
      const ctx = getACtx(), out = getMaster();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.type = 'square';
      o.frequency.value = fr % (interval*2) === 0 ? 180 : 140;
      g.gain.setValueAtTime(.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .04);
      o.start(); o.stop(ctx.currentTime + .05);
    }catch(e){}
  }


  const LW = 880, LH = 220;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    if(rect.width === 0 || rect.height === 0) return false;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(canvas.width / LW, canvas.height / LH);
    return true;
  }
  // expose for arcade launcher — retries up to 10 times if panel not yet painted
  window._neonRunResize = function(){
    if(!resizeCanvas()){
      let tries=0;
      const t=setInterval(()=>{
        if(resizeCanvas() || ++tries>10) clearInterval(t);
      },50);
    }
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, {passive:true});

  const W = LW, H = LH;

  const C={
    ground: '#ff2d78', groundG: 'rgba(255,45,120,.5)',
    grid2:  'rgba(255,45,120,.08)',
    mtn:    'rgba(180,79,255,.35)', mtn2: 'rgba(180,79,255,.15)',
    dino:   '#00f5ff',  dinoG:  'rgba(0,245,255,.6)',
    obs1:   '#ff2d78',  obs2:   '#b44fff',
    particle:'#ffd93d', score:  '#00f5ff', hiscore:'#ffd93d',
  };

  // ── GAME STATE ──
  let state='idle';
  let score=0, hiscore=0, frame=0, speed=4;
  let particles=[], obstacles=[], nextObs=100, gridOffsetY=0;

  // ── GROUND ──
  const groundY    = 24;
  const groundLineY= H - groundY;

  // ── DINO ──
  const DINO_W=26, DINO_H=34, DUCK_H=18;
  const dino={
    x:70, vy:0, y:0,
    onGround:true, ducking:false, legPhase:0,
    get drawY(){ return groundLineY - (this.ducking ? DUCK_H : DINO_H) + this.y; },
    get boxY()  { return groundLineY - (this.ducking ? DUCK_H : DINO_H) + this.y; },
    get boxH()  { return this.ducking ? DUCK_H : DINO_H; },
  };

  // ── STATIC SCENERY ──
  const stars = Array.from({length:55},()=>({
    x:Math.random()*W, y:Math.random()*(H*.52),
    r:Math.random()*1.1+.3, blink:Math.random()*Math.PI*2,
  }));
  const mtn1=genMtn(.7,.5), mtn2=genMtn(.42,.42);
  function genMtn(amp,base){
    const pts=[{x:0,y:H*base}];
    for(let x=0;x<=W;x+=36) pts.push({x,y:H*base - Math.random()*H*amp*(.3+Math.random()*.4)});
    pts.push({x:W,y:H*base},{x:W,y:H},{x:0,y:H});
    return pts;
  }
  // ── RESET ──
  function reset(){
    score=0; frame=0; speed=4;
    dino.y=0; dino.vy=0; dino.onGround=true; dino.ducking=false; dino.legPhase=0;
    obstacles=[]; nextObs=100; particles=[]; gridOffsetY=0;
  }

  // expose reset+state for arcade launcher
  window._neonRunReset = function(){
    state='idle';
    reset();
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
  };

  // ── ACTIONS ──
  function doJump(){
    if(state==='idle'){
      state='running';
      startMsg.classList.add('hidden');
      overMsg.classList.remove('show');
      reset();
      return;
    }
    if(state==='dead'){
      state='running';
      overMsg.classList.remove('show');
      reset();
      return;
    }
    // KEY FIX: only jump when truly on ground
    if(state==='running' && dino.onGround){
      dino.vy = -11.5;
      dino.onGround = false;
      snd_jump();
      spawnParticles(dino.x + DINO_W/2, groundLineY, 'jump');
    }
  }

  function startDuck(){ if(state==='running' && !dino.ducking){ dino.ducking=true; snd_duck(); } }
  function stopDuck() { dino.ducking=false; }

  // ── INPUT ──
  // Keyboard
  window.addEventListener('keydown',e=>{
    if(e.code==='Space' || e.code==='ArrowUp'){ e.preventDefault(); doJump(); }
    if(e.code==='ArrowDown'){ e.preventDefault(); startDuck(); }
  },{passive:false});
  window.addEventListener('keyup',e=>{ if(e.code==='ArrowDown') stopDuck(); });

  // Touch on canvas: tap = jump (no duck on canvas tap)
  canvas.addEventListener('touchstart',e=>{
    e.preventDefault();
    doJump();
  },{passive:false});

  // Mobile buttons
  if(btnJump){
    btnJump.addEventListener('touchstart',e=>{ e.preventDefault(); doJump(); },{passive:false});
    btnJump.addEventListener('mousedown',e=>{ e.preventDefault(); doJump(); });
  }
  if(btnDuck){
    btnDuck.addEventListener('touchstart', e=>{ e.preventDefault(); startDuck(); },{passive:false});
    btnDuck.addEventListener('touchend',   e=>{ e.preventDefault(); stopDuck();  },{passive:false});
    btnDuck.addEventListener('mousedown',  ()=>startDuck());
    btnDuck.addEventListener('mouseup',    ()=>stopDuck());
  }

  // ── PARTICLES ──
  function spawnParticles(x,y,type){
    const n=type==='jump'?6:14;
    for(let i=0;i<n;i++){
      const ang = type==='jump'
        ? Math.PI + Math.random()*Math.PI
        : Math.random()*Math.PI*2;
      const spd = type==='jump'
        ? 1 + Math.random()*3
        : 2 + Math.random()*5;
      particles.push({
        x, y, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
        life:1, decay:.04+Math.random()*.04,
        r:2+Math.random()*3,
        color: type==='jump' ? C.dinoG : C.particle,
      });
    }
  }

  // ── SPAWN OBSTACLE ──
  function spawnObs(){
    const roll=Math.random();
    let w,h,type;
    if(roll<.5)      { w=12+Math.random()*10; h=26+Math.random()*24; type='cactus'; }
    else if(roll<.8) { w=44+Math.random()*28; h=14; type='bird'; }
    else             { w=10; h=42+Math.random()*18; type='tall'; }
    const yOff = type==='bird' ? -(18+Math.random()*36) : 0;
    obstacles.push({
      x:W+20,
      y:groundLineY - h + yOff,
      w, h, type,
      color: roll<.5 ? C.obs1 : C.obs2,
    });
  }

  // ── DRAW ──
  function drawBg(){
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#04020e'); sky.addColorStop(.6,'#0b0620'); sky.addColorStop(1,'#150830');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  }

  function drawStars(){
    stars.forEach(s=>{
      const b=.5+.5*Math.sin(s.blink+frame*.02);
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(240,236,255,${.4*b+.1})`;
      ctx.shadowColor='white'; ctx.shadowBlur=4*b; ctx.fill(); ctx.shadowBlur=0;
    });
  }

  function drawSun(){
    const sx=W/2, sy=H*.38, sr=75;
    const g=ctx.createRadialGradient(sx,sy,0,sx,sy,sr*3);
    g.addColorStop(0,'rgba(255,45,120,.2)'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(sx-sr*3,sy-sr*2,sr*6,sr*3);
    ctx.save();
    ctx.beginPath(); ctx.arc(sx,sy,sr,Math.PI,0); ctx.closePath(); ctx.clip();
    const sg=ctx.createLinearGradient(sx-sr,sy,sx+sr,sy);
    sg.addColorStop(0,'#ff6baf'); sg.addColorStop(.5,'#ff2d78'); sg.addColorStop(1,'#ff6baf');
    ctx.fillStyle=sg; ctx.shadowColor='#ff2d78'; ctx.shadowBlur=16; ctx.fill(); ctx.shadowBlur=0;
    for(let i=0;i<8;i++){
      const ly=sy-5-i*7;
      ctx.fillStyle='rgba(4,2,14,.88)'; ctx.fillRect(sx-sr,ly,sr*2,3.5);
    }
    ctx.restore();
  }

  function drawMountains(){
    [mtn2,mtn1].forEach((pts,idx)=>{
      ctx.beginPath();
      pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      ctx.closePath();
      ctx.fillStyle=idx===0?'rgba(7,4,18,.78)':'rgba(7,4,18,.88)'; ctx.fill();
      ctx.beginPath();
      pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      ctx.closePath();
      ctx.fillStyle=idx===0?C.mtn2:C.mtn; ctx.fill();
    });
  }

  function drawGrid(){
    gridOffsetY=(gridOffsetY+speed*.5)%60;
    const horizon=H*.5;
    for(let x=-6;x<=6;x++){
      const bx=W/2+x*72;
      ctx.beginPath(); ctx.moveTo(bx,horizon);
      ctx.lineTo(W/2+(bx-W/2)*5,groundLineY+6);
      ctx.strokeStyle=C.grid2; ctx.lineWidth=.8; ctx.stroke();
    }
    for(let i=0;i<10;i++){
      const t=(i/10+gridOffsetY/600)%1;
      const y=horizon+(groundLineY-horizon)*Math.pow(t,1.5);
      const xoff=(1-t)*W*.5;
      ctx.beginPath(); ctx.moveTo(xoff,y); ctx.lineTo(W-xoff,y);
      ctx.strokeStyle=`rgba(255,45,120,${t*.28})`; ctx.lineWidth=.8; ctx.stroke();
    }
  }

  function drawGround(){
    ctx.beginPath(); ctx.moveTo(0,groundLineY); ctx.lineTo(W,groundLineY);
    ctx.strokeStyle=C.ground; ctx.lineWidth=2;
    ctx.shadowColor=C.ground; ctx.shadowBlur=10; ctx.stroke(); ctx.shadowBlur=0;
    const gg=ctx.createLinearGradient(0,groundLineY,0,H);
    gg.addColorStop(0,C.groundG); gg.addColorStop(1,'transparent');
    ctx.fillStyle=gg; ctx.fillRect(0,groundLineY,W,H-groundLineY);
  }

  function drawDino(){
    const x=dino.x, y=dino.drawY;
    const w=DINO_W, h=dino.ducking?DUCK_H:DINO_H;
    ctx.shadowColor=C.dino; ctx.shadowBlur=10;
    ctx.fillStyle=C.dino;
    if(dino.ducking){
      ctx.fillRect(x,y,w+8,h);
      ctx.fillStyle='#04020e'; ctx.fillRect(x+w+2,y+4,5,5);
    } else {
      ctx.fillRect(x,y+8,w,h-8);       // body
      ctx.fillRect(x+6,y,w,13);         // head
      ctx.fillStyle='#04020e'; ctx.fillRect(x+w+1,y+3,5,5); // eye
      ctx.fillStyle=C.dino;
      ctx.fillRect(x+w+3,y+11,5,2.5);  // mouth
      ctx.fillRect(x-7,y+h-12,9,7);    // tail
      if(dino.onGround){
        const lp=Math.sin(dino.legPhase);
        ctx.fillRect(x+4, y+h, 3+Math.round(lp*2),  8);
        ctx.fillRect(x+14,y+h, 3+Math.round(lp*-2), 8);
        dino.legPhase+=.28*(speed/4);
      } else {
        ctx.fillRect(x+4, y+h, 4, 7);
        ctx.fillRect(x+14,y+h,-3, 7);
      }
    }
    ctx.shadowBlur=0;
    // shadow on ground
    const dg=ctx.createRadialGradient(x+w/2,groundLineY,0,x+w/2,groundLineY,28);
    dg.addColorStop(0,'rgba(0,245,255,.22)'); dg.addColorStop(1,'transparent');
    ctx.fillStyle=dg; ctx.fillRect(x-8,groundLineY-4,w+16,18);
  }

  function drawObstacle(o){
    ctx.save();

    if(o.type==='bird'){
      const x=o.x, y=o.y, w=o.w, h=o.h;
      const flap=Math.sin(frame*.22);
      if(!isMobile){ ctx.shadowColor=C.obs2; ctx.shadowBlur=10; }
      ctx.fillStyle=C.obs2;

      // corpo
      ctx.fillRect(x+w*.3, y+4, w*.4, h-2);
      // testa
      ctx.fillRect(x+w*.62, y, w*.22, h*.7);
      // becco/cresta
      ctx.fillRect(x+w*.84, y+2, w*.18, 3);
      ctx.fillStyle='#ff2d78';
      if(!isMobile){ ctx.shadowColor='#ff2d78'; ctx.shadowBlur=5; }
      ctx.fillRect(x+w*.6, y-4, 4, 5); // cresta
      if(!isMobile){ ctx.shadowColor=C.obs2; ctx.shadowBlur=10; }
      ctx.fillStyle=C.obs2;
      // occhio
      ctx.fillStyle='#04020e';
      ctx.fillRect(x+w*.68, y+2, 4, 4);
      ctx.fillStyle='#ff2d78';
      ctx.fillRect(x+w*.69, y+3, 2, 2);
      // ala sx (batte)
      ctx.fillStyle=C.obs2;
      const wingY = flap * 7;
      ctx.fillRect(x,        y+wingY,   w*.32, 4);
      ctx.fillRect(x+w*.04,  y+wingY-3, w*.22, 4);
      // ala dx
      ctx.fillRect(x+w*.68,  y+wingY,   w*.32, 4);
      ctx.fillRect(x+w*.74,  y+wingY-3, w*.22, 4);
      // coda
      ctx.fillRect(x+w*.15, y+5, w*.18, 3);
      ctx.fillRect(x+w*.1,  y+8, w*.1,  3);

    } else if(o.type==='cactus'){
      const x=o.x, y=o.y, w=o.w, h=o.h;
      if(!isMobile){ ctx.shadowColor=C.obs1; ctx.shadowBlur=12; }
      ctx.fillStyle=C.obs1;

      // tronco centrale
      ctx.fillRect(x+w*.3, y, w*.4, h);
      // punta top
      ctx.fillRect(x+w*.35, y-4, w*.3, 5);

      // braccio sx
      ctx.fillRect(x, y+h*.22, w*.32, w*.35);       // braccio orizz
      ctx.fillRect(x, y+h*.1,  w*.32, h*.18);       // fusto sx
      ctx.fillRect(x+w*.04, y+h*.08, w*.2, 5);      // punta sx

      // braccio dx
      ctx.fillRect(x+w*.68, y+h*.32, w*.32, w*.35); // braccio orizz
      ctx.fillRect(x+w*.68, y+h*.2,  w*.32, h*.2);  // fusto dx
      ctx.fillRect(x+w*.72, y+h*.18, w*.2,  5);     // punta dx

      // spine (piccoli pixel sporgenti) — colore più chiaro
      ctx.fillStyle='rgba(255,107,175,.9)';
      for(let i=0;i<4;i++){
        ctx.fillRect(x+w*.68+1, y+h*.32+i*6, 3, 2); // spine dx
        ctx.fillRect(x+w*.28-2, y+h*.22+i*5, 3, 2); // spine sx
        ctx.fillRect(x+w*.68+1, y+h*.32+i*6, 3, 2);
      }

    } else {
      // ── tall: TORRE ELETTRICA con scariche ──
      const x=o.x, y=o.y, w=o.w, h=o.h;
      const t = frame * .08;
      const cx2 = x + w/2;

      // ── struttura torre ad alta tensione ──
      if(!isMobile){ ctx.shadowColor='#ffd93d'; ctx.shadowBlur=14; }
      ctx.fillStyle='#ffd93d';
      ctx.fillRect(cx2-3, y,        6, h);
      ctx.fillRect(x-5,   y,        w+10, 5);
      ctx.fillRect(x-2,   y+5,      w+4,  3);
      ctx.fillRect(x-3,   y+h*.45,  w+6,  4);
      ctx.fillRect(x-5,   y+h-5,    w+10, 5);
      ctx.fillRect(x-2,   y+h-8,    w+4,  3);

      // gambe diagonali
      if(!isMobile) ctx.shadowBlur=6;
      ctx.lineWidth=2.5;
      ctx.strokeStyle='#ffd93d'; if(!isMobile) ctx.shadowColor='#ffd93d';
      [[cx2-3,y+5,      x-5,    y+h*.44],
       [cx2+3,y+5,      x+w+5,  y+h*.44],
       [cx2-3,y+h*.49,  x-5,    y+h-5],
       [cx2+3,y+h*.49,  x+w+5,  y+h-5]
      ].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      // isolatori alle punte della traversa top
      ctx.fillStyle='#ffd93d';
      if(!isMobile) ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(x-5,   y+2, 4.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+w+5, y+2, 4.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#04020e';
      ctx.beginPath(); ctx.arc(x-5,   y+2, 2,   0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+w+5, y+2, 2,   0, Math.PI*2); ctx.fill();

      // ── SCARICHE ELETTRICHE + ALONE (solo desktop) ──
      if(!isMobile){
        const bolt=(x1,y1,x2,y2,segs,col,alpha)=>{
          ctx.save();
          ctx.strokeStyle=col||'#00f5ff'; ctx.shadowColor=col||'#00f5ff';
          ctx.shadowBlur=8; ctx.lineWidth=1.2; ctx.globalAlpha=alpha||.85;
          ctx.beginPath(); ctx.moveTo(x1,y1);
          const dx=(x2-x1)/segs, dy=(y2-y1)/segs;
          for(let i=1;i<segs;i++){
            const j=Math.sin(t*6.7+i*2.9+x1*.02)*7;
            ctx.lineTo(x1+dx*i+j, y1+dy*i+j*.4);
          }
          ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore();
        };
        const p1=Math.sin(t*2.3), p2=Math.sin(t*2.3+Math.PI);
        if(p1>-.2){ bolt(x-5,y+2,cx2,y+2,6,'#00f5ff',.55+p1*.35); }
        if(p2>-.2){ bolt(x+w+5,y+2,cx2,y+2,6,'#00f5ff',.55+p2*.35); }
        if(p1>.3){ bolt(x-5,y+2,cx2-3,y+h*.44,8,'#7bf5ff',.35); }
        if(p2>.3){ bolt(x+w+5,y+2,cx2+3,y+h*.44,8,'#7bf5ff',.35); }
        bolt(cx2,y+7,cx2,y+h*.43,9,'#ffd93d',.55);
        bolt(cx2,y+h*.49,cx2,y+h-7,9,'#ffd93d',.55);
        // alone pulsante sugli isolatori
        const gr=5+Math.abs(Math.sin(t*3.1))*4;
        ctx.save();
        ctx.shadowColor='#00f5ff'; ctx.shadowBlur=22;
        ctx.fillStyle=`rgba(0,245,255,${.25+Math.abs(Math.sin(t*3.1))*.45})`;
        ctx.beginPath(); ctx.arc(x-5,y+2,gr,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+w+5,y+2,gr,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  function drawParticles(){
    particles.forEach(p=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0,p.r*p.life),0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.globalAlpha=p.life*.9; ctx.fill();
    });
    ctx.globalAlpha=1;
  }

  function drawHUD(){
    const fs=Math.max(10, W*0.015);
    ctx.font=`bold ${fs}px 'Share Tech Mono',monospace`;
    const s=String(score).padStart(5,'0');
    const hi=String(hiscore).padStart(5,'0');
    ctx.fillStyle=C.hiscore; ctx.shadowColor=C.hiscore; ctx.shadowBlur=5;
    ctx.fillText('HI '+hi, W-220, 18); ctx.shadowBlur=0;
    ctx.fillStyle=C.score;  ctx.shadowColor=C.score;  ctx.shadowBlur=5;
    ctx.fillText('SCORE '+s, W-110, 18); ctx.shadowBlur=0;
    scoreDis.textContent=s;
  }

  // ── COLLISION ──
  function collides(ax, ay, aw, ah, b){
    const pad = 4;
    return ax + pad       < b.x + b.w - pad &&
           ax + aw - pad  > b.x + pad       &&
           ay + pad       < b.y + b.h - pad &&
           ay + ah - pad  > b.y + pad;
  }

  // ── MAIN LOOP ──
  let rafId = null;
  function loop(){
    rafId = requestAnimationFrame(loop);
    frame++;
    ctx.clearRect(0,0,W,H);

    drawBg(); drawStars(); drawSun(); drawMountains(); drawGrid(); drawGround();

    if(state==='running'){
      // Physics — dino.y is negative when in the air (0 = ground)
      const wasOnGround = dino.onGround;
      dino.vy += .65;
      dino.y  += dino.vy;
      if(dino.y >= 0){
        dino.y = 0;
        dino.vy = 0;
        if(!wasOnGround){ snd_land(); } // just landed
        dino.onGround = true;
      }

      // Obstacles
      nextObs--;
      if(nextObs<=0){ spawnObs(); nextObs=Math.floor(58+Math.random()*90); }
      obstacles = obstacles.filter(o=>o.x>-80);
      obstacles.forEach(o=>o.x-=speed);

      // Score & speed + milestone sound every 100pts
      if(frame%6===0){
        const prev = score;
        score++;
        hiscore=Math.max(hiscore,score);
        if(score % 100 === 0 && score !== prev) snd_milestone();
      }
      speed = 4 + Math.floor(score/80)*.6;

      // footstep tick
      if(dino.onGround && !dino.ducking) snd_step(frame, speed);

      // Collision check — build explicit box for dino
      const dw = dino.ducking ? DINO_W + 8 : DINO_W;
      const dh = dino.ducking ? DUCK_H : DINO_H;
      const dx = dino.x;
      const dy = groundLineY - dh + dino.y;   // dino.y is ≤0, negative = in air

      for(const o of obstacles){
        if(collides(dx, dy, dw, dh, o)){
          state='dead';
          snd_die();
          spawnParticles(dx + dw/2, dy + dh/2, 'die');
          overMsg.classList.add('show');
          break;
        }
      }

      // Update particles
      particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=.14; p.life-=p.decay; });
      particles=particles.filter(p=>p.life>0);
    }

    obstacles.forEach(drawObstacle);
    drawDino();
    drawParticles();
    drawHUD();
  }

  // Non avviare il loop automaticamente — aspetta che il pannello sia aperto
  window._neonRunStart = function(){
    if(rafId) return; // già in esecuzione
    window._neonRunReset();
    loop();
  };

  window._neonRunStop = function(){
    if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
    // Riporta in stato idle pulito
    state = 'idle';
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
  };
})();

/* ═══════════════════════════════════
   SECTION INTERACTIONS
═══════════════════════════════════ */
(function(){

  // ── 2. SKILL TAG mouse-local glow ──
  document.querySelectorAll('.stag').forEach(tag=>{
    tag.addEventListener('mousemove', e=>{
      const r = tag.getBoundingClientRect();
      tag.style.setProperty('--mx', ((e.clientX-r.left)/r.width *100)+'%');
      tag.style.setProperty('--my', ((e.clientY-r.top) /r.height*100)+'%');
    });
  });

  // ── 3. AMBIENT FLOATING PARTICLES ──
  // coords in px throughout — no normalised values
  document.querySelectorAll('.section-canvas').forEach(canvas=>{
    const sec = canvas.closest('section');
    if(!sec) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    function resize(){
      W = canvas.width  = sec.offsetWidth;
      H = canvas.height = sec.offsetHeight;
      // re-clamp dot positions after resize
      dots.forEach(d=>{
        d.x = Math.min(d.x, W);
        d.y = Math.min(d.y, H);
      });
    }

    // initialise dots after first resize so W/H are valid
    const dots = [];
    function initDots(){
      dots.length = 0;
      for(let i=0;i<18;i++) dots.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .22,
        r:  Math.random() * 1.2 + .4,
        blink: Math.random() * Math.PI * 2,
        color: Math.random() < .5 ? '255,45,120' : '76,201,240',
      });
    }

    resize();
    initDots();
    new ResizeObserver(resize).observe(sec);

    let smx = -999, smy = -999, f = 0;
    sec.addEventListener('mousemove', e=>{
      const r = sec.getBoundingClientRect();
      smx = e.clientX - r.left;
      smy = e.clientY - r.top;
    }, {passive:true});
    sec.addEventListener('mouseleave', ()=>{ smx=-999; smy=-999; });

    (function draw(){
      if(!canvas.isConnected) return;
      requestAnimationFrame(draw);
      ctx.clearRect(0,0,W,H);
      f++;

      dots.forEach(d=>{
        // move
        d.x += d.vx;
        d.y += d.vy;
        // wrap
        if(d.x < 0)  d.x = W;
        if(d.x > W)  d.x = 0;
        if(d.y < 0)  d.y = H;
        if(d.y > H)  d.y = 0;

        // gentle repel from mouse
        if(smx > 0){
          const ddx = d.x - smx, ddy = d.y - smy;
          const dd  = Math.sqrt(ddx*ddx + ddy*ddy);
          if(dd < 90 && dd > 0){
            const force = (1 - dd/90) * .35;
            d.x += (ddx/dd) * force;
            d.y += (ddy/dd) * force;
          }
        }

        const b = .2 + .25 * Math.sin(d.blink + f * .018);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
        ctx.fillStyle  = `rgba(${d.color},${b})`;
        ctx.shadowColor= `rgb(${d.color})`;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // faint mouse-follow radial glow
      if(smx > 0){
        const g = ctx.createRadialGradient(smx,smy,0,smx,smy,180);
        g.addColorStop(0, 'rgba(180,79,255,.04)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,W,H);
      }
    })();
  });

  // ── 4. SECTION GLOW LINE follows cursor ──
  document.querySelectorAll('section').forEach(sec=>{
    sec.addEventListener('mousemove', e=>{
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--glow-origin', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
    });
  });

})();

/* ═══════════════════════════════════
   BRICK WAVE — CABINET PREVIEW SIMULATION
   Mini physics engine che anima il cabinato
   con rimbalzi reali su mattoni e paddle
═══════════════════════════════════ */
(function(){
  const cv = document.getElementById('bb-preview-canvas');
  if(!cv) return;
  const cx = cv.getContext('2d');

  // palette synthwave
  const PINK   = '#ff2d78';
  const VIOLET = '#b44fff';
  const CYAN   = '#00f5ff';
  const GOLD   = '#ffd93d';
  const BG     = '#020108';
  const BRICK_COLORS = [PINK, VIOLET, CYAN, GOLD, '#ff6baf', CYAN, VIOLET];

  let W, H;

  function resize(){
    W = cv.offsetWidth;
    H = cv.offsetHeight;
    cv.width  = W;
    cv.height = H;
    init();
  }

  // ── LAYOUT CONSTANTS (frazioni di H/W) ──
  const COLS        = 6;
  const ROWS        = 3;
  const BRICK_GAP   = 2;
  const BRICK_TOP   = 0.10;  // % H
  const BRICK_H     = 0.08;  // % H
  const PADDLE_H    = 0.045; // % H
  const PADDLE_W    = 0.36;  // % W
  const PADDLE_Y    = 0.88;  // % H
  const BALL_R      = 0.032; // % W

  let bricks = [], ball = {}, paddle = {};

  function makeBricks(){
    bricks = [];
    const bw  = (W - BRICK_GAP * (COLS + 1)) / COLS;
    const bh  = H * BRICK_H;
    for(let r = 0; r < ROWS; r++){
      for(let c = 0; c < COLS; c++){
        bricks.push({
          x: BRICK_GAP + c * (bw + BRICK_GAP),
          y: H * BRICK_TOP + r * (bh + BRICK_GAP),
          w: bw, h: bh,
          alive: true,
          col: BRICK_COLORS[r % BRICK_COLORS.length],
          flash: 0,
        });
      }
    }
  }

  function init(){
    makeBricks();
    const spd = W * 0.022;
    const ang = -Math.PI / 2 + 0.38; // angolo iniziale verso l'alto-destra
    ball = {
      x:  W * 0.38,
      y:  H * PADDLE_Y - W * BALL_R - 2,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      r:  W * BALL_R,
      trail: [],
    };
    paddle = {
      x: W * 0.5 - W * PADDLE_W / 2,
      y: H * PADDLE_Y,
      w: W * PADDLE_W,
      h: H * PADDLE_H,
      tx: W * 0.5 - W * PADDLE_W / 2, // target x (lerp)
    };
  }

  // paddle "AI": segue la palla con leggero ritardo
  function movePaddle(){
    paddle.tx = Math.max(0, Math.min(W - paddle.w, ball.x - paddle.w / 2));
    paddle.x  += (paddle.tx - paddle.x) * 0.12;
  }

  function stepBall(){
    // trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if(ball.trail.length > 6) ball.trail.shift();

    ball.x += ball.vx;
    ball.y += ball.vy;

    // pareti
    if(ball.x - ball.r <= 0)   { ball.x = ball.r;     ball.vx =  Math.abs(ball.vx); }
    if(ball.x + ball.r >= W)   { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
    if(ball.y - ball.r <= 0)   { ball.y = ball.r;     ball.vy =  Math.abs(ball.vy); }

    // paddle
    if(
      ball.vy > 0 &&
      ball.x + ball.r > paddle.x &&
      ball.x - ball.r < paddle.x + paddle.w &&
      ball.y + ball.r >= paddle.y &&
      ball.y - ball.r < paddle.y + paddle.h
    ){
      const hit   = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const angle = hit * (Math.PI / 3.5);
      const spd   = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      ball.vx = Math.sin(angle) * spd;
      ball.vy = -Math.abs(Math.cos(angle) * spd);
      ball.y  = paddle.y - ball.r - 1;
    }

    // mattoni
    for(const b of bricks){
      if(!b.alive) continue;
      if(
        ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
        ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h
      ){
        b.alive = false;
        b.flash  = 1;
        const overX = ball.vx > 0 ? (ball.x + ball.r) - b.x : b.x + b.w - (ball.x - ball.r);
        const overY = ball.vy > 0 ? (ball.y + ball.r) - b.y : b.y + b.h - (ball.y - ball.r);
        if(overX < overY) ball.vx *= -1;
        else               ball.vy *= -1;
        break;
      }
    }

    // se la pallina esce sotto o tutti i mattoni sono finiti — reset
    if(ball.y - ball.r > H || bricks.every(b => !b.alive)){
      init();
    }
  }

  // ── DRAW ──
  function drawBg(){
    cx.fillStyle = BG;
    cx.fillRect(0, 0, W, H);
    // grid sottile
    cx.strokeStyle = 'rgba(180,79,255,.08)';
    cx.lineWidth   = 0.5;
    const gs = Math.round(W / 8);
    for(let x = 0; x <= W; x += gs){ cx.beginPath(); cx.moveTo(x,0); cx.lineTo(x,H); cx.stroke(); }
    for(let y = 0; y <= H; y += gs){ cx.beginPath(); cx.moveTo(0,y); cx.lineTo(W,y); cx.stroke(); }
  }

  function drawBricks(){
    bricks.forEach(b => {
      if(!b.alive) return;
      cx.save();
      cx.shadowColor = b.col;
      cx.shadowBlur  = 6;
      cx.fillStyle   = b.col;
      cx.globalAlpha = 0.85;
      cx.beginPath();
      cx.roundRect(b.x, b.y, b.w, b.h, 2);
      cx.fill();
      // highlight top
      cx.globalAlpha = 0.25;
      cx.fillStyle = '#ffffff';
      cx.fillRect(b.x + 2, b.y + 1, b.w - 4, 2);
      cx.restore();
    });
  }

  function drawPaddle(){
    cx.save();
    cx.shadowColor = CYAN;
    cx.shadowBlur  = 12;
    const grad = cx.createLinearGradient(paddle.x, 0, paddle.x + paddle.w, 0);
    grad.addColorStop(0,   '#7bf5ff');
    grad.addColorStop(0.5, CYAN);
    grad.addColorStop(1,   '#7bf5ff');
    cx.fillStyle = grad;
    cx.beginPath();
    cx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, paddle.h / 2);
    cx.fill();
    // glow under
    cx.globalAlpha = 0.3;
    cx.fillStyle = CYAN;
    cx.fillRect(paddle.x + 4, paddle.y + paddle.h, paddle.w - 8, 3);
    cx.restore();
  }

  function drawBall(){
    // trail
    ball.trail.forEach((t, i) => {
      const a = (i / ball.trail.length) * 0.3;
      cx.beginPath();
      cx.arc(t.x, t.y, ball.r * (i / ball.trail.length) * 0.7, 0, Math.PI * 2);
      cx.fillStyle = `rgba(0,245,255,${a})`;
      cx.fill();
    });
    cx.save();
    cx.shadowColor = 'rgba(0,245,255,.9)';
    cx.shadowBlur  = 10;
    const bg = cx.createRadialGradient(
      ball.x - ball.r * 0.3, ball.y - ball.r * 0.3, 0,
      ball.x, ball.y, ball.r
    );
    bg.addColorStop(0,   '#ffffff');
    bg.addColorStop(0.5, '#7bf5ff');
    bg.addColorStop(1,   CYAN);
    cx.fillStyle = bg;
    cx.beginPath();
    cx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  }

  function loop(){
    requestAnimationFrame(loop);
    drawBg();
    drawBricks();
    drawPaddle();
    drawBall();
    movePaddle();
    stepBall();
  }

  // Avvia dopo che il DOM è pronto e il canvas ha dimensioni
  function start(){
    if(cv.offsetWidth === 0){ setTimeout(start, 50); return; }
    resize();
    new ResizeObserver(resize).observe(cv);
    loop();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* ═══════════════════════════════════
   SYNTHWAVE BRICK BREAKER — BRICK WAVE
═══════════════════════════════════ */
(function(){
  const canvas   = document.getElementById('bb-canvas');
  if(!canvas) return;
  const ctx      = canvas.getContext('2d');
  const startMsg = document.getElementById('bb-start-msg');
  const overMsg  = document.getElementById('bb-over-msg');
  const winMsg   = document.getElementById('bb-win-msg');
  const scoreDis = document.getElementById('bb-score-display');
  const btnLeft  = document.getElementById('bb-btn-left');
  const btnRight = document.getElementById('bb-btn-right');

  // ── COLORS (synthwave palette) ──
  const C = {
    bg:       '#04020e',
    grid:     'rgba(180,79,255,.06)',
    sun:      '#ff2d78',
    ground:   '#ff2d78',
    paddle:   '#00f5ff',
    paddleGlow:'rgba(0,245,255,.5)',
    ball:     '#ffffff',
    ballGlow: 'rgba(0,245,255,.8)',
    score:    '#00f5ff',
    hiscore:  '#ff2d78',
    rows: [
      { fill:'#ff2d78', glow:'rgba(255,45,120,.7)',   shadow:'#ff2d78' },
      { fill:'#ff6baf', glow:'rgba(255,107,175,.6)',  shadow:'#ff6baf' },
      { fill:'#b44fff', glow:'rgba(180,79,255,.7)',   shadow:'#b44fff' },
      { fill:'#7b2fff', glow:'rgba(123,47,255,.6)',   shadow:'#7b2fff' },
      { fill:'#00f5ff', glow:'rgba(0,245,255,.7)',    shadow:'#00f5ff' },
      { fill:'#7bf5ff', glow:'rgba(123,245,255,.5)',  shadow:'#7bf5ff' },
      { fill:'#ffd93d', glow:'rgba(255,217,61,.7)',   shadow:'#ffd93d' },
    ],
  };

  // ── AUDIO ENGINE ──
  let _audioCtx = null;
  function ac(){
    if(!_audioCtx) _audioCtx = new(window.AudioContext||window.webkitAudioContext)();
    if(_audioCtx.state==='suspended') _audioCtx.resume();
    return _audioCtx;
  }

  function snd_hit(rowIdx){
    try{
      const a=ac();
      const freqs=[880,740,660,554,440,370,330];
      const f=freqs[rowIdx%freqs.length];
      const o=a.createOscillator(),g=a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type='square'; o.frequency.setValueAtTime(f,a.currentTime);
      o.frequency.exponentialRampToValueAtTime(f*.5,a.currentTime+.08);
      g.gain.setValueAtTime(.18,a.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.12);
      o.start(); o.stop(a.currentTime+.13);
    }catch(e){}
  }

  function snd_paddle(){
    try{
      const a=ac();
      const o=a.createOscillator(),g=a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type='sine'; o.frequency.setValueAtTime(300,a.currentTime);
      o.frequency.exponentialRampToValueAtTime(180,a.currentTime+.06);
      g.gain.setValueAtTime(.22,a.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.08);
      o.start(); o.stop(a.currentTime+.09);
    }catch(e){}
  }

  function snd_wall(){
    try{
      const a=ac();
      const o=a.createOscillator(),g=a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type='triangle'; o.frequency.setValueAtTime(200,a.currentTime);
      o.frequency.exponentialRampToValueAtTime(120,a.currentTime+.05);
      g.gain.setValueAtTime(.12,a.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.07);
      o.start(); o.stop(a.currentTime+.08);
    }catch(e){}
  }

  function snd_die(){
    try{
      const a=ac();
      [440,330,220,110].forEach((f,i)=>{
        const o=a.createOscillator(),g=a.createGain();
        o.connect(g); g.connect(a.destination);
        o.type='sawtooth'; o.frequency.value=f;
        const t=a.currentTime+i*.09;
        g.gain.setValueAtTime(.16,t);
        g.gain.exponentialRampToValueAtTime(.001,t+.12);
        o.start(t); o.stop(t+.13);
      });
    }catch(e){}
  }

  function snd_win(){
    try{
      const a=ac();
      [440,554,659,880,1108].forEach((f,i)=>{
        const o=a.createOscillator(),g=a.createGain();
        o.connect(g); g.connect(a.destination);
        o.type='square'; o.frequency.value=f;
        const t=a.currentTime+i*.09;
        g.gain.setValueAtTime(.13,t);
        g.gain.exponentialRampToValueAtTime(.001,t+.16);
        o.start(t); o.stop(t+.18);
      });
    }catch(e){}
  }

  function snd_milestone(){
    try{
      const a=ac();
      [660,880,1108].forEach((f,i)=>{
        const o=a.createOscillator(),g=a.createGain();
        o.connect(g); g.connect(a.destination);
        o.type='square'; o.frequency.value=f;
        const t=a.currentTime+i*.07;
        g.gain.setValueAtTime(.1,t);
        g.gain.exponentialRampToValueAtTime(.001,t+.12);
        o.start(t); o.stop(t+.14);
      });
    }catch(e){}
  }

  // ── STATE ──
  let W, H, DPR=1;
  let state='idle'; // idle | running | dead | win
  let score=0, hiscore=0, lives=3, level=1;
  let frame=0, rafId=null;

  // ── ENTITIES ──
  let paddle={}, ball={}, bricks=[], particles=[], stars=[];

  // ── BRICK GRID CONFIG ──
  const BRICK_ROWS    = 7;
  const BRICK_COLS    = 10;
  const BRICK_PAD     = 4;
  const BRICK_TOP_OFF = 0.12; // fraction of H

  function initStars(){
    stars = Array.from({length:80},()=>({
      x:Math.random()*W, y:Math.random()*(H*.55),
      r:Math.random()*1.2+.3,
      b:Math.random()*Math.PI*2,
      s:Math.random()*.0004+.0001,
    }));
  }

  function initBricks(){
    bricks=[];
    const bw = (W - BRICK_PAD*(BRICK_COLS+1)) / BRICK_COLS;
    const bh = Math.min(18, (H*.38) / BRICK_ROWS - BRICK_PAD);
    const topY = H * BRICK_TOP_OFF;
    for(let r=0;r<BRICK_ROWS;r++){
      const col = C.rows[r % C.rows.length];
      const hp  = r < 2 ? 2 : 1; // top 2 rows take 2 hits
      for(let c=0;c<BRICK_COLS;c++){
        bricks.push({
          x: BRICK_PAD + c*(bw+BRICK_PAD),
          y: topY + r*(bh+BRICK_PAD),
          w: bw, h: bh,
          alive: true,
          hp, maxHp: hp,
          col,
          flashTimer: 0,
        });
      }
    }
  }

  function initPaddle(){
    const pw = Math.min(100, W*.18);
    paddle = {
      w: pw,
      h: Math.max(10, H*.022),
      x: W/2 - pw/2,
      y: H - H*.08,
      speed: 7,
    };
  }

  function ballSpeed(){
    // base più alta + incremento per livello
    const base = Math.min(W,H) * .014;
    return base * (1 + (level-1)*.2);
  }

  function initBall(){
    const spd = ballSpeed();
    const ang = -Math.PI/2 + (Math.random()-.5)*.5;
    ball = {
      x: W/2,
      y: paddle.y - 12,
      vx: Math.cos(ang)*spd,
      vy: Math.sin(ang)*spd,
      r: Math.max(6, W*.012),
      stuck: true, // glued to paddle before launch
      trail: [],
    };
  }

  function reset(keepLevel=false){
    score=0; lives=3; hitCount=0;
    if(!keepLevel) level=1;
    state='idle';
    frame=0;
    particles=[];
    initStars();
    initPaddle();
    initBricks();
    initBall();
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
    winMsg.classList.remove('show');
    if(scoreDis) scoreDis.textContent='00000';
  }

  function nextLevel(){
    level++;
    particles=[];
    initPaddle();
    initBricks();
    initBall();
    state='idle';
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
    winMsg.classList.remove('show');
  }

  // ── RESIZE ──
  function resize(){
    DPR = window.devicePixelRatio||1;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width  || canvas.offsetWidth  || 600;
    const ch = rect.height || canvas.offsetHeight || 420;
    canvas.width  = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    initStars();
    initPaddle();
    initBricks();
    initBall();
  }
  window._brickResize = resize;
  window.addEventListener('resize', ()=>{ if(rafId) resize(); }, {passive:true});

  // ── INPUT ──
  let mouseX = -1;

  // nasconde il cursore custom quando si è sul canvas di gioco
  const curDot  = document.getElementById('cur-dot');
  const curRing = document.getElementById('cur-ring');
  function hideCursor(){ if(curDot) curDot.style.opacity='0'; if(curRing) curRing.style.opacity='0'; }
  function showCursor(){ if(curDot) curDot.style.opacity=''; if(curRing) curRing.style.opacity=''; }
  canvas.addEventListener('mouseenter', hideCursor);
  canvas.addEventListener('mouseleave', ()=>{ mouseX=-1; showCursor(); });
  canvas.addEventListener('touchstart',  ()=>hideCursor(), {passive:true});
  canvas.addEventListener('touchend',    ()=>showCursor(), {passive:true});

  canvas.addEventListener('mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
  });
  canvas.addEventListener('mouseleave',()=>{ mouseX=-1; });

  // touch
  canvas.addEventListener('touchmove',e=>{
    e.preventDefault();
    const r=canvas.getBoundingClientRect();
    mouseX=e.touches[0].clientX - r.left;
  },{passive:false});

  canvas.addEventListener('touchstart',e=>{
    e.preventDefault();
    const r=canvas.getBoundingClientRect();
    mouseX=e.touches[0].clientX - r.left;
    if(state==='idle'){ launch(); return; }
    if(state==='dead'){ reset(); return; }
    if(state==='win'){  nextLevel(); return; }
  },{passive:false});

  // mobile buttons — movimento continuo finché premuto
  let mobileDir = 0;
  let mobileRaf = null;
  function startMobileMove(dir){
    mobileDir = dir;
    if(mobileRaf) return;
    function step(){
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x + mobileDir * (paddle.w * 0.12)));
      if(ball.stuck){ ball.x = paddle.x + paddle.w/2; }
      mobileRaf = requestAnimationFrame(step);
    }
    mobileRaf = requestAnimationFrame(step);
  }
  function stopMobileMove(){
    mobileDir = 0;
    if(mobileRaf){ cancelAnimationFrame(mobileRaf); mobileRaf = null; }
  }

  if(btnLeft){
    btnLeft.addEventListener('touchstart', e=>{ e.preventDefault(); startMobileMove(-1); },{passive:false});
    btnLeft.addEventListener('touchend',   e=>{ e.preventDefault(); stopMobileMove(); },{passive:false});
    btnLeft.addEventListener('mousedown',  ()=>startMobileMove(-1));
    btnLeft.addEventListener('mouseup',    ()=>stopMobileMove());
    btnLeft.addEventListener('mouseleave', ()=>stopMobileMove());
  }
  if(btnRight){
    btnRight.addEventListener('touchstart',e=>{ e.preventDefault(); startMobileMove(1); },{passive:false});
    btnRight.addEventListener('touchend',  e=>{ e.preventDefault(); stopMobileMove(); },{passive:false});
    btnRight.addEventListener('mousedown', ()=>startMobileMove(1));
    btnRight.addEventListener('mouseup',   ()=>stopMobileMove());
    btnRight.addEventListener('mouseleave',()=>stopMobileMove());
  }

  // keyboard — solo Space per avviare/riavviare
  window.addEventListener('keydown',e=>{
    const inBB = canvas.closest('.game-inner')?.classList.contains('active');
    if(!inBB) return;
    if(e.code==='Space'||e.key===' '){
      e.preventDefault();
      if(state==='idle')  launch();
      else if(state==='dead') reset();
      else if(state==='win')  nextLevel();
    }
  });

  function launch(){
    if(state!=='idle') return;
    state='running';
    ball.stuck=false;
    startMsg.classList.add('hidden');
  }

  // ── PARTICLES ──
  function spawnBrickParticles(bx,by,bw,bh,col){
    for(let i=0;i<14;i++){
      const angle=Math.random()*Math.PI*2;
      const spd=Math.random()*3+1;
      particles.push({
        x:bx+bw/2, y:by+bh/2,
        vx:Math.cos(angle)*spd,
        vy:Math.sin(angle)*spd - 1,
        r:Math.random()*3+1,
        life:1,
        decay:.022+Math.random()*.02,
        color:col.fill,
      });
    }
  }

  function spawnPaddleParticles(){
    for(let i=0;i<6;i++){
      const angle=-Math.PI/2+(Math.random()-.5)*Math.PI;
      const spd=Math.random()*2.5+.5;
      particles.push({
        x:ball.x, y:ball.y,
        vx:Math.cos(angle)*spd,
        vy:Math.sin(angle)*spd,
        r:Math.random()*2+1,
        life:1,
        decay:.04,
        color:'#00f5ff',
      });
    }
  }

  // ── DRAW BACKGROUND ──
  function drawBg(){
    ctx.fillStyle=C.bg;
    ctx.fillRect(0,0,W,H);

    // grid
    ctx.strokeStyle=C.grid;
    ctx.lineWidth=1;
    const gs=Math.round(W/20);
    for(let x=0;x<W;x+=gs){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for(let y=0;y<H;y+=gs){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // retro sun at top
    const sx=W/2, sy=H*.04, sr=H*.07;
    const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,sr*2);
    sg.addColorStop(0,'rgba(255,45,120,.6)');
    sg.addColorStop(.5,'rgba(180,79,255,.2)');
    sg.addColorStop(1,'transparent');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,sr*2,0,Math.PI*2); ctx.fill();

    const sunG=ctx.createLinearGradient(sx-sr,0,sx+sr,0);
    sunG.addColorStop(0,'#ff2d78'); sunG.addColorStop(.5,'#ffd93d'); sunG.addColorStop(1,'#ff2d78');
    ctx.fillStyle=sunG;
    ctx.shadowColor='#ff2d78'; ctx.shadowBlur=22;
    ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;

    // sun stripes — clipped inside the circle
    ctx.save();
    ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.clip();
    ctx.fillStyle=C.bg;
    for(let i=0;i<6;i++){
      const ty=sy+sr*.25+i*(sr*.145);
      ctx.fillRect(sx-sr,ty,sr*2,sr*.07);
    }
    ctx.restore();

    // stars
    frame++;
    stars.forEach(s=>{
      const b=.3+.4*Math.sin(s.b+frame*s.s*60);
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(240,236,255,${b})`;
      ctx.shadowColor='white'; ctx.shadowBlur=4*b;
      ctx.fill(); ctx.shadowBlur=0;
    });
  }

  // ── DRAW BRICKS ──
  function drawBricks(){
    bricks.forEach(b=>{
      if(!b.alive) return;
      const alpha = b.flashTimer>0 ? .4+.6*Math.sin(b.flashTimer*Math.PI) : 1;
      if(b.flashTimer>0) b.flashTimer=Math.max(0,b.flashTimer-.12);

      ctx.globalAlpha=alpha;
      // glow
      ctx.shadowColor=b.col.shadow; ctx.shadowBlur=10;
      // gradient fill
      const grad=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
      grad.addColorStop(0,b.col.fill);
      grad.addColorStop(1,b.col.shadow+'99');
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.roundRect(b.x,b.y,b.w,b.h,3);
      ctx.fill();

      // hp indicator — white stripe if hp=2
      if(b.hp===2){
        ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,.35)';
        ctx.fillRect(b.x+4,b.y+b.h*.3,b.w-8,b.h*.12);
      }

      // border
      ctx.strokeStyle=b.col.fill; ctx.lineWidth=1; ctx.globalAlpha=.5*alpha;
      ctx.stroke();
      ctx.globalAlpha=1; ctx.shadowBlur=0;
    });
  }

  // ── DRAW PADDLE ──
  function drawPaddle(){
    const px=paddle.x, py=paddle.y, pw=paddle.w, ph=paddle.h;
    // glow under
    const grd=ctx.createLinearGradient(px,py,px+pw,py);
    grd.addColorStop(0,'rgba(0,245,255,0)');
    grd.addColorStop(.5,'rgba(0,245,255,.35)');
    grd.addColorStop(1,'rgba(0,245,255,0)');
    ctx.fillStyle=grd;
    ctx.fillRect(px,py+ph,pw,6);

    ctx.shadowColor=C.paddle; ctx.shadowBlur=16;
    const pg=ctx.createLinearGradient(px,py,px+pw,py+ph);
    pg.addColorStop(0,'#7bf5ff');
    pg.addColorStop(.5,'#00f5ff');
    pg.addColorStop(1,'#7bf5ff');
    ctx.fillStyle=pg;
    ctx.beginPath(); ctx.roundRect(px,py,pw,ph,ph/2); ctx.fill();
    ctx.shadowBlur=0;
  }

  // ── DRAW BALL ──
  function drawBall(){
    // trail
    ball.trail.forEach((t,i)=>{
      const a=(i/ball.trail.length)*.35;
      ctx.beginPath(); ctx.arc(t.x,t.y,ball.r*(i/ball.trail.length)*.7,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,245,255,${a})`; ctx.fill();
    });

    ctx.shadowColor=C.ballGlow; ctx.shadowBlur=20;
    const bg=ctx.createRadialGradient(ball.x-ball.r*.3,ball.y-ball.r*.3,0,ball.x,ball.y,ball.r);
    bg.addColorStop(0,'#ffffff');
    bg.addColorStop(.5,'#7bf5ff');
    bg.addColorStop(1,'#00f5ff');
    ctx.fillStyle=bg;
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  }

  // ── DRAW PARTICLES ──
  function drawParticles(){
    particles.forEach(p=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(0,p.r*p.life),0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.globalAlpha=p.life*.85; ctx.fill();
    });
    ctx.globalAlpha=1;
  }

  // ── DRAW HUD ──
  function drawHeart(cx, cy, size, alpha){
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = '#ff2d78';
    ctx.shadowColor = '#ff2d78';
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    const s = size * 0.5;
    // standard heart bezier
    ctx.moveTo(cx, cy + s * 0.35);
    ctx.bezierCurveTo(cx,       cy - s * 0.1,  cx - s, cy - s * 0.6, cx - s, cy - s * 0.15);
    ctx.bezierCurveTo(cx - s,   cy + s * 0.4,  cx,     cy + s * 0.85, cx, cy + s * 0.85);
    ctx.bezierCurveTo(cx,       cy + s * 0.85, cx + s, cy + s * 0.4,  cx + s, cy - s * 0.15);
    ctx.bezierCurveTo(cx + s,   cy - s * 0.6,  cx,     cy - s * 0.1,  cx, cy + s * 0.35);
    ctx.fill();
    // inner highlight
    ctx.globalAlpha = alpha * 0.4;
    ctx.fillStyle   = '#ff9fc5';
    ctx.shadowBlur  = 0;
    ctx.beginPath();
    const hs = s * 0.38;
    ctx.arc(cx - s * 0.27, cy - s * 0.05, hs, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHUD(){
    const fs = Math.max(9, W * .013);
    ctx.font = `bold ${fs}px 'Share Tech Mono',monospace`;
    const s  = String(score).padStart(5,'0');
    const hi = String(hiscore).padStart(5,'0');

    // hi-score
    ctx.fillStyle = C.hiscore; ctx.shadowColor = C.hiscore; ctx.shadowBlur = 5;
    ctx.fillText('HI ' + hi, W - 200, H * .065); ctx.shadowBlur = 0;
    // score
    ctx.fillStyle = C.score; ctx.shadowColor = C.score; ctx.shadowBlur = 5;
    ctx.fillText('SCORE ' + s, W - 100, H * .065); ctx.shadowBlur = 0;
    if(scoreDis) scoreDis.textContent = s;

    // lives — disegnati come cuori
    const heartSize = Math.max(10, W * .022);
    const heartY    = H * .055;
    const heartGap  = heartSize * 1.5;
    for(let i = 0; i < 3; i++){
      drawHeart(12 + heartSize * 0.5 + i * heartGap, heartY, heartSize, i < lives ? 1 : 0.18);
    }

    // level
    ctx.fillStyle = 'rgba(180,79,255,.9)'; ctx.shadowColor = '#b44fff'; ctx.shadowBlur = 6;
    ctx.fillText('LV ' + level, W / 2 - 14, H * .065);
    ctx.shadowBlur = 0;
  }

  // ── PHYSICS ──
  const MAX_SPEED_MULT = 2.2; // cap velocità massima rispetto alla base
  let hitCount = 0; // colpi totali — usato per accelerazione progressiva

  function updatePaddle(){
    // solo mouse (desktop) o touch (mobile)
    if(mouseX >= 0){
      paddle.x = mouseX - paddle.w/2;
    }
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    if(ball.stuck){
      ball.x = paddle.x + paddle.w/2;
      ball.y = paddle.y - ball.r - 2;
    }
  }

  function boostBall(){
    // piccola accelerazione ad ogni colpo, cappata
    const maxSpd = ballSpeed() * MAX_SPEED_MULT;
    const cur    = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
    if(cur < maxSpd){
      const boost = Math.min(1.06, maxSpd / cur);
      ball.vx *= boost;
      ball.vy *= boost;
    }
    hitCount++;
  }

  function updateBall(){
    if(ball.stuck) return;

    // trail
    ball.trail.push({x:ball.x,y:ball.y});
    if(ball.trail.length>8) ball.trail.shift();

    ball.x += ball.vx;
    ball.y += ball.vy;

    // wall bounces
    if(ball.x-ball.r<=0){ ball.x=ball.r; ball.vx=Math.abs(ball.vx); snd_wall(); }
    if(ball.x+ball.r>=W){ ball.x=W-ball.r; ball.vx=-Math.abs(ball.vx); snd_wall(); }
    if(ball.y-ball.r<=0){ ball.y=ball.r; ball.vy=Math.abs(ball.vy); snd_wall(); }

    // paddle collision
    if(
      ball.vy>0 &&
      ball.x+ball.r > paddle.x &&
      ball.x-ball.r < paddle.x+paddle.w &&
      ball.y+ball.r >= paddle.y &&
      ball.y-ball.r < paddle.y+paddle.h
    ){
      const hit = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
      const angle = hit * (Math.PI/3);
      const spd = Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
      ball.vx = Math.sin(angle)*spd;
      ball.vy = -Math.abs(Math.cos(angle)*spd);
      ball.y  = paddle.y - ball.r - 1;
      boostBall();
      snd_paddle();
      spawnPaddleParticles();
    }

    // brick collision
    for(const b of bricks){
      if(!b.alive) continue;
      if(
        ball.x+ball.r>b.x && ball.x-ball.r<b.x+b.w &&
        ball.y+ball.r>b.y && ball.y-ball.r<b.y+b.h
      ){
        b.hp--;
        b.flashTimer=1;
        if(b.hp<=0){
          b.alive=false;
          spawnBrickParticles(b.x,b.y,b.w,b.h,b.col);
          const pts=10*(level);
          score+=pts;
          hiscore=Math.max(hiscore,score);
          if(score%500===0&&score>0) snd_milestone();
          snd_hit(bricks.indexOf(b)%C.rows.length);
        } else {
          snd_hit(bricks.indexOf(b)%C.rows.length);
        }
        boostBall();

        // reflect
        const overlapX = ball.vx>0
          ? (ball.x+ball.r) - b.x
          : b.x+b.w - (ball.x-ball.r);
        const overlapY = ball.vy>0
          ? (ball.y+ball.r) - b.y
          : b.y+b.h - (ball.y-ball.r);

        if(Math.abs(overlapX) < Math.abs(overlapY)) ball.vx*=-1;
        else ball.vy*=-1;
        break;
      }
    }

    // ball lost
    if(ball.y - ball.r > H){
      lives--;
      snd_die();
      if(lives<=0){
        state='dead';
        overMsg.classList.add('show');
      } else {
        initBall();
        state='idle';
        startMsg.classList.remove('hidden');
      }
    }

    // all bricks cleared
    if(bricks.every(b=>!b.alive)){
      state='win';
      snd_win();
      winMsg.classList.add('show');
    }
  }

  // ── MAIN LOOP ──
  function loop(){
    rafId=requestAnimationFrame(loop);
    ctx.clearRect(0,0,W,H);
    drawBg();
    drawBricks();
    drawParticles();
    drawPaddle();
    drawBall();
    drawHUD();

    if(state==='running'){
      updatePaddle();
      updateBall();
      particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=.06; p.life-=p.decay; });
      particles=particles.filter(p=>p.life>0);
    } else if(state==='idle'){
      updatePaddle(); // still move paddle while idle
    }
  }

  window._brickStart=function(){
    if(rafId) return;
    resize();   // read real CSS dimensions before first frame
    reset();
    loop();
  };

  window._brickStop=function(){
    if(rafId){ cancelAnimationFrame(rafId); rafId=null; }
    showCursor();
    state='idle';
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
    winMsg.classList.remove('show');
  };

})();
