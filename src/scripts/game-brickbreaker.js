// game-brickbreaker.js
// Main thread: solo rendering. Fisica su Web Worker.
// Mobile: canvas ridotto, niente glow, 30fps

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

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  const MAX_DPR  = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const TARGET_FPS = isMobile ? 30 : 60;
  const TICK_MS    = 1000 / TARGET_FPS;
  let lastTs = 0;

  // ── AUDIO (main thread) ──
  let _ac = null;
  function ac() { if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)(); if(_ac.state==='suspended')_ac.resume(); return _ac; }
  function tone(type,f0,f1,dur,gain,t=0){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type=type;o.frequency.setValueAtTime(f0,a.currentTime+t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,a.currentTime+t+dur);g.gain.setValueAtTime(gain,a.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+t+dur);o.start(a.currentTime+t);o.stop(a.currentTime+t+dur+.01);}catch(e){}}
  const HIT_FREQS = [880,740,660,554,440,370,330];
  function snd_hit(ri)     { tone('square', HIT_FREQS[ri%7], HIT_FREQS[ri%7]*.5, .13, .18); }
  function snd_paddle()    { tone('sine',300,180,.09,.22); }
  function snd_wall()      { tone('triangle',200,120,.08,.12); }
  function snd_die()       { [440,330,220,110].forEach((f,i)=>tone('sawtooth',f,null,.12,.14,i*.08)); }
  function snd_win()       { [440,554,659,880,1108].forEach((f,i)=>tone('square',f,null,.16,.12,i*.08)); }

  // ── STATE (render-only, mirrored from worker) ──
  let W = 0, H = 0, DPR = 1, rafId = null, workerRaf = null;
  let renderState = null; // last frame from worker
  let bgCanvas = null;
  let mobileDir = 0, mouseX = -1;
  let uiState = 'idle'; // tracks what messages to show

  // ── WEB WORKER ──
  let worker = null;
  function createWorker() {
    // Use blob URL to avoid needing a separate file served at a specific path
    const workerCode = `
const ROW_COLORS=['#ff2d78','#ff6baf','#b44fff','#7b2fff','#00f5ff','#7bf5ff','#ffd93d'];
let W=0,H=0,level=1,score=0,hiscore=0,lives=3,hitCount=0,state='idle';
let paddle={},ball={},bricks=[];
const BR=5,BC=8,BP=3,BT=0.12;
function bspd(){return Math.min(W,H)*0.016*(1+(level-1)*0.2);}
function iPaddle(){const pw=Math.min(90,W*.18);paddle={w:pw,h:Math.max(10,H*.022),x:W/2-pw/2,y:H-H*.08};}
function iBricks(){bricks=[];const bw=(W-BP*(BC+1))/BC,bh=Math.min(14,(H*.35)/BR-BP),ty=H*BT;for(let r=0;r<BR;r++){const ci=r%ROW_COLORS.length,hp=r<2?2:1;for(let c=0;c<BC;c++)bricks.push({x:BP+c*(bw+BP),y:ty+r*(bh+BP),w:bw,h:bh,alive:true,hp,ci,color:ROW_COLORS[ci],ft:0});}}
function iBall(){const spd=bspd(),ang=-Math.PI/2+(Math.random()-.5)*.5;ball={x:W/2,y:paddle.y-12,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,r:Math.max(6,W*.012),stuck:true};}
function reset(kl){score=0;lives=3;hitCount=0;if(!kl)level=1;state='idle';iPaddle();iBricks();iBall();}
function boost(){const max=bspd()*2.2,cur=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);if(cur<max){const b=Math.min(1.06,max/cur);ball.vx*=b;ball.vy*=b;}hitCount++;}
function post(type,d={}){self.postMessage({type,...d});}
function step(){
  if(state!=='running')return;
  paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x));
  if(ball.stuck){ball.x=paddle.x+paddle.w/2;ball.y=paddle.y-ball.r-2;return;}
  ball.x+=ball.vx;ball.y+=ball.vy;
  if(ball.x-ball.r<=0){ball.x=ball.r;ball.vx=Math.abs(ball.vx);post('wall');}
  if(ball.x+ball.r>=W){ball.x=W-ball.r;ball.vx=-Math.abs(ball.vx);post('wall');}
  if(ball.y-ball.r<=0){ball.y=ball.r;ball.vy=Math.abs(ball.vy);post('wall');}
  if(ball.vy>0&&ball.x+ball.r>paddle.x&&ball.x-ball.r<paddle.x+paddle.w&&ball.y+ball.r>=paddle.y&&ball.y-ball.r<paddle.y+paddle.h){
    const hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2),spd=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
    ball.vx=Math.sin(hit*(Math.PI/3))*spd;ball.vy=-Math.abs(Math.cos(hit*(Math.PI/3))*spd);
    ball.y=paddle.y-ball.r-1;boost();post('paddle');
  }
  for(const b of bricks){
    if(!b.alive)continue;
    if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
      b.hp--;b.ft=1;
      if(b.hp<=0){b.alive=false;score+=10*level;hiscore=Math.max(hiscore,score);post('brick',{color:b.color});}
      post('hit',{ri:b.ci});boost();
      const ox=ball.vx>0?(ball.x+ball.r)-b.x:b.x+b.w-(ball.x-ball.r);
      const oy=ball.vy>0?(ball.y+ball.r)-b.y:b.y+b.h-(ball.y-ball.r);
      if(Math.abs(ox)<Math.abs(oy))ball.vx*=-1;else ball.vy*=-1;break;
    }
  }
  if(ball.y-ball.r>H){lives--;if(lives<=0){state='dead';post('dead');}else{iBall();state='idle';post('lifeLost',{lives});}}
  if(bricks.every(b=>!b.alive)){state='win';post('win');}
}
self.onmessage=function(e){
  const{type,data}=e.data;
  if(type==='init'){W=data.W;H=data.H;reset();self.postMessage({type:'ready',px:paddle.x,py:paddle.y,pw:paddle.w,ph:paddle.h,bx:ball.x,by:ball.y,br:ball.r,bstuck:ball.stuck,bricks:bricks.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h,hp:b.hp,color:b.color,ft:0})),score,hiscore,lives,level,state});}
  else if(type==='resize'){W=data.W;H=data.H;iPaddle();iBricks();iBall();}
  else if(type==='paddleMove'){paddle.x=data.x-paddle.w/2;}
  else if(type==='paddleDir'){paddle.x+=data.dir*paddle.w*.12;}
  else if(type==='launch'){if(state==='idle'){state='running';ball.stuck=false;post('launched');}}
  else if(type==='restart'){reset(data&&data.keepLevel);self.postMessage({type:'ready',px:paddle.x,py:paddle.y,pw:paddle.w,ph:paddle.h,bx:ball.x,by:ball.y,br:ball.r,bstuck:ball.stuck,bricks:bricks.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h,hp:b.hp,color:b.color,ft:0})),score,hiscore,lives,level,state});}
  else if(type==='nextLevel'){level++;iPaddle();iBricks();iBall();state='idle';self.postMessage({type:'ready'});}
  else if(type==='tick'){
    step();
    self.postMessage({type:'frame',px:paddle.x,py:paddle.y,pw:paddle.w,ph:paddle.h,bx:ball.x,by:ball.y,br:ball.r,bstuck:ball.stuck,bricks:bricks.map(b=>b.alive?{x:b.x,y:b.y,w:b.w,h:b.h,hp:b.hp,color:b.color,ft:b.ft}:null),score,hiscore,lives,level,state});
  }
};
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url  = URL.createObjectURL(blob);
    const w = new Worker(url);
    URL.revokeObjectURL(url);
    return w;
  }

  function workerMsg(type, data) {
    if (worker) worker.postMessage({ type, data });
  }

  // ── OFFSCREEN BG ──
  function buildBg() {
    bgCanvas = document.createElement('canvas');
    bgCanvas.width  = Math.round(W * DPR);
    bgCanvas.height = Math.round(H * DPR);
    const bc = bgCanvas.getContext('2d');
    bc.setTransform(DPR, 0, 0, DPR, 0, 0);
    bc.fillStyle = '#04020e'; bc.fillRect(0, 0, W, H);
    const sx = W/2, sy = H*.04, sr = H*.07;
    if (!isMobile) {
      const sg = bc.createRadialGradient(sx,sy,0,sx,sy,sr*2);
      sg.addColorStop(0,'rgba(255,45,120,.6)'); sg.addColorStop(.5,'rgba(180,79,255,.2)'); sg.addColorStop(1,'transparent');
      bc.fillStyle=sg; bc.beginPath(); bc.arc(sx,sy,sr*2,0,Math.PI*2); bc.fill();
      const gp = new Path2D();
      const gs = Math.round(W/20);
      for(let x=0;x<W;x+=gs){gp.moveTo(x,0);gp.lineTo(x,H);} for(let y=0;y<H;y+=gs){gp.moveTo(0,y);gp.lineTo(W,y);}
      bc.strokeStyle='rgba(180,79,255,.06)'; bc.lineWidth=1; bc.stroke(gp);
    }
    const sunG = bc.createLinearGradient(sx-sr,0,sx+sr,0);
    sunG.addColorStop(0,'#ff2d78'); sunG.addColorStop(.5,'#ffd93d'); sunG.addColorStop(1,'#ff2d78');
    bc.fillStyle=sunG; if(!isMobile){bc.shadowColor='#ff2d78';bc.shadowBlur=18;}
    bc.beginPath(); bc.arc(sx,sy,sr,0,Math.PI*2); bc.fill(); bc.shadowBlur=0;
    bc.save(); bc.beginPath(); bc.arc(sx,sy,sr,0,Math.PI*2); bc.clip();
    bc.fillStyle='#04020e';
    for(let i=0;i<6;i++) bc.fillRect(sx-sr, sy+sr*.25+i*sr*.145, sr*2, sr*.07);
    bc.restore();
    const sc = isMobile ? 20 : 55;
    for(let i=0;i<sc;i++){const x=Math.random()*W,y=Math.random()*H*.55,r=Math.random()*1.2+.3;bc.beginPath();bc.arc(x,y,r,0,Math.PI*2);bc.fillStyle=`rgba(240,236,255,${.3+Math.random()*.4})`;bc.fill();}
  }

  // ── RESIZE ──
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const rect = canvas.getBoundingClientRect();
    W = rect.width  || canvas.offsetWidth  || 600;
    H = rect.height || canvas.offsetHeight || 420;
    // Mobile: cap canvas physical size to reduce GPU load
    const physW = isMobile ? Math.min(Math.round(W * DPR), 640) : Math.round(W * DPR);
    const physH = isMobile ? Math.min(Math.round(H * DPR), 400) : Math.round(H * DPR);
    canvas.width  = physW; canvas.height = physH;
    ctx.setTransform(physW / W, 0, 0, physH / H, 0, 0);
    buildBg();
    workerMsg('resize', { W, H });
  }
  window._brickResize = resize;
  window.addEventListener('resize', () => { if (rafId) resize(); }, { passive: true });

  // ── CURSOR ──
  const curDot  = document.getElementById('cur-dot');
  const curRing = document.getElementById('cur-ring');
  function hideCursor() { if(curDot)curDot.style.opacity='0'; if(curRing)curRing.style.opacity='0'; }
  function showCursor() { if(curDot)curDot.style.opacity=''; if(curRing)curRing.style.opacity=''; }

  // ── INPUT ──
  canvas.addEventListener('mouseenter', hideCursor);
  canvas.addEventListener('mouseleave', () => { mouseX=-1; showCursor(); });
  canvas.addEventListener('mousemove', e => {
    if (mobileDir === 0) { const r=canvas.getBoundingClientRect(); mouseX=e.clientX-r.left; }
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (mobileDir === 0) { const r=canvas.getBoundingClientRect(); mouseX=e.touches[0].clientX-r.left; }
  }, { passive: false });
  canvas.addEventListener('touchstart', e => {
    if (e.target !== canvas) return;
    e.preventDefault(); hideCursor();
    const r=canvas.getBoundingClientRect(); mouseX=e.touches[0].clientX-r.left;
    if (uiState==='idle')       workerMsg('launch');
    else if (uiState==='dead')  { stopGame(); resize(); startGame(); }
    else if (uiState==='win')   workerMsg('nextLevel');
  }, { passive: false });
  canvas.addEventListener('touchend', () => showCursor(), { passive: true });

  function startMove(dir) { mobileDir=dir; mouseX=-1; }
  function stopMove()     { mobileDir=0; }
  [btnLeft, btnRight].forEach((btn, side) => {
    if (!btn) return;
    const dir = side===0 ? -1 : 1;
    btn.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); startMove(dir); }, { passive: false });
    btn.addEventListener('touchend',   e => { e.preventDefault(); e.stopPropagation(); stopMove(); }, { passive: false });
    btn.addEventListener('mousedown',  () => startMove(dir));
    btn.addEventListener('mouseup',    stopMove);
    btn.addEventListener('mouseleave', stopMove);
  });
  window.addEventListener('keydown', e => {
    if (!canvas.closest('.game-inner')?.classList.contains('active')) return;
    if (e.code==='Space'||e.key===' ') {
      e.preventDefault();
      if (uiState==='idle')       workerMsg('launch');
      else if (uiState==='dead')  { stopGame(); resize(); startGame(); }
      else if (uiState==='win')   workerMsg('nextLevel');
    }
  });

  // ── RENDER ──
  function drawHeart(cx,cy,size,alpha){
    const s=size*.5;
    ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle='#ff2d78';
    if(!isMobile){ctx.shadowColor='#ff2d78';ctx.shadowBlur=10;}
    ctx.beginPath();ctx.moveTo(cx,cy+s*.35);ctx.bezierCurveTo(cx,cy-s*.1,cx-s,cy-s*.6,cx-s,cy-s*.15);ctx.bezierCurveTo(cx-s,cy+s*.4,cx,cy+s*.85,cx,cy+s*.85);ctx.bezierCurveTo(cx,cy+s*.85,cx+s,cy+s*.4,cx+s,cy-s*.15);ctx.bezierCurveTo(cx+s,cy-s*.6,cx,cy-s*.1,cx,cy+s*.35);ctx.fill();
    ctx.globalAlpha=alpha*.4;ctx.fillStyle='#ff9fc5';ctx.shadowBlur=0;ctx.beginPath();ctx.arc(cx-s*.27,cy-s*.05,s*.38,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function render(ts) {
    rafId = requestAnimationFrame(render);
    if (ts - lastTs < TICK_MS) return;
    lastTs = ts;

    const s = renderState;
    if (!s) { ctx.fillStyle='#04020e'; ctx.fillRect(0,0,W,H); return; }

    // Send input to worker each rendered frame
    if (mouseX >= 0)     workerMsg('paddleMove', { x: mouseX });
    if (mobileDir !== 0) workerMsg('paddleDir', { dir: mobileDir });
    // Trigger physics tick
    workerMsg('tick');

    ctx.clearRect(0, 0, W, H);
    // BG
    if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, W, H);
    else { ctx.fillStyle='#04020e'; ctx.fillRect(0,0,W,H); }

    // Bricks
    if (s.bricks) {
      if (isMobile) {
        const byColor = {};
        s.bricks.forEach(b => { if(!b)return; (byColor[b.color]=byColor[b.color]||[]).push(b); });
        Object.entries(byColor).forEach(([color,list]) => {
          ctx.fillStyle=color;
          list.forEach(b => ctx.fillRect(b.x,b.y,b.w,b.h));
          ctx.fillStyle='rgba(255,255,255,.25)';
          list.forEach(b => { if(b.hp===2) ctx.fillRect(b.x+2,b.y+b.h*.3,b.w-4,b.h*.12); });
        });
      } else {
        s.bricks.forEach(b => {
          if (!b) return;
          const alpha = b.ft>0 ? .4+.6*Math.sin(b.ft*Math.PI) : 1;
          ctx.globalAlpha=alpha; ctx.shadowColor=b.color; ctx.shadowBlur=8;
          ctx.fillStyle=b.color; ctx.beginPath(); ctx.roundRect(b.x,b.y,b.w,b.h,3); ctx.fill();
          if(b.hp===2){ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(b.x+4,b.y+b.h*.3,b.w-8,b.h*.12);}
        });
        ctx.globalAlpha=1; ctx.shadowBlur=0;
      }
    }

    // Paddle
    if (isMobile) {
      ctx.fillStyle='#00f5ff'; ctx.fillRect(s.px,s.py,s.pw,s.ph);
    } else {
      const pg=ctx.createLinearGradient(s.px,s.py,s.px+s.pw,s.py+s.ph);
      pg.addColorStop(0,'#7bf5ff'); pg.addColorStop(.5,'#00f5ff'); pg.addColorStop(1,'#7bf5ff');
      ctx.shadowColor='#00f5ff'; ctx.shadowBlur=16; ctx.fillStyle=pg;
      ctx.beginPath(); ctx.roundRect(s.px,s.py,s.pw,s.ph,s.ph/2); ctx.fill(); ctx.shadowBlur=0;
    }

    // Ball
    if (isMobile) {
      ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(s.bx,s.by,s.br,0,Math.PI*2); ctx.fill();
    } else {
      const bg=ctx.createRadialGradient(s.bx-s.br*.3,s.by-s.br*.3,0,s.bx,s.by,s.br);
      bg.addColorStop(0,'#fff'); bg.addColorStop(.5,'#7bf5ff'); bg.addColorStop(1,'#00f5ff');
      ctx.shadowColor='rgba(0,245,255,.8)'; ctx.shadowBlur=20; ctx.fillStyle=bg;
      ctx.beginPath(); ctx.arc(s.bx,s.by,s.br,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    }

    // HUD
    const fs=Math.max(9,W*.013); ctx.font=`bold ${fs}px 'Share Tech Mono',monospace`;
    if(!isMobile){ctx.shadowColor='#ff2d78';ctx.shadowBlur=5;}
    ctx.fillStyle='#ff2d78'; ctx.fillText('HI '+String(s.hiscore).padStart(5,'0'),W-200,H*.065); ctx.shadowBlur=0;
    if(!isMobile){ctx.shadowColor='#00f5ff';ctx.shadowBlur=5;}
    ctx.fillStyle='#00f5ff'; ctx.fillText('SCORE '+String(s.score).padStart(5,'0'),W-100,H*.065); ctx.shadowBlur=0;
    if(scoreDis) scoreDis.textContent=String(s.score).padStart(5,'0');
    if(!isMobile){ctx.shadowColor='#b44fff';ctx.shadowBlur=6;}
    ctx.fillStyle='rgba(180,79,255,.9)'; ctx.fillText('LV '+s.level,W/2-14,H*.065); ctx.shadowBlur=0;
    const hs=Math.max(10,W*.022),hy=H*.055,hg=hs*1.5;
    for(let i=0;i<3;i++) drawHeart(12+hs*.5+i*hg,hy,hs,i<s.lives?1:.18);
  }

  // ── WORKER EVENT HANDLER ──
  function onWorkerMessage(e) {
    const d = e.data;
    switch (d.type) {
      case 'frame':
      case 'ready':
        renderState = d;
        uiState = d.state || uiState;
        break;
      case 'launched':
        uiState = 'running';
        startMsg.classList.add('hidden');
        break;
      case 'lifeLost':
        uiState = 'idle';
        renderState = { ...renderState, lives: d.lives };
        startMsg.classList.remove('hidden');
        break;
      case 'dead':
        uiState = 'dead';
        overMsg.classList.add('show');
        break;
      case 'win':
        uiState = 'win';
        winMsg.classList.add('show');
        break;
      case 'wall':   snd_wall();        break;
      case 'paddle': snd_paddle();      break;
      case 'hit':    snd_hit(d.ri);     break;
      case 'brick':  /* sound via hit */ break;
    }
  }

  function startGame() {
    if (worker) { worker.terminate(); worker = null; }
    worker = createWorker();
    worker.onmessage = onWorkerMessage;
    workerMsg('init', { W, H });
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
    winMsg.classList.remove('show');
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  function stopGame() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (worker) { worker.terminate(); worker = null; }
    renderState = null; uiState = 'idle';
    showCursor();
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
    winMsg.classList.remove('show');
  }

  window._brickStart = function() {
    if (rafId) return;
    resize();
    startGame();
  };
  window._brickStop = window._brickResize = function() {
    stopGame();
    if (arguments[0] === 'resize') resize(); // called as resize
  };
  // separate stop and resize
  window._brickStop   = stopGame;
  window._brickResize = () => { if (rafId) resize(); };
}
