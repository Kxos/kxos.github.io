export function initBrickPreview() {
  const cv = document.getElementById('bb-preview-canvas');
  if (!cv) return;
  const cx = cv.getContext('2d');

  const PINK = '#ff2d78', VIOLET = '#b44fff', CYAN = '#00f5ff', GOLD = '#ffd93d', BG = '#020108';
  const BRICK_COLORS = [PINK, VIOLET, CYAN, GOLD, '#ff6baf', CYAN, VIOLET];

  const COLS = 6, ROWS = 3, BGAP = 2;
  const BRICK_TOP = 0.10, BRICK_H = 0.08;
  const PADDLE_H = 0.045, PADDLE_W = 0.36, PADDLE_Y = 0.88, BALL_R = 0.032;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

  let W, H, bricks = [], ball = {}, paddle = {}, visible = false;

  // Pause when cabinet is scrolled out of view
  const obs = new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 });
  obs.observe(cv);

  function resize() {
    W = cv.offsetWidth; H = cv.offsetHeight;
    cv.width = W; cv.height = H;
    init();
  }

  function makeBricks() {
    bricks = [];
    const bw = (W - BGAP * (COLS + 1)) / COLS;
    const bh = H * BRICK_H;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        bricks.push({ x: BGAP + c * (bw + BGAP), y: H * BRICK_TOP + r * (bh + BGAP), w: bw, h: bh, col: BRICK_COLORS[r % BRICK_COLORS.length] });
  }

  function init() {
    makeBricks();
    const spd = W * 0.022, ang = -Math.PI / 2 + 0.38;
    ball = { x: W * .38, y: H * PADDLE_Y - W * BALL_R - 2, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: W * BALL_R, trail: [] };
    paddle = { x: W * .5 - W * PADDLE_W / 2, y: H * PADDLE_Y, w: W * PADDLE_W, h: H * PADDLE_H, tx: W * .5 - W * PADDLE_W / 2 };
  }

  function step() {
    // paddle AI lerp
    paddle.tx = Math.max(0, Math.min(W - paddle.w, ball.x - paddle.w / 2));
    paddle.x += (paddle.tx - paddle.x) * 0.12;

    // trail
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 6) ball.trail.shift();

    ball.x += ball.vx; ball.y += ball.vy;

    if (ball.x - ball.r <= 0)  { ball.x = ball.r;     ball.vx =  Math.abs(ball.vx); }
    if (ball.x + ball.r >= W)  { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
    if (ball.y - ball.r <= 0)  { ball.y = ball.r;     ball.vy =  Math.abs(ball.vy); }

    // paddle bounce
    if (ball.vy > 0 && ball.x + ball.r > paddle.x && ball.x - ball.r < paddle.x + paddle.w &&
        ball.y + ball.r >= paddle.y && ball.y - ball.r < paddle.y + paddle.h) {
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const spd = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      ball.vx = Math.sin(hit * (Math.PI / 3.5)) * spd;
      ball.vy = -Math.abs(Math.cos(hit * (Math.PI / 3.5)) * spd);
      ball.y  = paddle.y - ball.r - 1;
    }

    // brick bounce (no destruction)
    for (const b of bricks) {
      if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
        const overX = ball.vx > 0 ? (ball.x + ball.r) - b.x : b.x + b.w - (ball.x - ball.r);
        const overY = ball.vy > 0 ? (ball.y + ball.r) - b.y : b.y + b.h - (ball.y - ball.r);
        if (overX < overY) ball.vx *= -1; else ball.vy *= -1;
        break;
      }
    }
    if (ball.y - ball.r > H) init();
  }

  // Grid path built once per resize
  let gridPath = null;
  function buildGrid() {
    gridPath = new Path2D();
    const gs = Math.round(W / 8);
    for (let x = 0; x <= W; x += gs) { gridPath.moveTo(x, 0); gridPath.lineTo(x, H); }
    for (let y = 0; y <= H; y += gs) { gridPath.moveTo(0, y); gridPath.lineTo(W, y); }
  }

  function draw() {
    cx.fillStyle = BG; cx.fillRect(0, 0, W, H);

    // grid — single stroke call
    if (gridPath) { cx.strokeStyle = 'rgba(180,79,255,.08)'; cx.lineWidth = 0.5; cx.stroke(gridPath); }

    // bricks — grouped by color to minimize state changes
    const byColor = {};
    bricks.forEach(b => { (byColor[b.col] = byColor[b.col] || []).push(b); });
    Object.entries(byColor).forEach(([col, list]) => {
      if (!isMobile) { cx.shadowColor = col; cx.shadowBlur = 6; }
      cx.fillStyle = col; cx.globalAlpha = 0.85;
      list.forEach(b => { cx.beginPath(); cx.roundRect(b.x, b.y, b.w, b.h, 2); cx.fill(); });
      // highlights
      cx.shadowBlur = 0; cx.globalAlpha = 0.25; cx.fillStyle = '#fff';
      list.forEach(b => cx.fillRect(b.x + 2, b.y + 1, b.w - 4, 2));
      cx.globalAlpha = 1;
    });
    cx.shadowBlur = 0;

    // paddle
    cx.save();
    if (!isMobile) { cx.shadowColor = CYAN; cx.shadowBlur = 12; }
    const pg = cx.createLinearGradient(paddle.x, 0, paddle.x + paddle.w, 0);
    pg.addColorStop(0, '#7bf5ff'); pg.addColorStop(.5, CYAN); pg.addColorStop(1, '#7bf5ff');
    cx.fillStyle = pg;
    cx.beginPath(); cx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, paddle.h / 2); cx.fill();
    cx.globalAlpha = 0.3; cx.fillStyle = CYAN; cx.fillRect(paddle.x + 4, paddle.y + paddle.h, paddle.w - 8, 3);
    cx.restore();

    // ball trail
    ball.trail.forEach((t, i) => {
      const a = (i / ball.trail.length) * 0.3;
      cx.beginPath(); cx.arc(t.x, t.y, ball.r * (i / ball.trail.length) * 0.7, 0, Math.PI * 2);
      cx.fillStyle = `rgba(0,245,255,${a})`; cx.fill();
    });

    // ball
    cx.save();
    if (!isMobile) { cx.shadowColor = 'rgba(0,245,255,.9)'; cx.shadowBlur = 10; }
    const bg = cx.createRadialGradient(ball.x - ball.r * .3, ball.y - ball.r * .3, 0, ball.x, ball.y, ball.r);
    bg.addColorStop(0, '#fff'); bg.addColorStop(.5, '#7bf5ff'); bg.addColorStop(1, CYAN);
    cx.fillStyle = bg; cx.beginPath(); cx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); cx.fill();
    cx.restore();
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!visible || document.body.classList.contains('game-fullscreen-active')) return;
    draw(); step();
  }

  function start() {
    if (!cv.offsetWidth) { setTimeout(start, 50); return; }
    resize();
    buildGrid();
    new ResizeObserver(() => { resize(); buildGrid(); }).observe(cv);
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}
