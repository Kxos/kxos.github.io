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
  const MAX_DPR  = isMobile ? 1.5 : window.devicePixelRatio || 1;
  const FPS_CAP  = isMobile ? 30 : 60;
  const MS_PER_FRAME = 1000 / FPS_CAP;
  const ROW_COLORS = ['#ff2d78','#ff6baf','#b44fff','#7b2fff','#00f5ff','#7bf5ff','#ffd93d'];

  let _ac = null;
  function ac() { if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)(); if(_ac.state==='suspended')_ac.resume(); return _ac; }
  function tone(type,f0,f1,dur,gain,t=0){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type=type;o.frequency.setValueAtTime(f0,a.currentTime+t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,a.currentTime+t+dur);g.gain.setValueAtTime(gain,a.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+t+dur);o.start(a.currentTime+t);o.stop(a.currentTime+t+dur+.01);}catch(e){}}
  function snd_hit(ri){const f=[880,740,660,554,440,370,330][ri%7];tone('square',f,f*.5,.13,.18);}
  function snd_paddle(){tone('sine',300,180,.09,.22);}
  function snd_wall(){tone('triangle',200,120,.08,.12);}
  function snd_die(){[440,330,220,110].forEach((f,i)=>tone('sawtooth',f,null,.12,.14,i*.08));}
  function snd_win(){[440,554,659,880,1108].forEach((f,i)=>tone('square',f,null,.16,.12,i*.08));}
  function snd_milestone(){[660,880,1108].forEach((f,i)=>tone('square',f,null,.12,.1,i*.06));}

  let W, H, DPR=1, state='idle', score=0, hiscore=0, lives=3, level=1;
  let rafId=null, hitCount=0, lastTs=0;
  let paddle={}, ball={}, bricks=[], particles=[];
  let bgCanvas=null, bgCtx=null;

  function buildBg(){
    bgCanvas=document.createElement('canvas');
    bgCanvas.width=Math.round(W*DPR); bgCanvas.height=Math.round(H*DPR);
    bgCtx=bgCanvas.getContext('2d'); bgCtx.setTransform(DPR,0,0,DPR,0,0);
    bgCtx.fillStyle='#04020e'; bgCtx.fillRect(0,0,W,H);
    if(!isMobile){
      const gs=Math.round(W/20); bgCtx.strokeStyle='rgba(180,79,255,.06)'; bgCtx.lineWidth=1;
      const gp=new Path2D();
      for(let x=0;x<W;x+=gs){gp.moveTo(x,0);gp.lineTo(x,H);} for(let y=0;y<H;y+=gs){gp.moveTo(0,y);gp.lineTo(W,y);}
      bgCtx.stroke(gp);
    }
    const sx=W/2,sy=H*.04,sr=H*.07;
    if(!isMobile){const sg=bgCtx.createRadialGradient(sx,sy,0,sx,sy,sr*2);sg.addColorStop(0,'rgba(255,45,120,.6)');sg.addColorStop(.5,'rgba(180,79,255,.2)');sg.addColorStop(1,'transparent');bgCtx.fillStyle=sg;bgCtx.beginPath();bgCtx.arc(sx,sy,sr*2,0,Math.PI*2);bgCtx.fill();}
    const sunG=bgCtx.createLinearGradient(sx-sr,0,sx+sr,0);
    sunG.addColorStop(0,'#ff2d78');sunG.addColorStop(.5,'#ffd93d');sunG.addColorStop(1,'#ff2d78');
    bgCtx.fillStyle=sunG;
    if(!isMobile){bgCtx.shadowColor='#ff2d78';bgCtx.shadowBlur=18;}
    bgCtx.beginPath();bgCtx.arc(sx,sy,sr,0,Math.PI*2);bgCtx.fill();bgCtx.shadowBlur=0;
    bgCtx.save();bgCtx.beginPath();bgCtx.arc(sx,sy,sr,0,Math.PI*2);bgCtx.clip();
    bgCtx.fillStyle='#04020e';
    for(let i=0;i<6;i++)bgCtx.fillRect(sx-sr,sy+sr*.25+i*sr*.145,sr*2,sr*.07);
    bgCtx.restore();
    const sc=isMobile?25:60;
    for(let i=0;i<sc;i++){const x=Math.random()*W,y=Math.random()*H*.55,r=Math.random()*1.2+.3;bgCtx.beginPath();bgCtx.arc(x,y,r,0,Math.PI*2);bgCtx.fillStyle=`rgba(240,236,255,${.3+Math.random()*.4})`;bgCtx.fill();}
  }

  const BRICK_ROWS=isMobile?5:7, BRICK_COLS=isMobile?8:10, BRICK_PAD=isMobile?3:4, BRICK_TOP=0.12;

  function initBricks(){
    bricks=[];
    const bw=(W-BRICK_PAD*(BRICK_COLS+1))/BRICK_COLS;
    const bh=Math.min(isMobile?14:18,(H*.35)/BRICK_ROWS-BRICK_PAD);
    const topY=H*BRICK_TOP;
    const rowGrads=ROW_COLORS.map((col,ri)=>{
      if(isMobile)return null;
      const g=ctx.createLinearGradient(0,topY+ri*(bh+BRICK_PAD),0,topY+ri*(bh+BRICK_PAD)+bh);
      g.addColorStop(0,col);g.addColorStop(1,col+'99');return g;
    });
    for(let r=0;r<BRICK_ROWS;r++){
      const ci=r%ROW_COLORS.length,hp=r<2?2:1;
      for(let c=0;c<BRICK_COLS;c++)
        bricks.push({x:BRICK_PAD+c*(bw+BRICK_PAD),y:topY+r*(bh+BRICK_PAD),w:bw,h:bh,alive:true,hp,colIdx:ci,color:ROW_COLORS[ci],grad:rowGrads[ci],flashTimer:0});
    }
  }

  function initPaddle(){const pw=Math.min(isMobile?90:100,W*.18);paddle={w:pw,h:Math.max(10,H*.022),x:W/2-pw/2,y:H-H*.08};}
  function ballSpeed(){return Math.min(W,H)*(isMobile?.016:.014)*(1+(level-1)*.2);}
  function initBall(){const spd=ballSpeed(),ang=-Math.PI/2+(Math.random()-.5)*.5;ball={x:W/2,y:paddle.y-12,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,r:Math.max(6,W*.012),stuck:true,trail:[]};}

  function reset(keepLevel=false){
    score=0;lives=3;hitCount=0;if(!keepLevel)level=1;state='idle';particles=[];
    initPaddle();initBricks();initBall();buildBg();
    startMsg.classList.remove('hidden');overMsg.classList.remove('show');winMsg.classList.remove('show');
    if(scoreDis)scoreDis.textContent='00000';
  }
  function nextLevel(){level++;particles=[];initPaddle();initBricks();initBall();buildBg();state='idle';startMsg.classList.remove('hidden');overMsg.classList.remove('show');winMsg.classList.remove('show');}

  function resize(){
    DPR=Math.min(window.devicePixelRatio||1,MAX_DPR);
    const rect=canvas.getBoundingClientRect();
    const cw=rect.width||canvas.offsetWidth||600, ch=rect.height||canvas.offsetHeight||420;
    canvas.width=Math.round(cw*DPR);canvas.height=Math.round(ch*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);W=cw;H=ch;
    initPaddle();initBricks();initBall();buildBg();
  }
  window._brickResize=resize;
  window.addEventListener('resize',()=>{if(rafId)resize();},{passive:true});

  let mouseX=-1,mobileDir=0;
  const curDot=document.getElementById('cur-dot'),curRing=document.getElementById('cur-ring');
  function hideCursor(){if(curDot)curDot.style.opacity='0';if(curRing)curRing.style.opacity='0';}
  function showCursor(){if(curDot)curDot.style.opacity='';if(curRing)curRing.style.opacity='';}
  canvas.addEventListener('mouseenter',hideCursor);
  canvas.addEventListener('mouseleave',()=>{mouseX=-1;showCursor();});
  canvas.addEventListener('mousemove',e=>{if(mobileDir===0){const r=canvas.getBoundingClientRect();mouseX=e.clientX-r.left;}});
  canvas.addEventListener('touchmove',e=>{e.preventDefault();if(mobileDir===0){const r=canvas.getBoundingClientRect();mouseX=e.touches[0].clientX-r.left;}},{passive:false});
  canvas.addEventListener('touchstart',e=>{
    if(e.target!==canvas)return;e.preventDefault();hideCursor();
    const r=canvas.getBoundingClientRect();mouseX=e.touches[0].clientX-r.left;
    if(state==='idle'){launch();}
    else if(state==='dead'){if(rafId){cancelAnimationFrame(rafId);rafId=null;}resize();reset();loop();}
    else if(state==='win'){nextLevel();if(!rafId)loop();}
  },{passive:false});
  canvas.addEventListener('touchend',()=>showCursor(),{passive:true});
  function startMove(dir){mobileDir=dir;mouseX=-1;}
  function stopMove(){mobileDir=0;}
  [btnLeft,btnRight].forEach((btn,side)=>{
    if(!btn)return;const dir=side===0?-1:1;
    btn.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();startMove(dir);},{passive:false});
    btn.addEventListener('touchend',e=>{e.preventDefault();e.stopPropagation();stopMove();},{passive:false});
    btn.addEventListener('mousedown',()=>startMove(dir));btn.addEventListener('mouseup',stopMove);btn.addEventListener('mouseleave',stopMove);
  });
  window.addEventListener('keydown',e=>{
    if(!canvas.closest('.game-inner')?.classList.contains('active'))return;
    if(e.code==='Space'||e.key===' '){e.preventDefault();
      if(state==='idle'){launch();}
      else if(state==='dead'){if(rafId){cancelAnimationFrame(rafId);rafId=null;}resize();reset();loop();}
      else if(state==='win'){nextLevel();if(!rafId)loop();}
    }
  });
  function launch(){if(state!=='idle')return;state='running';ball.stuck=false;startMsg.classList.add('hidden');}

  function spawnBrickParticles(bx,by,bw,bh,color){
    if(isMobile)return;
    for(let i=0;i<8;i++){const ang=Math.random()*Math.PI*2,spd=Math.random()*3+1;particles.push({x:bx+bw/2,y:by+bh/2,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-1,r:Math.random()*3+1,life:1,decay:.028,color});}
  }
  function spawnPaddleParticles(){
    if(isMobile)return;
    for(let i=0;i<4;i++){const ang=-Math.PI/2+(Math.random()-.5)*Math.PI,spd=Math.random()*2+.5;particles.push({x:ball.x,y:ball.y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,r:Math.random()*2+1,life:1,decay:.05,color:'#00f5ff'});}
  }

  function drawBg(){if(bgCanvas)ctx.drawImage(bgCanvas,0,0,W,H);else{ctx.fillStyle='#04020e';ctx.fillRect(0,0,W,H);}}

  function drawBricks(){
    if(isMobile){
      const byColor={};
      bricks.forEach(b=>{if(!b.alive)return;if(b.flashTimer>0)b.flashTimer=Math.max(0,b.flashTimer-.15);(byColor[b.color]=byColor[b.color]||[]).push(b);});
      Object.entries(byColor).forEach(([color,list])=>{
        ctx.fillStyle=color;list.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
        ctx.fillStyle='rgba(255,255,255,.3)';list.forEach(b=>{if(b.hp===2)ctx.fillRect(b.x+2,b.y+b.h*.3,b.w-4,b.h*.12);});
      });
    } else {
      const byColor={};
      bricks.forEach(b=>{if(!b.alive)return;if(b.flashTimer>0)b.flashTimer=Math.max(0,b.flashTimer-.12);(byColor[b.colIdx]=byColor[b.colIdx]||[]).push(b);});
      Object.values(byColor).forEach(list=>{
        const b0=list[0];ctx.shadowColor=b0.color;ctx.shadowBlur=8;
        list.forEach(b=>{
          const alpha=b.flashTimer>0?.4+.6*Math.sin(b.flashTimer*Math.PI):1;
          ctx.globalAlpha=alpha;ctx.fillStyle=b.grad||b.color;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,3);ctx.fill();
          if(b.hp===2){ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(b.x+4,b.y+b.h*.3,b.w-8,b.h*.12);ctx.shadowBlur=8;}
        });
      });
      ctx.globalAlpha=1;ctx.shadowBlur=0;
    }
  }

  function drawPaddle(){
    const{x,y,w,h}=paddle;
    if(isMobile){ctx.fillStyle='#00f5ff';ctx.fillRect(x,y,w,h);}
    else{
      const grd=ctx.createLinearGradient(x,y,x+w,y+h);grd.addColorStop(0,'rgba(0,245,255,0)');grd.addColorStop(.5,'rgba(0,245,255,.35)');grd.addColorStop(1,'rgba(0,245,255,0)');ctx.fillStyle=grd;ctx.fillRect(x,y+h,w,6);
      const pg=ctx.createLinearGradient(x,y,x+w,y+h);pg.addColorStop(0,'#7bf5ff');pg.addColorStop(.5,'#00f5ff');pg.addColorStop(1,'#7bf5ff');ctx.shadowColor='#00f5ff';ctx.shadowBlur=16;ctx.fillStyle=pg;ctx.beginPath();ctx.roundRect(x,y,w,h,h/2);ctx.fill();ctx.shadowBlur=0;
    }
  }

  function drawBall(){
    if(isMobile){ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();}
    else{
      ball.trail.forEach((t,i)=>{ctx.beginPath();ctx.arc(t.x,t.y,ball.r*(i/ball.trail.length)*.7,0,Math.PI*2);ctx.fillStyle=`rgba(0,245,255,${(i/ball.trail.length)*.35})`;ctx.fill();});
      const bg=ctx.createRadialGradient(ball.x-ball.r*.3,ball.y-ball.r*.3,0,ball.x,ball.y,ball.r);bg.addColorStop(0,'#fff');bg.addColorStop(.5,'#7bf5ff');bg.addColorStop(1,'#00f5ff');ctx.shadowColor='rgba(0,245,255,.8)';ctx.shadowBlur=20;ctx.fillStyle=bg;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    }
  }

  function drawParticles(){
    if(isMobile||!particles.length)return;
    particles.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0,p.r*p.life),0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=p.life*.85;ctx.fill();});ctx.globalAlpha=1;
  }

  function drawHeart(cx,cy,size,alpha){
    const s=size*.5;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#ff2d78';
    if(!isMobile){ctx.shadowColor='#ff2d78';ctx.shadowBlur=10;}
    ctx.beginPath();ctx.moveTo(cx,cy+s*.35);ctx.bezierCurveTo(cx,cy-s*.1,cx-s,cy-s*.6,cx-s,cy-s*.15);ctx.bezierCurveTo(cx-s,cy+s*.4,cx,cy+s*.85,cx,cy+s*.85);ctx.bezierCurveTo(cx,cy+s*.85,cx+s,cy+s*.4,cx+s,cy-s*.15);ctx.bezierCurveTo(cx+s,cy-s*.6,cx,cy-s*.1,cx,cy+s*.35);ctx.fill();
    ctx.globalAlpha=alpha*.4;ctx.fillStyle='#ff9fc5';ctx.shadowBlur=0;ctx.beginPath();ctx.arc(cx-s*.27,cy-s*.05,s*.38,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function drawHUD(){
    const fs=Math.max(9,W*.013);ctx.font=`bold ${fs}px 'Share Tech Mono',monospace`;
    if(!isMobile){ctx.shadowColor='#ff2d78';ctx.shadowBlur=5;}
    ctx.fillStyle='#ff2d78';ctx.fillText('HI '+String(hiscore).padStart(5,'0'),W-200,H*.065);ctx.shadowBlur=0;
    if(!isMobile){ctx.shadowColor='#00f5ff';ctx.shadowBlur=5;}
    ctx.fillStyle='#00f5ff';ctx.fillText('SCORE '+String(score).padStart(5,'0'),W-100,H*.065);ctx.shadowBlur=0;
    if(scoreDis)scoreDis.textContent=String(score).padStart(5,'0');
    const hs=Math.max(10,W*.022),hy=H*.055,hg=hs*1.5;
    for(let i=0;i<3;i++)drawHeart(12+hs*.5+i*hg,hy,hs,i<lives?1:.18);
    ctx.fillStyle='rgba(180,79,255,.9)';if(!isMobile){ctx.shadowColor='#b44fff';ctx.shadowBlur=6;}
    ctx.fillText('LV '+level,W/2-14,H*.065);ctx.shadowBlur=0;
  }

  const MAX_SPD=2.2;
  function boostBall(){const max=ballSpeed()*MAX_SPD,cur=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);if(cur<max){const b=Math.min(1.06,max/cur);ball.vx*=b;ball.vy*=b;}hitCount++;}
  function updatePaddle(){
    if(mobileDir!==0)paddle.x+=mobileDir*paddle.w*.12;
    else if(mouseX>=0)paddle.x=mouseX-paddle.w/2;
    paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x));
    if(ball.stuck){ball.x=paddle.x+paddle.w/2;ball.y=paddle.y-ball.r-2;}
  }
  function updateBall(){
    if(ball.stuck)return;
    if(!isMobile){ball.trail.push({x:ball.x,y:ball.y});if(ball.trail.length>8)ball.trail.shift();}
    ball.x+=ball.vx;ball.y+=ball.vy;
    if(ball.x-ball.r<=0){ball.x=ball.r;ball.vx=Math.abs(ball.vx);snd_wall();}
    if(ball.x+ball.r>=W){ball.x=W-ball.r;ball.vx=-Math.abs(ball.vx);snd_wall();}
    if(ball.y-ball.r<=0){ball.y=ball.r;ball.vy=Math.abs(ball.vy);snd_wall();}
    if(ball.vy>0&&ball.x+ball.r>paddle.x&&ball.x-ball.r<paddle.x+paddle.w&&ball.y+ball.r>=paddle.y&&ball.y-ball.r<paddle.y+paddle.h){
      const hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2),spd=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
      ball.vx=Math.sin(hit*(Math.PI/3))*spd;ball.vy=-Math.abs(Math.cos(hit*(Math.PI/3))*spd);
      ball.y=paddle.y-ball.r-1;boostBall();snd_paddle();spawnPaddleParticles();
    }
    for(const b of bricks){
      if(!b.alive)continue;
      if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
        b.hp--;b.flashTimer=1;
        if(b.hp<=0){b.alive=false;spawnBrickParticles(b.x,b.y,b.w,b.h,b.color);score+=10*level;hiscore=Math.max(hiscore,score);if(score%500===0&&score>0)snd_milestone();}
        snd_hit(b.colIdx);boostBall();
        const ox=ball.vx>0?(ball.x+ball.r)-b.x:b.x+b.w-(ball.x-ball.r);
        const oy=ball.vy>0?(ball.y+ball.r)-b.y:b.y+b.h-(ball.y-ball.r);
        if(Math.abs(ox)<Math.abs(oy))ball.vx*=-1;else ball.vy*=-1;
        break;
      }
    }
    if(ball.y-ball.r>H){lives--;snd_die();if(lives<=0){state='dead';overMsg.classList.add('show');}else{initBall();state='idle';startMsg.classList.remove('hidden');}}
    if(bricks.every(b=>!b.alive)){state='win';snd_win();winMsg.classList.add('show');}
  }

  function loop(ts=0){
    rafId=requestAnimationFrame(loop);
    if(isMobile&&ts-lastTs<MS_PER_FRAME)return;
    lastTs=ts;
    ctx.clearRect(0,0,W,H);
    drawBg();drawBricks();drawParticles();drawPaddle();drawBall();drawHUD();
    if(state==='running'){
      updatePaddle();updateBall();
      if(!isMobile){particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.life-=p.decay;});particles=particles.filter(p=>p.life>0);}
    } else if(state==='idle'){updatePaddle();}
  }

  window._brickStart=function(){if(rafId)return;resize();reset();loop();};
  window._brickStop=function(){if(rafId){cancelAnimationFrame(rafId);rafId=null;}showCursor();state='idle';startMsg.classList.remove('hidden');overMsg.classList.remove('show');winMsg.classList.remove('show');};
}
