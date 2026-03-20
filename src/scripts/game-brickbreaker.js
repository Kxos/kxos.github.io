import { Application, Graphics, Container, RenderTexture, Sprite } from 'pixi.js';

export function initBrickBreaker() {
  const canvasEl   = document.getElementById('bb-canvas');
  if (!canvasEl) return;
  const startMsg   = document.getElementById('bb-start-msg');
  const overMsg    = document.getElementById('bb-over-msg');
  const winMsg     = document.getElementById('bb-win-msg');
  const scoreDis   = document.getElementById('bb-score-display');
  const hiscoreDis = document.getElementById('bb-hiscore-display');
  const livesDis   = document.getElementById('bb-lives-display');
  const btnLeft    = document.getElementById('bb-btn-left');
  const btnRight   = document.getElementById('bb-btn-right');

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  const MAX_DPR  = isMobile ? 1.5 : Math.min(window.devicePixelRatio || 1, 2);
  const TARGET_FPS = isMobile ? 30 : 60;

  // ── AUDIO ──
  let _ac=null;
  function ac(){if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();if(_ac.state==='suspended')_ac.resume();return _ac;}
  function tone(type,f0,f1,dur,gain,t=0){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type=type;o.frequency.setValueAtTime(f0,a.currentTime+t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,a.currentTime+t+dur);g.gain.setValueAtTime(gain,a.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+t+dur);o.start(a.currentTime+t);o.stop(a.currentTime+t+dur+.01);}catch(e){}}
  const HIT_F=[880,740,660,554,440,370,330];
  function snd_hit(ri){const f=HIT_F[ri%7];tone('square',f,f*.5,.13,.18);}
  function snd_paddle(){tone('sine',300,180,.09,.22);}
  function snd_wall(){tone('triangle',200,120,.08,.12);}
  function snd_die(){[440,330,220,110].forEach((f,i)=>tone('sawtooth',f,null,.12,.14,i*.08));}
  function snd_win(){[440,554,659,880,1108].forEach((f,i)=>tone('square',f,null,.16,.12,i*.08));}
  function snd_milestone(){[660,880,1108].forEach((f,i)=>tone('square',f,null,.12,.1,i*.06));}

  // ── PIXI APP ──
  let app=null;
  let bgSprite, bricksCont, paddleGfx, ballGfx, particleCont;
  let W=0, H=0;

  // ── WORKER (fisica off-thread) ──
  let worker=null;
  let renderState=null, uiState='idle';
  let mouseX=-1, mobileDir=0;

  const ROW_HEX=[0xff2d78,0xff6baf,0xb44fff,0x7b2fff,0x00f5ff,0x7bf5ff,0xffd93d];

  function createWorker(){
    const code=`
const RC=[0xff2d78,0xff6baf,0xb44fff,0x7b2fff,0x00f5ff,0x7bf5ff,0xffd93d];
const RC_CSS=['#ff2d78','#ff6baf','#b44fff','#7b2fff','#00f5ff','#7bf5ff','#ffd93d'];
let W=0,H=0,level=1,score=0,hiscore=0,lives=3,hitCount=0,state='idle';
let paddle={},ball={},bricks=[];
const BR=${isMobile?5:7},BC=${isMobile?8:10},BP=${isMobile?3:4},BT=0.12;
function bspd(){return Math.min(W,H)*0.016*(1+(level-1)*0.2);}
function iPaddle(){const pw=Math.min(${isMobile?90:140},W*${isMobile?.18:.24});paddle={w:pw,h:Math.max(10,H*.022),x:W/2-pw/2,y:H-H*.08};}
function iBricks(){bricks=[];const bw=(W-BP*(BC+1))/BC,bh=Math.min(${isMobile?14:18},(H*.35)/BR-BP),ty=H*BT;for(let r=0;r<BR;r++){const ci=r%7,hp=r<2?2:1;for(let c=0;c<BC;c++)bricks.push({x:BP+c*(bw+BP),y:ty+r*(bh+BP),w:bw,h:bh,alive:true,hp,ci,color:RC_CSS[ci],hex:RC[ci],ft:0});}}
function iBall(){const spd=bspd(),ang=-Math.PI/2+(Math.random()-.5)*.5;ball={x:W/2,y:paddle.y-12,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,r:Math.max(6,W*.012),stuck:true};}
function reset(kl){score=0;lives=3;hitCount=0;if(!kl)level=1;state='idle';iPaddle();iBricks();iBall();}
function boost(){const max=bspd()*${isMobile?2.2:1.5},cur=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);if(cur<max){const b=Math.min(${isMobile?1.06:1.025},max/cur);ball.vx*=b;ball.vy*=b;}hitCount++;}
function post(type,d={}){self.postMessage({type,...d});}
function snap(){return{px:paddle.x,py:paddle.y,pw:paddle.w,ph:paddle.h,bx:ball.x,by:ball.y,br:ball.r,bstuck:ball.stuck,bricks:bricks.map(b=>b.alive?{x:b.x,y:b.y,w:b.w,h:b.h,hp:b.hp,hex:b.hex,ci:b.ci,ft:b.ft}:null),score,hiscore,lives,level,state};}
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
  if(type==='init'){W=data.W;H=data.H;reset();self.postMessage({type:'ready',...snap()});}
  else if(type==='resize'){W=data.W;H=data.H;iPaddle();iBricks();iBall();}
  else if(type==='paddleMove'){paddle.x=data.x-paddle.w/2;}
  else if(type==='paddleDir'){paddle.x+=data.dir*paddle.w*.12;}
  else if(type==='launch'){if(state==='idle'){state='running';ball.stuck=false;post('launched');}}
  else if(type==='restart'){reset(data&&data.keepLevel);self.postMessage({type:'ready',...snap()});}
  else if(type==='nextLevel'){level++;iPaddle();iBricks();iBall();state='idle';self.postMessage({type:'ready',...snap()});}
  else if(type==='tick'){step();self.postMessage({type:'frame',...snap()});}
};`;
    const blob=new Blob([code],{type:'application/javascript'});
    const url=URL.createObjectURL(blob);
    const w=new Worker(url);
    URL.revokeObjectURL(url);
    return w;
  }

  function workerMsg(type,data){if(worker)worker.postMessage({type,data});}

  function buildBgTexture(renderer){
    const rt=RenderTexture.create({width:W,height:H,resolution:1});
    const g=new Graphics();
    g.rect(0,0,W,H).fill({color:0x04020e});
    if(!isMobile){
      // grid
      const gs=Math.round(W/20);
      for(let x=0;x<W;x+=gs)g.moveTo(x,0).lineTo(x,H).stroke({color:0xb44fff,alpha:.06,width:1});
      for(let y=0;y<H;y+=gs)g.moveTo(0,y).lineTo(W,y).stroke({color:0xb44fff,alpha:.06,width:1});
    }
    // sun
    const sx=W/2,sy=H*.04,sr=H*.07;
    if(!isMobile) g.circle(sx,sy,sr*2).fill({color:0xff2d78,alpha:.12});
    g.circle(sx,sy,sr).fill({color:0xff2d78});
    g.circle(sx,sy,sr).fill({color:0xffd93d,alpha:.4});
    // sun stripes — clipped to circle using chord width at each stripe y
    for(let i=0;i<6;i++){
      const ty=sy+sr*.25+i*sr*.145;
      if(ty>=sy+sr) break;
      const stripeH=Math.min(sr*.07, sy+sr-ty);
      // chord half-width at stripe center
      const dy=ty+stripeH/2-sy;
      const halfW=Math.sqrt(Math.max(0, sr*sr - dy*dy));
      g.rect(sx-halfW, ty, halfW*2, stripeH).fill({color:0x04020e});
    }
    // stars
    const sc=isMobile?20:55;
    for(let i=0;i<sc;i++){const x=Math.random()*W,y=Math.random()*H*.55,r=Math.random()*1.2+.3;g.circle(x,y,r).fill({color:0xf0ecff,alpha:.3+Math.random()*.4});}
    renderer.render({container:g,target:rt,clear:true});
    g.destroy();
    return rt;
  }

  // Brick graphics objects pool
  let brickGfxPool=[];
  function ensureBrickGfx(count){
    while(brickGfxPool.length<count){const g=new Graphics();bricksCont.addChild(g);brickGfxPool.push(g);}
    brickGfxPool.forEach(g=>g.visible=false);
  }

  function renderFrame(s){
    if(!s||!app)return;

    // ── BRICKS ──
    const alive=s.bricks?s.bricks.filter(Boolean):[];
    ensureBrickGfx(alive.length);
    alive.forEach((b,i)=>{
      const g=brickGfxPool[i]; g.visible=true;
      const alpha=b.ft>0?.4+.6*Math.sin(b.ft*Math.PI):1;
      g.clear();
      if(isMobile){
        g.rect(b.x,b.y,b.w,b.h).fill({color:b.hex,alpha});
        if(b.hp===2) g.rect(b.x+2,b.y+b.h*.3,b.w-4,b.h*.12).fill({color:0xffffff,alpha:.25});
      } else {
        g.roundRect(b.x,b.y,b.w,b.h,3).fill({color:b.hex,alpha});
        g.roundRect(b.x,b.y,b.w,b.h,3).stroke({color:b.hex,alpha:alpha*.4,width:1});
        if(b.hp===2) g.rect(b.x+4,b.y+b.h*.3,b.w-8,b.h*.12).fill({color:0xffffff,alpha:.35});
      }
    });

    // ── PADDLE ──
    paddleGfx.clear();
    if(isMobile){
      paddleGfx.rect(s.px,s.py,s.pw,s.ph).fill({color:0x00f5ff});
    } else {
      paddleGfx.roundRect(s.px,s.py,s.pw,s.ph,s.ph/2).fill({color:0x7bf5ff});
      paddleGfx.roundRect(s.px+2,s.py+1,s.pw-4,s.ph-2,s.ph/2).fill({color:0x00f5ff});
      paddleGfx.rect(s.px+4,s.py+s.ph,s.pw-8,4).fill({color:0x00f5ff,alpha:.3});
    }

    // ── BALL ──
    ballGfx.clear();
    if(isMobile){
      ballGfx.circle(s.bx,s.by,s.br).fill({color:0xffffff});
    } else {
      // glow rings
      ballGfx.circle(s.bx,s.by,s.br*1.8).fill({color:0x00f5ff,alpha:.06});
      ballGfx.circle(s.bx,s.by,s.br*1.3).fill({color:0x00f5ff,alpha:.12});
      ballGfx.circle(s.bx,s.by,s.br).fill({color:0x7bf5ff});
      ballGfx.circle(s.bx-s.br*.3,s.by-s.br*.3,s.br*.4).fill({color:0xffffff,alpha:.7});
    }

    // ── DOM HUD ──
    if(scoreDis)   scoreDis.textContent   = String(s.score).padStart(5,'0');
    if(hiscoreDis) hiscoreDis.textContent = String(s.hiscore).padStart(5,'0');
    if(livesDis){
      livesDis.querySelectorAll('.bb-heart').forEach((el,i)=>{
        el.classList.toggle('alive',i<(s.lives||0));
      });
    }
  }

  function updateDOMHud(d){
    if(scoreDis)   scoreDis.textContent   = String(d.score||0).padStart(5,'0');
    if(hiscoreDis) hiscoreDis.textContent = String(d.hiscore||0).padStart(5,'0');
    if(livesDis) livesDis.querySelectorAll('.bb-heart').forEach((el,i)=>el.classList.toggle('alive',i<(d.lives||0)));
  }

  function onWorkerMsg(e){
    const d=e.data;
    switch(d.type){
      case 'frame': case 'ready':
        renderState=d; uiState=d.state||uiState; renderFrame(d); updateDOMHud(d);
        // nasconde tutti gli overlay quando il worker torna in idle (es. dopo nextLevel)
        if(d.state==='idle'){
          winMsg.classList.remove('show');
          overMsg.classList.remove('show');
        }
        break;
      case 'launched': uiState='running'; startMsg.classList.add('hidden'); break;
      case 'lifeLost': uiState='idle'; snd_die(); updateDOMHud(d); startMsg.classList.remove('hidden'); break;
      case 'dead':  uiState='dead';  snd_die(); overMsg.classList.add('show'); break;
      case 'win':   uiState='win';   snd_win(); winMsg.classList.add('show'); break;
      case 'wall':   snd_wall();     break;
      case 'paddle': snd_paddle();   break;
      case 'hit':    snd_hit(d.ri);  break;
      case 'brick':  if(score%500===0&&score>0)snd_milestone(); break;
    }
  }

  // ── INPUT ──
  const curDot=document.getElementById('cur-dot'),curRing=document.getElementById('cur-ring');
  function hideCursor(){if(curDot)curDot.style.opacity='0';if(curRing)curRing.style.opacity='0';}
  function showCursor(){if(curDot)curDot.style.opacity='';if(curRing)curRing.style.opacity='';}
  canvasEl.addEventListener('mouseenter',hideCursor);
  canvasEl.addEventListener('mouseleave',()=>{mouseX=-1;showCursor();});
  canvasEl.addEventListener('mousemove',e=>{if(mobileDir===0){const r=canvasEl.getBoundingClientRect();mouseX=e.clientX-r.left;}});
  canvasEl.addEventListener('touchmove',e=>{e.preventDefault();if(mobileDir===0){const r=canvasEl.getBoundingClientRect();mouseX=e.touches[0].clientX-r.left;}},{passive:false});
  canvasEl.addEventListener('touchstart',e=>{
    e.preventDefault();hideCursor();
    const r=canvasEl.getBoundingClientRect();mouseX=e.touches[0].clientX-r.left;
    if(uiState==='idle')workerMsg('launch');
    else if(uiState==='dead'){stopGame();resize();startGame();}
    else if(uiState==='win'){winMsg.classList.remove('show');workerMsg('nextLevel');}
  },{passive:false});
  canvasEl.addEventListener('touchend',()=>showCursor(),{passive:true});
  function startMove(dir){mobileDir=dir;mouseX=-1;}
  function stopMove(){mobileDir=0;}
  [btnLeft,btnRight].forEach((btn,side)=>{
    if(!btn)return;const dir=side===0?-1:1;
    btn.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();startMove(dir);},{passive:false});
    btn.addEventListener('touchend',e=>{e.preventDefault();e.stopPropagation();stopMove();},{passive:false});
    btn.addEventListener('mousedown',()=>startMove(dir));
    btn.addEventListener('mouseup',stopMove);btn.addEventListener('mouseleave',stopMove);
  });
  window.addEventListener('keydown',e=>{
    if(!canvasEl.closest('.game-inner')?.classList.contains('active'))return;
    if(e.code==='ArrowLeft'  || e.key==='ArrowLeft')  { e.preventDefault(); startMove(-1); return; }
    if(e.code==='ArrowRight' || e.key==='ArrowRight') { e.preventDefault(); startMove(1);  return; }
    if(e.code==='Space'||e.key===' '){
      e.preventDefault();
      if(uiState==='idle')workerMsg('launch');
      else if(uiState==='dead'){stopGame();resize();startGame();}
      else if(uiState==='win'){winMsg.classList.remove('show');workerMsg('nextLevel');}
    }
  });
  window.addEventListener('keyup',e=>{
    if(e.code==='ArrowLeft'||e.key==='ArrowLeft'||e.code==='ArrowRight'||e.key==='ArrowRight') stopMove();
  });

  function launch(){if(uiState!=='idle')return;workerMsg('launch');}

  async function initPixi(){
    app=new Application();
    const rect=canvasEl.getBoundingClientRect();
    W=rect.width||600; H=rect.height||420;
    await app.init({
      canvas:canvasEl, width:W, height:H,
      resolution:Math.min(window.devicePixelRatio||1,MAX_DPR),
      autoDensity:true, backgroundColor:0x04020e,
      antialias:false, powerPreference:'high-performance',
    });
    app.ticker.maxFPS=TARGET_FPS;

    bgSprite=new Sprite(buildBgTexture(app.renderer));
    bgSprite.width=W; bgSprite.height=H;
    app.stage.addChild(bgSprite);

    bricksCont=new Container(); app.stage.addChild(bricksCont);
    paddleGfx=new Graphics(); app.stage.addChild(paddleGfx);
    ballGfx=new Graphics(); app.stage.addChild(ballGfx);
    particleCont=new Container(); app.stage.addChild(particleCont);

    // Ticker — sends input + tick to worker each frame
    app.ticker.add(()=>{
      if(!worker)return;
      if(mouseX>=0)workerMsg('paddleMove',{x:mouseX});
      if(mobileDir!==0)workerMsg('paddleDir',{dir:mobileDir});
      if(uiState==='running'||uiState==='idle')workerMsg('tick');
    });
    app.ticker.stop();
  }

  function resize(){
    if(!app)return;
    const rect=canvasEl.getBoundingClientRect();
    W=rect.width||600; H=rect.height||420;
    app.renderer.resize(W,H);
    if(bgSprite){bgSprite.destroy();bgSprite=new Sprite(buildBgTexture(app.renderer));bgSprite.width=W;bgSprite.height=H;app.stage.addChildAt(bgSprite,0);}
    brickGfxPool.forEach(g=>{bricksCont.removeChild(g);g.destroy();});
    brickGfxPool=[];
    workerMsg('resize',{W,H});
  }
  window._brickResize=()=>{if(app)resize();};

  function startGame(){
    if(worker){worker.terminate();worker=null;}
    worker=createWorker();
    worker.onmessage=onWorkerMsg;
    workerMsg('init',{W,H});
    uiState='idle'; renderState=null;
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
    winMsg.classList.remove('show');
    if(app&&!app.ticker.started)app.ticker.start();
  }

  function stopGame(){
    if(app)app.ticker.stop();
    if(worker){worker.terminate();worker=null;}
    renderState=null;uiState='idle';showCursor();
    startMsg.classList.remove('hidden');
    overMsg.classList.remove('show');
    winMsg.classList.remove('show');
  }

  window._brickStart=function(){
    if(app&&app.ticker.started)return;
    if(!app){initPixi().then(()=>startGame());return;}
    resize();startGame();
  };
  window._brickStop=stopGame;
}
