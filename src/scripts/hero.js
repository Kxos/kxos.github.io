export function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const hero = document.getElementById('hero');

  let W, H, mx = 0, my = 0, frame = 0;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mx = 0; my = 0; });

  // ── STARS ──
  const STAR_COUNT = 100;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(), y: Math.random() * .6,
    r: Math.random() * 1.4 + .3,
    blink: Math.random() * Math.PI * 2,
    speed: Math.random() * .0003 + .0001,
    ox: 0, oy: 0, vx: 0, vy: 0,
  }));

  // ── PARTICLES ──
  const particles = [];
  let lastSpawn = 0;
  function spawnParticle(px, py) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = Math.random() * 1.2 + .3;
    particles.push({
      x: px, y: py,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - .8,
      life: 1, decay: .012 + Math.random() * .018,
      r: Math.random() * 2.5 + 1,
      hue: Math.random() < .5 ? '255,45,120' : '0,245,255',
    });
  }
  hero.addEventListener('mousemove', e => {
    if (Date.now() - lastSpawn < 50) return; // throttled from 40→50ms
    lastSpawn = Date.now();
    const r = hero.getBoundingClientRect();
    for (let i = 0; i < 2; i++) spawnParticle(e.clientX - r.left, e.clientY - r.top); // 3→2
  }, { passive: true });

  // ── RIPPLES ──
  const ripples = [];
  hero.addEventListener('click', e => {
    const r = hero.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top,
      radius: 0, maxR: 180, life: 1,
      color: Math.random() < .5 ? '255,45,120' : '0,245,255' });
  });

  // Pre-allocated aurora gradient — only recreated on mouse move > threshold
  let auraX = -1, auraY = -1, auraGrad = null;

  function draw() {
    // skip rendering when a game is fullscreen (saves CPU for the game)
    if (document.body.classList.contains('game-fullscreen-active')) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    frame++;

    // ── Stars — batched by glow state to minimize shadowBlur toggling ──
    const ATTRACT_R = 120, MAX_DRIFT = 140;
    const glowStars = [], normalStars = [];

    stars.forEach(s => {
      const sx = s.x * W, sy = s.y * H;
      const odx = mx - sx, ody = my - sy;
      const originDist = Math.sqrt(odx * odx + ody * ody);
      const driftDist  = Math.sqrt(s.ox * s.ox + s.oy * s.oy);

      if (originDist < ATTRACT_R && driftDist < MAX_DRIFT) {
        const tdx = mx - (sx + s.ox), tdy = my - (sy + s.oy);
        s.vx += tdx * .0014; s.vy += tdy * .0014;
        s.vx *= .92; s.vy *= .92;
      } else {
        s.vx = s.vx * .96 - s.ox * .004;
        s.vy = s.vy * .96 - s.oy * .004;
      }
      s.ox += s.vx; s.oy += s.vy;

      const px = sx + s.ox, py = sy + s.oy;
      const b  = .5 + .5 * Math.sin(s.blink + frame * s.speed * 60);
      const cd = Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
      const ng = Math.max(0, 1 - cd / 60);

      if (ng > .15) glowStars.push({ px, py, r: s.r * (1 + ng * .8), ng, b });
      else          normalStars.push({ px, py, r: s.r, b });
    });

    // normal stars — one shadowBlur=0 pass
    ctx.shadowBlur = 0;
    normalStars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.px, s.py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,236,255,${.15 + .55 * s.b})`;
      ctx.fill();
    });

    // glow stars — one shadowBlur pass, reset once
    if (glowStars.length) {
      ctx.shadowColor = '#00f5ff';
      glowStars.forEach(s => {
        ctx.shadowBlur = 10 * s.ng;
        ctx.beginPath();
        ctx.arc(s.px, s.py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,245,255,${.5 + s.ng * .4})`;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }

    // ── Aurora — reuse gradient if mouse hasn't moved much ──
    if (mx > 0 || my > 0) {
      const dx = mx - auraX, dy = my - auraY;
      if (dx * dx + dy * dy > 100 || !auraGrad) {
        auraX = mx; auraY = my;
        auraGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
        const hue = Math.sin(frame * .008) > 0 ? '255,45,120' : '76,201,240';
        auraGrad.addColorStop(0,  `rgba(${hue},.07)`);
        auraGrad.addColorStop(.4, `rgba(${hue},.03)`);
        auraGrad.addColorStop(1,  'transparent');
      }
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Particles ──
    ctx.shadowColor = '';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += .04; p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, Math.PI * 2);
      ctx.shadowBlur  = 6 * p.life;
      ctx.shadowColor = `rgb(${p.hue})`;
      ctx.fillStyle   = `rgba(${p.hue},${p.life * .8})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // ── Ripples ──
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.radius += (rp.maxR - rp.radius) * .06 + .8;
      rp.life   -= .025;
      if (rp.life <= 0) { ripples.splice(i, 1); continue; }
      ctx.shadowColor = `rgb(${rp.color})`; ctx.shadowBlur = 12 * rp.life;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rp.color},${rp.life * .6})`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.radius * .55, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rp.color},${rp.life * .3})`; ctx.lineWidth = 1; ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
}
