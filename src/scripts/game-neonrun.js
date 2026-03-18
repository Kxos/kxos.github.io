export function initNeonRun() {
  const canvas  = document.getElementById('dino-canvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const startMsg= document.getElementById('game-start-msg');
  const overMsg = document.getElementById('game-over-msg');
  const scoreDis= document.getElementById('score-display');
  const btnJump = document.getElementById('btn-jump');
  const btnDuck = document.getElementById('btn-duck');

  // ── AUDIO ──
  let _audioCtx = null, _masterGain = null;
  function ac() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  }
  function master() {
    if (!_masterGain) { _masterGain = ac().createGain(); _masterGain.gain.value = .55; _masterGain.connect(ac().destination); }
    return _masterGain;
  }
  function tone(type, f0, f1, dur, gain, t = 0) {
    try {
      const a = ac(), out = master();
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(out); o.type = type;
      o.frequency.setValueAtTime(f0, a.currentTime + t);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, a.currentTime + t + dur);
      g.gain.setValueAtTime(gain, a.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t + dur);
      o.start(a.currentTime + t); o.stop(a.currentTime + t + dur + .01);
    } catch(e) {}
  }
  function snd_jump()      { tone('sine','320',680,.22,.32); tone('triangle',640,1200,.14,.1); }
  function snd_land()      { tone('sine',220,80,.1,.28); }
  function snd_duck()      { tone('sawtooth',500,160,.12,.14); }
  function snd_die()       { [220,165,110].forEach((f,i)=>tone('sawtooth',f*1.5,f*.5,.38,.22,i*.07)); }
  function snd_milestone() { [1,1.25,1.5,2].forEach((m,i)=>tone('triangle',440*m,null,.16,.16,i*.07)); }
  function snd_step(fr, spd) {
    const interval = Math.max(6, Math.round(12 - spd));
    if (fr % interval !== 0) return;
    tone('square', fr % (interval*2) === 0 ? 180 : 140, null, .04, .04);
  }

  const LW = 880, LH = 220;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(canvas.width / LW, canvas.height / LH);
    return true;
  }
  window._neonRunResize = function() {
    if (!resizeCanvas()) {
      let tries = 0;
      const t = setInterval(() => { if (resizeCanvas() || ++tries > 10) clearInterval(t); }, 50);
    }
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const W = LW, H = LH;
  const C = {
    ground:'#ff2d78', groundG:'rgba(255,45,120,.5)',
    grid2:'rgba(255,45,120,.08)', mtn:'rgba(180,79,255,.35)', mtn2:'rgba(180,79,255,.15)',
    dino:'#00f5ff', dinoG:'rgba(0,245,255,.6)',
    obs1:'#ff2d78', obs2:'#b44fff', particle:'#ffd93d', score:'#00f5ff', hiscore:'#ffd93d',
  };

  let state = 'idle', score = 0, hiscore = 0, frame = 0, speed = 4;
  let particles = [], obstacles = [], nextObs = 100, gridOffsetY = 0;
  const groundY = 24, groundLineY = H - groundY;
  const DINO_W = 26, DINO_H = 34, DUCK_H = 18;
  const dino = {
    x:70, vy:0, y:0, onGround:true, ducking:false, legPhase:0,
    get drawY(){ return groundLineY - (this.ducking ? DUCK_H : DINO_H) + this.y; },
  };

  // Static scenery — generated once
  const stars = Array.from({length:55},()=>({
    x:Math.random()*W, y:Math.random()*(H*.52),
    r:Math.random()*1.1+.3, blink:Math.random()*Math.PI*2,
  }));
  function genMtn(amp,base){
    const pts=[{x:0,y:H*base}];
    for(let x=0;x<=W;x+=36) pts.push({x,y:H*base - Math.random()*H*amp*(.3+Math.random()*.4)});
    pts.push({x:W,y:H*base},{x:W,y:H},{x:0,y:H});
    return pts;
  }
  const mtn1 = genMtn(.7,.5), mtn2 = genMtn(.42,.42);

  // Cached sky gradient
  const skyGrad = ctx.createLinearGradient(0,0,0,H);
  skyGrad.addColorStop(0,'#04020e'); skyGrad.addColorStop(.6,'#0b0620'); skyGrad.addColorStop(1,'#150830');

  function reset() {
    score=0; frame=0; speed=4;
    dino.y=0; dino.vy=0; dino.onGround=true; dino.ducking=false; dino.legPhase=0;
    obstacles=[]; nextObs=100; particles=[]; gridOffsetY=0;
  }
  window._neonRunReset = function() {
    state='idle'; reset();
    startMsg.classList.remove('hidden'); overMsg.classList.remove('show');
  };

  function doJump() {
    if (state==='idle')  { state='running'; startMsg.classList.add('hidden'); overMsg.classList.remove('show'); reset(); return; }
    if (state==='dead')  { state='running'; overMsg.classList.remove('show'); reset(); return; }
    if (state==='running' && dino.onGround) { dino.vy=-11.5; dino.onGround=false; snd_jump(); spawnParticles(dino.x+DINO_W/2,groundLineY,'jump'); }
  }
  function startDuck() { if(state==='running'&&!dino.ducking){ dino.ducking=true; snd_duck(); } }
  function stopDuck()  { dino.ducking=false; }

  window.addEventListener('keydown',e=>{ if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();doJump();} if(e.code==='ArrowDown'){e.preventDefault();startDuck();} },{passive:false});
  window.addEventListener('keyup',  e=>{ if(e.code==='ArrowDown') stopDuck(); });
  canvas.addEventListener('touchstart',e=>{ e.preventDefault(); doJump(); },{passive:false});
  if(btnJump){ btnJump.addEventListener('touchstart',e=>{e.preventDefault();doJump();},{passive:false}); btnJump.addEventListener('mousedown',e=>{e.preventDefault();doJump();}); }
  if(btnDuck){ btnDuck.addEventListener('touchstart',e=>{e.preventDefault();startDuck();},{passive:false}); btnDuck.addEventListener('touchend',e=>{e.preventDefault();stopDuck();},{passive:false}); btnDuck.addEventListener('mousedown',()=>startDuck()); btnDuck.addEventListener('mouseup',()=>stopDuck()); }

  function spawnParticles(x,y,type){
    const n=type==='jump'?6:14;
    for(let i=0;i<n;i++){
      const ang=type==='jump'?Math.PI+Math.random()*Math.PI:Math.random()*Math.PI*2;
      const spd=type==='jump'?1+Math.random()*3:2+Math.random()*5;
      particles.push({x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:1,decay:.04+Math.random()*.04,r:2+Math.random()*3,color:type==='jump'?C.dinoG:C.particle});
    }
  }
  function spawnObs(){
    const roll=Math.random(); let w,h,type;
    if(roll<.5){w=12+Math.random()*10;h=26+Math.random()*24;type='cactus';}
    else if(roll<.8){w=44+Math.random()*28;h=14;type='bird';}
    else{w=10;h=42+Math.random()*18;type='tall';}
    const yOff=type==='bird'?-(18+Math.random()*36):0;
    obstacles.push({x:W+20,y:groundLineY-h+yOff,w,h,type,color:roll<.5?C.obs1:C.obs2});
  }

  // ── DRAW (unchanged from original — only stars lose per-star shadowBlur) ──
  function drawBg(){ ctx.fillStyle=skyGrad; ctx.fillRect(0,0,W,H); }
  function drawStars(){
    // Batch: no shadowBlur per star
    stars.forEach(s=>{
      const b=.5+.5*Math.sin(s.blink+frame*.02);
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(240,236,255,${.4*b+.1})`; ctx.fill();
    });
  }
  function drawSun(){
    const sx=W/2,sy=H*.38,sr=75;
    const g=ctx.createRadialGradient(sx,sy,0,sx,sy,sr*3);
    g.addColorStop(0,'rgba(255,45,120,.2)'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(sx-sr*3,sy-sr*2,sr*6,sr*3);
    ctx.save(); ctx.beginPath(); ctx.arc(sx,sy,sr,Math.PI,0); ctx.closePath(); ctx.clip();
    const sg=ctx.createLinearGradient(sx-sr,sy,sx+sr,sy);
    sg.addColorStop(0,'#ff6baf'); sg.addColorStop(.5,'#ff2d78'); sg.addColorStop(1,'#ff6baf');
    ctx.fillStyle=sg; ctx.shadowColor='#ff2d78'; ctx.shadowBlur=16; ctx.fill(); ctx.shadowBlur=0;
    for(let i=0;i<8;i++){ ctx.fillStyle='rgba(4,2,14,.88)'; ctx.fillRect(sx-sr,sy-5-i*7,sr*2,3.5); }
    ctx.restore();
  }
  function drawMountains(){
    [mtn2,mtn1].forEach((pts,idx)=>{
      ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath();
      ctx.fillStyle=idx===0?'rgba(7,4,18,.78)':'rgba(7,4,18,.88)'; ctx.fill();
      ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath();
      ctx.fillStyle=idx===0?C.mtn2:C.mtn; ctx.fill();
    });
  }
  function drawGrid(){
    gridOffsetY=(gridOffsetY+speed*.5)%60;
    const horizon=H*.5;
    for(let x=-6;x<=6;x++){ const bx=W/2+x*72; ctx.beginPath(); ctx.moveTo(bx,horizon); ctx.lineTo(W/2+(bx-W/2)*5,groundLineY+6); ctx.strokeStyle=C.grid2; ctx.lineWidth=.8; ctx.stroke(); }
    for(let i=0;i<10;i++){ const t=(i/10+gridOffsetY/600)%1; const y=horizon+(groundLineY-horizon)*Math.pow(t,1.5); const xoff=(1-t)*W*.5; ctx.beginPath(); ctx.moveTo(xoff,y); ctx.lineTo(W-xoff,y); ctx.strokeStyle=`rgba(255,45,120,${t*.28})`; ctx.lineWidth=.8; ctx.stroke(); }
  }
  function drawGround(){
    ctx.beginPath(); ctx.moveTo(0,groundLineY); ctx.lineTo(W,groundLineY);
    ctx.strokeStyle=C.ground; ctx.lineWidth=2;
    if(!isMobile){ ctx.shadowColor=C.ground; ctx.shadowBlur=10; }
    ctx.stroke(); ctx.shadowBlur=0;
    const gg=ctx.createLinearGradient(0,groundLineY,0,H); gg.addColorStop(0,C.groundG); gg.addColorStop(1,'transparent');
    ctx.fillStyle=gg; ctx.fillRect(0,groundLineY,W,H-groundLineY);
  }
  function drawDino(){
    const x=dino.x,y=dino.drawY,w=DINO_W,h=dino.ducking?DUCK_H:DINO_H;
    if(!isMobile){ ctx.shadowColor=C.dino; ctx.shadowBlur=10; }
    ctx.fillStyle=C.dino;
    if(dino.ducking){ ctx.fillRect(x,y,w+8,h); ctx.fillStyle='#04020e'; ctx.fillRect(x+w+2,y+4,5,5); }
    else {
      ctx.fillRect(x,y+8,w,h-8); ctx.fillRect(x+6,y,w,13);
      ctx.fillStyle='#04020e'; ctx.fillRect(x+w+1,y+3,5,5);
      ctx.fillStyle=C.dino; ctx.fillRect(x+w+3,y+11,5,2.5); ctx.fillRect(x-7,y+h-12,9,7);
      if(dino.onGround){ const lp=Math.sin(dino.legPhase); ctx.fillRect(x+4,y+h,3+Math.round(lp*2),8); ctx.fillRect(x+14,y+h,3+Math.round(lp*-2),8); dino.legPhase+=.28*(speed/4); }
      else { ctx.fillRect(x+4,y+h,4,7); ctx.fillRect(x+14,y+h,-3,7); }
    }
    ctx.shadowBlur=0;
    const dg=ctx.createRadialGradient(x+w/2,groundLineY,0,x+w/2,groundLineY,28);
    dg.addColorStop(0,'rgba(0,245,255,.22)'); dg.addColorStop(1,'transparent');
    ctx.fillStyle=dg; ctx.fillRect(x-8,groundLineY-4,w+16,18);
  }
  function drawObstacle(o){
    ctx.save();
    if(o.type==='bird'){
      const{x,y,w,h}=o,flap=Math.sin(frame*.22);
      if(!isMobile){ctx.shadowColor=C.obs2;ctx.shadowBlur=10;} ctx.fillStyle=C.obs2;
      ctx.fillRect(x+w*.3,y+4,w*.4,h-2); ctx.fillRect(x+w*.62,y,w*.22,h*.7); ctx.fillRect(x+w*.84,y+2,w*.18,3);
      ctx.fillStyle='#ff2d78'; if(!isMobile){ctx.shadowColor='#ff2d78';ctx.shadowBlur=5;} ctx.fillRect(x+w*.6,y-4,4,5);
      if(!isMobile){ctx.shadowColor=C.obs2;ctx.shadowBlur=10;} ctx.fillStyle='#04020e';
      ctx.fillRect(x+w*.68,y+2,4,4); ctx.fillStyle='#ff2d78'; ctx.fillRect(x+w*.69,y+3,2,2);
      ctx.fillStyle=C.obs2;
      const wy=flap*7;
      ctx.fillRect(x,y+wy,w*.32,4); ctx.fillRect(x+w*.04,y+wy-3,w*.22,4);
      ctx.fillRect(x+w*.68,y+wy,w*.32,4); ctx.fillRect(x+w*.74,y+wy-3,w*.22,4);
      ctx.fillRect(x+w*.15,y+5,w*.18,3); ctx.fillRect(x+w*.1,y+8,w*.1,3);
    } else if(o.type==='cactus'){
      const{x,y,w,h}=o;
      if(!isMobile){ctx.shadowColor=C.obs1;ctx.shadowBlur=12;} ctx.fillStyle=C.obs1;
      ctx.fillRect(x+w*.3,y,w*.4,h); ctx.fillRect(x+w*.35,y-4,w*.3,5);
      ctx.fillRect(x,y+h*.22,w*.32,w*.35); ctx.fillRect(x,y+h*.1,w*.32,h*.18); ctx.fillRect(x+w*.04,y+h*.08,w*.2,5);
      ctx.fillRect(x+w*.68,y+h*.32,w*.32,w*.35); ctx.fillRect(x+w*.68,y+h*.2,w*.32,h*.2); ctx.fillRect(x+w*.72,y+h*.18,w*.2,5);
      ctx.fillStyle='rgba(255,107,175,.9)';
      for(let i=0;i<4;i++){ ctx.fillRect(x+w*.68+1,y+h*.32+i*6,3,2); ctx.fillRect(x+w*.28-2,y+h*.22+i*5,3,2); }
    } else {
      const{x,y,w,h}=o,t=frame*.08,cx2=x+w/2;
      if(!isMobile){ctx.shadowColor='#ffd93d';ctx.shadowBlur=14;} ctx.fillStyle='#ffd93d';
      ctx.fillRect(cx2-3,y,6,h); ctx.fillRect(x-5,y,w+10,5); ctx.fillRect(x-2,y+5,w+4,3);
      ctx.fillRect(x-3,y+h*.45,w+6,4); ctx.fillRect(x-5,y+h-5,w+10,5); ctx.fillRect(x-2,y+h-8,w+4,3);
      if(!isMobile){ctx.shadowBlur=6;} ctx.lineWidth=2.5; ctx.strokeStyle='#ffd93d';
      [[cx2-3,y+5,x-5,y+h*.44],[cx2+3,y+5,x+w+5,y+h*.44],[cx2-3,y+h*.49,x-5,y+h-5],[cx2+3,y+h*.49,x+w+5,y+h-5]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();});
      ctx.fillStyle='#ffd93d'; if(!isMobile)ctx.shadowBlur=10;
      ctx.beginPath();ctx.arc(x-5,y+2,4.5,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(x+w+5,y+2,4.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#04020e'; ctx.beginPath();ctx.arc(x-5,y+2,2,0,Math.PI*2);ctx.fill(); ctx.beginPath();ctx.arc(x+w+5,y+2,2,0,Math.PI*2);ctx.fill();
      if(!isMobile){
        const bolt=(x1,y1,x2,y2,segs,col,alpha)=>{ctx.save();ctx.strokeStyle=col;ctx.shadowColor=col;ctx.shadowBlur=8;ctx.lineWidth=1.2;ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(x1,y1);const dx=(x2-x1)/segs,dy=(y2-y1)/segs;for(let i=1;i<segs;i++){const j=Math.sin(t*6.7+i*2.9+x1*.02)*7;ctx.lineTo(x1+dx*i+j,y1+dy*i+j*.4);}ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();};
        const p1=Math.sin(t*2.3),p2=Math.sin(t*2.3+Math.PI);
        if(p1>-.2){bolt(x-5,y+2,cx2,y+2,6,'#00f5ff',.55+p1*.35);}
        if(p2>-.2){bolt(x+w+5,y+2,cx2,y+2,6,'#00f5ff',.55+p2*.35);}
        if(p1>.3){bolt(x-5,y+2,cx2-3,y+h*.44,8,'#7bf5ff',.35);}
        if(p2>.3){bolt(x+w+5,y+2,cx2+3,y+h*.44,8,'#7bf5ff',.35);}
        bolt(cx2,y+7,cx2,y+h*.43,9,'#ffd93d',.55); bolt(cx2,y+h*.49,cx2,y+h-7,9,'#ffd93d',.55);
        const gr=5+Math.abs(Math.sin(t*3.1))*4;
        ctx.save();ctx.shadowColor='#00f5ff';ctx.shadowBlur=22;ctx.fillStyle=`rgba(0,245,255,${.25+Math.abs(Math.sin(t*3.1))*.45})`;
        ctx.beginPath();ctx.arc(x-5,y+2,gr,0,Math.PI*2);ctx.fill(); ctx.beginPath();ctx.arc(x+w+5,y+2,gr,0,Math.PI*2);ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
  }
  function drawParticles(){
    particles.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0,p.r*p.life),0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=p.life*.9;ctx.fill();}); ctx.globalAlpha=1;
  }
  function drawHUD(){
    const fs=Math.max(10,W*0.015); ctx.font=`bold ${fs}px 'Share Tech Mono',monospace`;
    const s=String(score).padStart(5,'0'),hi=String(hiscore).padStart(5,'0');
    ctx.fillStyle=C.hiscore;ctx.shadowColor=C.hiscore;ctx.shadowBlur=5;ctx.fillText('HI '+hi,W-220,18);ctx.shadowBlur=0;
    ctx.fillStyle=C.score;ctx.shadowColor=C.score;ctx.shadowBlur=5;ctx.fillText('SCORE '+s,W-110,18);ctx.shadowBlur=0;
    scoreDis.textContent=s;
  }
  function collides(ax,ay,aw,ah,b){const pad=4;return ax+pad<b.x+b.w-pad&&ax+aw-pad>b.x+pad&&ay+pad<b.y+b.h-pad&&ay+ah-pad>b.y+pad;}

  let rafId = null;
  function loop(){
    rafId=requestAnimationFrame(loop); frame++;
    ctx.clearRect(0,0,W,H);
    drawBg(); drawStars(); drawSun(); drawMountains(); drawGrid(); drawGround();
    if(state==='running'){
      const wasOnGround=dino.onGround; dino.vy+=.65; dino.y+=dino.vy;
      if(dino.y>=0){dino.y=0;dino.vy=0;if(!wasOnGround)snd_land();dino.onGround=true;}
      nextObs--; if(nextObs<=0){spawnObs();nextObs=Math.floor(58+Math.random()*90);}
      obstacles=obstacles.filter(o=>o.x>-80); obstacles.forEach(o=>o.x-=speed);
      if(frame%6===0){const prev=score;score++;hiscore=Math.max(hiscore,score);if(score%100===0&&score!==prev)snd_milestone();}
      speed=4+Math.floor(score/80)*.6;
      if(dino.onGround&&!dino.ducking)snd_step(frame,speed);
      const dw=dino.ducking?DINO_W+8:DINO_W,dh=dino.ducking?DUCK_H:DINO_H;
      const dx=dino.x,dy=groundLineY-dh+dino.y;
      for(const o of obstacles){if(collides(dx,dy,dw,dh,o)){state='dead';snd_die();spawnParticles(dx+dw/2,dy+dh/2,'die');overMsg.classList.add('show');break;}}
      particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.14;p.life-=p.decay;}); particles=particles.filter(p=>p.life>0);
    }
    obstacles.forEach(drawObstacle); drawDino(); drawParticles(); drawHUD();
  }

  window._neonRunStart = function(){ if(rafId)return; window._neonRunReset(); loop(); };
  window._neonRunStop  = function(){ if(rafId){cancelAnimationFrame(rafId);rafId=null;} state='idle'; startMsg.classList.remove('hidden'); overMsg.classList.remove('show'); };
}
