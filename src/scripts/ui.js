export function initUI() {

  // ── EMAIL ──
  const m = 'mailto:' + ['vito.iannone90', 'gmail.com'].join('@');
  ['contact-email', 'social-email', 'meta-email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = m;
  });

  // ── NAV scroll stuck ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('stuck', scrollY > 60), { passive: true });

  // ── CURSOR (desktop only) ──
  if (window.matchMedia('(pointer:fine)').matches) {
    const curEl   = document.getElementById('cursor');
    const curRing = document.getElementById('cur-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      curEl.style.transform = `translate(${mx}px,${my}px)`;
    });
    (function animCur() {
      rx += (mx - rx) * .12; ry += (my - ry) * .12;
      curRing.style.left = rx + 'px'; curRing.style.top = ry + 'px';
      requestAnimationFrame(animCur);
    })();
  }

  // ── SCROLL REVEAL ──
  const srObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 80);
        srObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.sr,.sr-left,.titem,.pcard,.sbar').forEach(el => srObs.observe(el));

  // ── SKILL BARS ──
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const f = e.target.querySelector('.sbar-fill');
        if (f) setTimeout(() => { f.style.width = f.dataset.w + '%'; setTimeout(() => f.classList.add('done'), 1400); }, 250);
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.sbar').forEach(el => barObs.observe(el));

  // ── PARALLAX BLOBS (desktop only) ──
  if (window.matchMedia('(pointer:fine)').matches) {
    const blobs = [...document.querySelectorAll('.blob')];
    window.addEventListener('mousemove', e => {
      const dx = e.clientX / innerWidth  - .5;
      const dy = e.clientY / innerHeight - .5;
      blobs.forEach((b, i) => { const f = (i + 1) * 10; b.style.transform = `translate(${dx * f}px,${dy * f}px)`; });
    }, { passive: true });
  }

  // ── HERO NAME SPOTLIGHT ──
  const fn = document.querySelector('.hero-name .fn');
  const ln = document.querySelector('.hero-name .ln');
  if (fn && ln) {
    const R = 120;
    fn.addEventListener('mousemove', e => {
      const r = fn.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width * 100;
      const py = (e.clientY - r.top)  / r.height * 100;
      fn.style.backgroundImage = `radial-gradient(circle ${R}px at ${px}% ${py}%, #00f5ff 0%, #b44fff 40%, var(--text) 100%)`;
    });
    fn.addEventListener('mouseleave', () => {
      fn.style.backgroundImage = 'linear-gradient(90deg, var(--text) 0%, var(--text) 100%)';
    });
    ln.addEventListener('mousemove', e => {
      const r = ln.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width * 100;
      const py = (e.clientY - r.top)  / r.height * 100;
      ln.style.backgroundImage =
        `radial-gradient(circle ${R}px at ${px}% ${py}%, rgba(255,255,255,.95) 0%, rgba(0,245,255,.4) 30%, transparent 65%),
         linear-gradient(90deg, var(--pink) 0%, var(--violet) 50%, var(--cyan) 100%)`;
    });
    ln.addEventListener('mouseleave', () => {
      ln.style.backgroundImage = 'linear-gradient(90deg, var(--pink) 0%, var(--violet) 50%, var(--cyan) 100%)';
    });
  }

  // ── SKILL TAG mouse-local glow ──
  document.querySelectorAll('.stag').forEach(tag => {
    tag.addEventListener('mousemove', e => {
      const r = tag.getBoundingClientRect();
      tag.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100) + '%');
      tag.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });

  // ── AMBIENT FLOATING PARTICLES (section canvases) ──
  // Uses IntersectionObserver to only run rAF when section is visible
  document.querySelectorAll('.section-canvas').forEach(canvas => {
    const sec = canvas.closest('section');
    if (!sec) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, visible = false;

    function resize() {
      W = canvas.width  = sec.offsetWidth;
      H = canvas.height = sec.offsetHeight;
      dots.forEach(d => { d.x = Math.min(d.x, W); d.y = Math.min(d.y, H); });
    }

    const dots = [];
    function initDots() {
      dots.length = 0;
      for (let i = 0; i < 14; i++) dots.push({ // 18→14
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .22,
        r: Math.random() * 1.2 + .4,
        blink: Math.random() * Math.PI * 2,
        color: Math.random() < .5 ? '255,45,120' : '76,201,240',
      });
    }

    resize(); initDots();
    new ResizeObserver(resize).observe(sec);

    // only animate when section is in viewport
    const visObs = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 });
    visObs.observe(sec);

    let smx = -999, smy = -999, f = 0;
    sec.addEventListener('mousemove', e => {
      const r = sec.getBoundingClientRect();
      smx = e.clientX - r.left; smy = e.clientY - r.top;
    }, { passive: true });
    sec.addEventListener('mouseleave', () => { smx = -999; smy = -999; });

    (function draw() {
      if (!canvas.isConnected) return;
      requestAnimationFrame(draw);
      if (!visible || document.body.classList.contains('game-fullscreen-active')) return;
      ctx.clearRect(0, 0, W, H);
      f++;

      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        if (smx > 0) {
          const ddx = d.x - smx, ddy = d.y - smy;
          const dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < 90 && dd > 0) { const force = (1 - dd / 90) * .35; d.x += (ddx / dd) * force; d.y += (ddy / dd) * force; }
        }
        const b = .2 + .25 * Math.sin(d.blink + f * .018);
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.color},${b})`; ctx.fill();
      });

      if (smx > 0) {
        const g = ctx.createRadialGradient(smx, smy, 0, smx, smy, 180);
        g.addColorStop(0, 'rgba(180,79,255,.04)'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    })();
  });

  // ── SECTION GLOW LINE ──
  document.querySelectorAll('section').forEach(sec => {
    sec.addEventListener('mousemove', e => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty('--glow-origin', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    });
  });
}
