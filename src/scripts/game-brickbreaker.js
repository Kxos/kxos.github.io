export function initBrickBreaker() {
  const canvas   = document.getElementById('bb-canvas');
  if (!canvas) return;
  const ctx      = canvas.getContext('2d');
  const startMsg = document.getElementById('bb-start-msg');
  const overMsg  = document.getElementById('bb-over-msg');
  const winMsg   = document.getElementById('bb-win-msg');
  const scoreDis = document.getElementById('bb-score-display');
  const btnLeft  = document.getElementById('bb-btn-left');
  const btnRight = document.getElementById('bb-btn-right');

  const C = {
    bg:'#04020e', grid:'rgba(180,79,255,.06)', sun:'#ff2d78',
    paddle:'#00f5ff', ballGlow:'rgba(0,245,255,.8)', score:'#00f5ff', hiscore:'#ff2d78',
    rows:[
      {fill:'#ff2d78',shadow:'#ff2d78'},{fill:'#ff6baf',shadow:'#ff6baf'},
      {fill:'#b44fff',shadow:'#b44fff'},{fill:'#7b2fff',shadow:'#7b2fff'},
      {fill:'#00f5ff',shadow:'#00f5ff'},{fill:'#7bf5ff',shadow:'#7bf5ff'},
      {fill:'#ffd93d',shadow:'#ffd93d'},
    ],
  };

  // ── AUDIO — shared AudioContext ──
  let _ac = null;
  function ac() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    return _ac;
  }
  function tone(type, f0, f1, dur, gain, t = 0) {
    try {
      const a = ac(), o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination); o.type = type;
      o.frequency.setValueAtTime(f0, a.currentTime + t);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, a.currentTime + t + dur);
      g.gain.setValueAtTime(gain, a.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t + dur);
      o.start(a.currentTime + t); o.stop(a.currentTime + t + dur + .01);
    } catch(e) {}
  }
  function snd_hit(ri)     { const f=[880,740,660,554,440,370,330][ri%7]; tone('square',f,f*.5,.13,.18); }
  function snd_paddle()    { tone('sine',300,180,.09,.22); }
  function snd_wall()      { tone('triangle',200,120,.08,.12); }
  function snd_die()       { [440,330,220,110].forEach((f,i)=>tone('sawtooth',f,null,.13,.16,i*.09)); }
  function snd_win()       { [440,554,659,880,1108].forEach((f,i)=>tone('square',f,null,.18,.13,i*.09)); }
  function snd_milestone() { [660,880,1108].forEach((f,i)=>tone('square',f,null,.14,.1,i*.07)); }

  let W, H, DPR = 1;
  let state = 'idle', score = 0, hiscore = 0, lives = 3, level = 1;
  let frame = 0, rafId = null, hitCount = 0;
  let paddle = {}, ball = {}, bricks = [], particles = [], stars = [];

  const BRICK_ROWS = 7, BRICK_COLS = 10, BRICK_PAD = 4, BRICK_TOP = 0.12;

  // ── Cached draw objects — rebuilt on resize ──
  let gridPath = null, sunGlowGrad = null, sunBodyGrad = null;
  let sunSx = 0, sunSy = 0, sunSr = 0;

  function buildCachedDrawables() {
    // Grid as single Path2D
    gridPath = new Path2D();
    const gs = Math.round(W / 20);
    for (let x = 0; x < W; x += gs) { gridPath.moveTo(x, 0); gridPath.lineTo(x, H); }
    for (let y = 0; y < H; y += gs) { gridPath.moveTo(0, y); gridPath.lineTo(W, y); }

    // Sun gradients
    sunSx = W / 2; sunSy = H * .04; sunSr = H * .07;
    sunGlowGrad = ctx.createRadialGradient(sunSx, sunSy, 0, sunSx, sunSy, sunSr * 2);
    sunGlowGrad.addColorStop(0, 'rgba(255,45,120,.6)');
    sunGlowGrad.addColorStop(.5, 'rgba(180,79,255,.2)');
    sunGlowGrad.addColorStop(1, 'transparent');
    sunBodyGrad = ctx.createLinearGradient(sunSx - sunSr, 0, sunSx + sunSr, 0);
    sunBodyGrad.addColorStop(0, '#ff2d78'); sunBodyGrad.addColorStop(.5, '#ffd93d'); sunBodyGrad.addColorStop(1, '#ff2d78');

    // Brick row gradients cached per row
    bricks.forEach(b => {
      if (b._grad && b._gradW === b.w) return; // skip if unchanged
      b._grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
      b._grad.addColorStop(0, b.col.fill); b._grad.addColorStop(1, b.col.shadow + '99');
      b._gradW = b.w;
    });
  }

  function initStars() {
    stars = Array.from({length: 60}, () => ({ // 80→60
      x: Math.random() * W, y: Math.random() * (H * .55),
      r: Math.random() * 1.2 + .3, b: Math.random() * Math.PI * 2, s: Math.random() * .0004 + .0001,
    }));
  }

  function initBricks() {
    bricks = [];
    const bw = (W - BRICK_PAD * (BRICK_COLS + 1)) / BRICK_COLS;
    const bh = Math.min(18, (H * .38) / BRICK_ROWS - BRICK_PAD);
    const topY = H * BRICK_TOP;
    for (let r = 0; r < BRICK_ROWS; r++) {
      const col = C.rows[r % C.rows.length];
      const hp  = r < 2 ? 2 : 1;
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({ x: BRICK_PAD + c * (bw + BRICK_PAD), y: topY + r * (bh + BRICK_PAD), w: bw, h: bh, alive: true, hp, maxHp: hp, col, flashTimer: 0 });
      }
    }
  }

  function initPaddle() {
    const pw = Math.min(100, W * .18);
    paddle = { w: pw, h: Math.max(10, H * .022), x: W / 2 - pw / 2, y: H - H * .08 };
  }

  function ballSpeed() { return Math.min(W, H) * .014 * (1 + (level - 1) * .2); }

  function initBall() {
    const spd = ballSpeed(), ang = -Math.PI / 2 + (Math.random() - .5) * .5;
    ball = { x: W / 2, y: paddle.y - 12, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: Math.max(6, W * .012), stuck: true, trail: [] };
  }

  function reset(keepLevel = false) {
    score = 0; lives = 3; hitCount = 0;
    if (!keepLevel) level = 1;
    state = 'idle'; frame = 0; particles = [];
    initStars(); initPaddle(); initBricks(); buildCachedDrawables(); initBall();
    startMsg.classList.remove('hidden'); overMsg.classList.remove('show'); winMsg.classList.remove('show');
    if (scoreDis) scoreDis.textContent = '00000';
  }

  function nextLevel() {
    level++; particles = [];
    initPaddle(); initBricks(); buildCachedDrawables(); initBall();
    state = 'idle';
    startMsg.classList.remove('hidden'); overMsg.classList.remove('show'); winMsg.classList.remove('show');
  }

  function resize() {
    DPR = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width  || canvas.offsetWidth  || 600;
    const ch = rect.height || canvas.offsetHeight || 420;
    canvas.width  = Math.round(cw * DPR);
    canvas.height = Math.round(ch * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    W = cw; H = ch;
    initStars(); initPaddle(); initBricks(); buildCachedDrawables(); initBall();
  }
  window._brickResize = resize;
  window.addEventListener('resize', () => { if (rafId) resize(); }, { passive: true });

  // ── INPUT ──
  let mouseX = -1;
  const curDot  = document.getElementById('cur-dot');
  const curRing = document.getElementById('cur-ring');
  function hideCursor() { if (curDot) curDot.style.opacity = '0'; if (curRing) curRing.style.opacity = '0'; }
  function showCursor() { if (curDot) curDot.style.opacity = ''; if (curRing) curRing.style.opacity = ''; }
  canvas.addEventListener('mouseenter', hideCursor);
  canvas.addEventListener('mouseleave', () => { mouseX = -1; showCursor(); });
  canvas.addEventListener('mousemove',  e => { const r = canvas.getBoundingClientRect(); mouseX = e.clientX - r.left; });
  canvas.addEventListener('touchstart', e => { hideCursor(); e.preventDefault(); const r = canvas.getBoundingClientRect(); mouseX = e.touches[0].clientX - r.left; if (state==='idle') launch(); else if (state==='dead') reset(); else if (state==='win') nextLevel(); }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); mouseX = e.touches[0].clientX - r.left; }, { passive: false });
  canvas.addEventListener('touchend',   () => showCursor(), { passive: true });

  // Mobile buttons
  let mobileDir = 0, mobileRaf = null;
  function startMove(dir) {
    mobileDir = dir; if (mobileRaf) return;
    (function step() {
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x + mobileDir * paddle.w * .12));
      if (ball.stuck) ball.x = paddle.x + paddle.w / 2;
      mobileRaf = requestAnimationFrame(step);
    })();
  }
  function stopMove() { mobileDir = 0; if (mobileRaf) { cancelAnimationFrame(mobileRaf); mobileRaf = null; } }

  [btnLeft, btnRight].forEach((btn, side) => {
    if (!btn) return;
    const dir = side === 0 ? -1 : 1;
    btn.addEventListener('touchstart', e => { e.preventDefault(); startMove(dir); }, { passive: false });
    btn.addEventListener('touchend',   e => { e.preventDefault(); stopMove(); }, { passive: false });
    btn.addEventListener('mousedown',  () => startMove(dir));
    btn.addEventListener('mouseup',    stopMove);
    btn.addEventListener('mouseleave', stopMove);
  });

  window.addEventListener('keydown', e => {
    if (!canvas.closest('.game-inner')?.classList.contains('active')) return;
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (state === 'idle') launch(); else if (state === 'dead') reset(); else if (state === 'win') nextLevel();
    }
  });

  function launch() { if (state !== 'idle') return; state = 'running'; ball.stuck = false; startMsg.classList.add('hidden'); }

  // ── PARTICLES ──
  function spawnBrickParticles(bx, by, bw, bh, col) {
    for (let i = 0; i < 10; i++) { // 14→10
      const ang = Math.random() * Math.PI * 2, spd = Math.random() * 3 + 1;
      particles.push({ x: bx+bw/2, y: by+bh/2, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd-1, r: Math.random()*3+1, life:1, decay:.025+Math.random()*.02, color: col.fill });
    }
  }
  function spawnPaddleParticles() {
    for (let i = 0; i < 5; i++) { // 6→5
      const ang = -Math.PI/2+(Math.random()-.5)*Math.PI, spd = Math.random()*2.5+.5;
      particles.push({ x: ball.x, y: ball.y, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd, r: Math.random()*2+1, life:1, decay:.04, color:'#00f5ff' });
    }
  }

  // ── DRAW ──
  function drawBg() {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    // grid — single Path2D stroke
    if (gridPath) { ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.stroke(gridPath); }
    // sun glow
    ctx.fillStyle = sunGlowGrad; ctx.beginPath(); ctx.arc(sunSx, sunSy, sunSr * 2, 0, Math.PI * 2); ctx.fill();
    // sun body
    ctx.fillStyle = sunBodyGrad; ctx.shadowColor = '#ff2d78'; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(sunSx, sunSy, sunSr, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    // sun stripes clipped
    ctx.save(); ctx.beginPath(); ctx.arc(sunSx, sunSy, sunSr, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = C.bg;
    for (let i = 0; i < 6; i++) ctx.fillRect(sunSx - sunSr, sunSy + sunSr * .25 + i * sunSr * .145, sunSr * 2, sunSr * .07);
    ctx.restore();
    // stars — no per-star shadowBlur
    frame++;
    stars.forEach(s => {
      const b = .3 + .4 * Math.sin(s.b + frame * s.s * 60);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,236,255,${b})`; ctx.fill();
    });
  }

  function drawBricks() {
    // Group flashing bricks separately; batch by color for normal ones
    const byColor = {};
    bricks.forEach(b => {
      if (!b.alive) return;
      if (b.flashTimer > 0) { b.flashTimer = Math.max(0, b.flashTimer - .12); }
      const key = b.col.fill + (b.flashTimer > 0 ? '_f' : '');
      (byColor[key] = byColor[key] || []).push(b);
    });
    Object.entries(byColor).forEach(([, list]) => {
      const b0 = list[0], flashing = b0.flashTimer > 0;
      ctx.shadowColor = b0.col.shadow; ctx.shadowBlur = 8;
      list.forEach(b => {
        const alpha = flashing ? .4 + .6 * Math.sin(b.flashTimer * Math.PI) : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = b._grad || b.col.fill;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 3); ctx.fill();
        if (b.hp === 2) { // hp stripe
          ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.35)';
          ctx.fillRect(b.x + 4, b.y + b.h * .3, b.w - 8, b.h * .12); ctx.shadowBlur = 8;
        }
      });
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  function drawPaddle() {
    const {x, y, w, h} = paddle;
    const grd = ctx.createLinearGradient(x, y, x + w, y + h);
    grd.addColorStop(0, 'rgba(0,245,255,0)'); grd.addColorStop(.5, 'rgba(0,245,255,.35)'); grd.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = grd; ctx.fillRect(x, y + h, w, 6);
    const pg = ctx.createLinearGradient(x, y, x + w, y + h);
    pg.addColorStop(0, '#7bf5ff'); pg.addColorStop(.5, '#00f5ff'); pg.addColorStop(1, '#7bf5ff');
    ctx.shadowColor = C.paddle; ctx.shadowBlur = 16; ctx.fillStyle = pg;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
  }

  function drawBall() {
    ball.trail.forEach((t, i) => {
      ctx.beginPath(); ctx.arc(t.x, t.y, ball.r * (i / ball.trail.length) * .7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,255,${(i / ball.trail.length) * .35})`; ctx.fill();
    });
    const bg = ctx.createRadialGradient(ball.x - ball.r * .3, ball.y - ball.r * .3, 0, ball.x, ball.y, ball.r);
    bg.addColorStop(0, '#fff'); bg.addColorStop(.5, '#7bf5ff'); bg.addColorStop(1, '#00f5ff');
    ctx.shadowColor = C.ballGlow; ctx.shadowBlur = 20;
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.life * .85; ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawHeart(cx, cy, size, alpha) {
    const s = size * .5;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#ff2d78'; ctx.shadowColor = '#ff2d78'; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * .35);
    ctx.bezierCurveTo(cx, cy - s*.1, cx - s, cy - s*.6, cx - s, cy - s*.15);
    ctx.bezierCurveTo(cx - s, cy + s*.4, cx, cy + s*.85, cx, cy + s*.85);
    ctx.bezierCurveTo(cx, cy + s*.85, cx + s, cy + s*.4, cx + s, cy - s*.15);
    ctx.bezierCurveTo(cx + s, cy - s*.6, cx, cy - s*.1, cx, cy + s*.35);
    ctx.fill();
    ctx.globalAlpha = alpha * .4; ctx.fillStyle = '#ff9fc5'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(cx - s * .27, cy - s * .05, s * .38, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawHUD() {
    const fs = Math.max(9, W * .013);
    ctx.font = `bold ${fs}px 'Share Tech Mono',monospace`;
    ctx.fillStyle = C.hiscore; ctx.shadowColor = C.hiscore; ctx.shadowBlur = 5;
    ctx.fillText('HI ' + String(hiscore).padStart(5,'0'), W - 200, H * .065); ctx.shadowBlur = 0;
    ctx.fillStyle = C.score; ctx.shadowColor = C.score; ctx.shadowBlur = 5;
    ctx.fillText('SCORE ' + String(score).padStart(5,'0'), W - 100, H * .065); ctx.shadowBlur = 0;
    if (scoreDis) scoreDis.textContent = String(score).padStart(5,'0');
    const hs = Math.max(10, W * .022), hy = H * .055, hg = hs * 1.5;
    for (let i = 0; i < 3; i++) drawHeart(12 + hs * .5 + i * hg, hy, hs, i < lives ? 1 : .18);
    ctx.fillStyle = 'rgba(180,79,255,.9)'; ctx.shadowColor = '#b44fff'; ctx.shadowBlur = 6;
    ctx.fillText('LV ' + level, W / 2 - 14, H * .065); ctx.shadowBlur = 0;
  }

  // ── PHYSICS ──
  const MAX_SPD = 2.2;
  function boostBall() {
    const max = ballSpeed() * MAX_SPD, cur = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (cur < max) { const b = Math.min(1.06, max / cur); ball.vx *= b; ball.vy *= b; }
    hitCount++;
  }

  function updatePaddle() {
    if (mouseX >= 0) paddle.x = mouseX - paddle.w / 2;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
    if (ball.stuck) { ball.x = paddle.x + paddle.w / 2; ball.y = paddle.y - ball.r - 2; }
  }

  function updateBall() {
    if (ball.stuck) return;
    ball.trail.push({ x: ball.x, y: ball.y }); if (ball.trail.length > 8) ball.trail.shift();
    ball.x += ball.vx; ball.y += ball.vy;
    if (ball.x - ball.r <= 0)  { ball.x = ball.r;     ball.vx =  Math.abs(ball.vx); snd_wall(); }
    if (ball.x + ball.r >= W)  { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); snd_wall(); }
    if (ball.y - ball.r <= 0)  { ball.y = ball.r;     ball.vy =  Math.abs(ball.vy); snd_wall(); }
    // paddle
    if (ball.vy > 0 && ball.x + ball.r > paddle.x && ball.x - ball.r < paddle.x + paddle.w && ball.y + ball.r >= paddle.y && ball.y - ball.r < paddle.y + paddle.h) {
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const spd = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      ball.vx = Math.sin(hit * (Math.PI / 3)) * spd; ball.vy = -Math.abs(Math.cos(hit * (Math.PI / 3)) * spd);
      ball.y = paddle.y - ball.r - 1; boostBall(); snd_paddle(); spawnPaddleParticles();
    }
    // bricks
    for (const b of bricks) {
      if (!b.alive) continue;
      if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
        b.hp--; b.flashTimer = 1;
        if (b.hp <= 0) { b.alive = false; spawnBrickParticles(b.x, b.y, b.w, b.h, b.col); score += 10 * level; hiscore = Math.max(hiscore, score); if (score % 500 === 0 && score > 0) snd_milestone(); }
        snd_hit(bricks.indexOf(b) % C.rows.length); boostBall();
        const ox = ball.vx > 0 ? (ball.x + ball.r) - b.x : b.x + b.w - (ball.x - ball.r);
        const oy = ball.vy > 0 ? (ball.y + ball.r) - b.y : b.y + b.h - (ball.y - ball.r);
        if (Math.abs(ox) < Math.abs(oy)) ball.vx *= -1; else ball.vy *= -1;
        break;
      }
    }
    if (ball.y - ball.r > H) {
      lives--; snd_die();
      if (lives <= 0) { state = 'dead'; overMsg.classList.add('show'); }
      else { initBall(); state = 'idle'; startMsg.classList.remove('hidden'); }
    }
    if (bricks.every(b => !b.alive)) { state = 'win'; snd_win(); winMsg.classList.add('show'); }
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    drawBg(); drawBricks(); drawParticles(); drawPaddle(); drawBall(); drawHUD();
    if (state === 'running') {
      updatePaddle(); updateBall();
      particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .06; p.life -= p.decay; });
      particles = particles.filter(p => p.life > 0);
    } else if (state === 'idle') {
      updatePaddle();
    }
  }

  window._brickStart = function () { if (rafId) return; resize(); reset(); loop(); };
  window._brickStop  = function () { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } showCursor(); state = 'idle'; startMsg.classList.remove('hidden'); overMsg.classList.remove('show'); winMsg.classList.remove('show'); };
}
