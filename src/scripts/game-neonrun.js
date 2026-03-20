import { Application, Graphics, Container, RenderTexture, Sprite } from 'pixi.js';

export function initNeonRun() {
  const canvasEl   = document.getElementById('dino-canvas');
  if (!canvasEl) return;
  const startMsg   = document.getElementById('game-start-msg');
  const overMsg    = document.getElementById('game-over-msg');
  const scoreDis   = document.getElementById('score-display');
  const hiscoreDis = document.getElementById('nr-hiscore-display');
  const btnJump    = document.getElementById('btn-jump');
  const btnDuck    = document.getElementById('btn-duck');

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  const MAX_DPR  = isMobile ? 1.5 : Math.min(window.devicePixelRatio || 1, 2);

  // ── AUDIO ──
  let _ac = null;
  function ac(){if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();if(_ac.state==='suspended')_ac.resume();return _ac;}
  function tone(type,f0,f1,dur,gain,t=0){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type=type;o.frequency.setValueAtTime(f0,a.currentTime+t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,a.currentTime+t+dur);g.gain.setValueAtTime(gain,a.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+t+dur);o.start(a.currentTime+t);o.stop(a.currentTime+t+dur+.01);}catch(e){}}
  function snd_jump(){tone('sine',320,680,.22,.32);tone('triangle',640,1200,.14,.1);}
  function snd_land(){tone('sine',220,80,.1,.28);}
  function snd_duck(){tone('sawtooth',500,160,.12,.14);}
  function snd_die(){[220,165,110].forEach((f,i)=>tone('sawtooth',f*1.5,f*.5,.38,.22,i*.07));}
  function snd_milestone(){[1,1.25,1.5,2].forEach((m,i)=>tone('triangle',440*m,null,.16,.16,i*.07));}
  function snd_step(fr,spd){const iv=Math.max(6,Math.round(12-spd));if(fr%iv!==0)return;tone('square',fr%(iv*2)===0?180:140,null,.04,.04);}

  // Logical coordinate space
  const LW=880, LH=220;
  const groundLineY = LH - 24;
  const DINO_W=26, DINO_H=34, DUCK_H=18;

  let app = null;
  let bgSprite, gridGfx, groundGfx, dinoGfx, obstaclesCont, particleCont, boltsCont;
  let state='idle', score=0, hiscore=0, frame=0, speed=4;
  let particles=[], obstacles=[], nextObs=100, gridOffsetY=0;
  const dino={x:70,vy:0,y:0,onGround:true,ducking:false,legPhase:0,
    get drawY(){return groundLineY-(this.ducking?DUCK_H:DINO_H)+this.y;}};

  function genMtn(amp,base){
    const pts=[{x:0,y:LH*base}];
    for(let x=0;x<=LW;x+=36)pts.push({x,y:LH*base-Math.random()*LH*amp*(.3+Math.random()*.4)});
    pts.push({x:LW,y:LH*base},{x:LW,y:LH},{x:0,y:LH});
    return pts;
  }
  const mtn1=genMtn(.7,.5), mtn2=genMtn(.42,.42);

  function buildBgTexture(renderer){
    const rt=RenderTexture.create({width:LW,height:LH,resolution:1});
    const g=new Graphics();
    // sky
    g.rect(0,0,LW,LH).fill({color:0x04020e});
    for(let i=0;i<6;i++) g.rect(0,i*(LH/6),LW,LH/6).fill({color:0x0b0620,alpha:0.03*(6-i)});
    // stars
    const sc=isMobile?20:55;
    for(let i=0;i<sc;i++){const x=Math.random()*LW,y=Math.random()*(LH*.52),r=Math.random()*1.1+.3;g.circle(x,y,r).fill({color:0xf0ecff,alpha:.3+Math.random()*.4});}
    // sun — lower semicircle, synthwave retro
    const sx=LW/2,sy=LH*.38,sr=75;
    if(!isMobile){
      g.circle(sx,sy,sr*2.2).fill({color:0xff2d78,alpha:.06});
      g.circle(sx,sy,sr*1.5).fill({color:0xff6baf,alpha:.08});
    }
    // Semicircle: moveTo left edge of diameter, arc clockwise to right edge, close with straight line (diameter)
    g.moveTo(sx-sr,sy).arc(sx,sy,sr,Math.PI,0,false).lineTo(sx-sr,sy).fill({color:0xff2d78});
    // stripes clipped inside semicircle via chord width (only below center line)
    for(let i=0;i<8;i++){
      const ly=sy-5-i*7;
      if(ly<sy-sr) break;
      const stripeH=3.5;
      const dy=ly+stripeH/2-sy;
      const halfW=Math.sqrt(Math.max(0,sr*sr-dy*dy));
      g.rect(sx-halfW,ly,halfW*2,stripeH).fill({color:0x04020e,alpha:.88});
    }
    // mountains
    [mtn2,mtn1].forEach((pts,idx)=>{
      const flat=pts.flatMap(p=>[p.x,p.y]);
      g.poly(flat).fill({color:0x070412,alpha:.88});
      g.poly(flat).fill({color:idx===0?0x2b1460:0x3d1a80,alpha:idx===0?.15:.35});
    });
    renderer.render({container:g,target:rt,clear:true});
    g.destroy();
    return rt;
  }

  async function initPixi(){
    app=new Application();
    // Get real CSS dimensions of the canvas container
    const rect=canvasEl.getBoundingClientRect();
    const cw=rect.width||880, ch=rect.height||220;
    await app.init({
      canvas:canvasEl, width:cw, height:ch,
      resolution:Math.min(window.devicePixelRatio||1,MAX_DPR),
      autoDensity:true, backgroundColor:0x04020e,
      antialias:false, powerPreference:'high-performance',
    });
    app.ticker.maxFPS=isMobile?30:60;
    // Scale stage so all game logic uses LW×LH coords
    app.stage.scale.set(cw/LW, ch/LH);

    bgSprite=new Sprite(buildBgTexture(app.renderer));
    bgSprite.width=LW; bgSprite.height=LH;
    app.stage.addChild(bgSprite);

    gridGfx=new Graphics(); app.stage.addChild(gridGfx);
    groundGfx=new Graphics(); app.stage.addChild(groundGfx);
    obstaclesCont=new Container(); app.stage.addChild(obstaclesCont);
    particleCont=new Graphics(); app.stage.addChild(particleCont); // single batch Graphics
    boltsCont=new Graphics(); app.stage.addChild(boltsCont);
    dinoGfx=new Graphics(); app.stage.addChild(dinoGfx);

    drawGround();
    app.ticker.add(tick);
    app.ticker.stop();
  }

  function drawGround(){
    groundGfx.clear();
    groundGfx.rect(0,groundLineY,LW,2).fill({color:0xff2d78});
    groundGfx.rect(0,groundLineY+2,LW,22).fill({color:0xff2d78,alpha:.15});
    if(!isMobile) groundGfx.rect(0,groundLineY-1,LW,1).fill({color:0xff2d78,alpha:.4});
  }

  function spawnParticles(x,y,type){
    if(isMobile)return;
    const n=type==='jump'?6:14;
    for(let i=0;i<n;i++){
      const ang=type==='jump'?Math.PI+Math.random()*Math.PI:Math.random()*Math.PI*2;
      const spd=type==='jump'?1+Math.random()*3:2+Math.random()*5;
      particles.push({x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,life:1,decay:.04+Math.random()*.04,r:2+Math.random()*3,color:type==='jump'?0x00f5ff:0xffd93d,gfx:null});
    }
  }

  function spawnObs(){
    const roll=Math.random();let w,h,type;
    if(roll<.5){w=12+Math.random()*10;h=26+Math.random()*24;type='cactus';}
    else if(roll<.8){w=44+Math.random()*28;h=14;type='bird';}
    else{w=10;h=42+Math.random()*18;type='tall';}
    const yOff=type==='bird'?-(18+Math.random()*36):0;
    const color=roll<.5?0xff2d78:0xb44fff;
    const gfx=new Graphics();
    obstaclesCont.addChild(gfx);
    const o={x:LW+20,y:groundLineY-h+yOff,w,h,type,color,gfx,roll};
    obstacles.push(o);
    redrawObs(o,0);
  }

  function redrawObs(o,flapY=0){
    const g=o.gfx; g.clear();
    if(o.type==='bird'){
      g.rect(o.w*.3,4,o.w*.4,o.h-2).fill({color:o.color});
      g.rect(o.w*.62,0,o.w*.22,o.h*.7).fill({color:o.color});
      g.rect(o.w*.84,2,o.w*.18,3).fill({color:o.color});
      g.rect(0,flapY,o.w*.32,4).fill({color:o.color});
      g.rect(o.w*.04,flapY-3,o.w*.22,4).fill({color:o.color});
      g.rect(o.w*.68,flapY,o.w*.32,4).fill({color:o.color});
      g.rect(o.w*.74,flapY-3,o.w*.22,4).fill({color:o.color});
      g.rect(o.w*.6,-4,4,5).fill({color:0xff2d78});
      g.rect(o.w*.68,2,4,4).fill({color:0x04020e});
    } else if(o.type==='cactus'){
      g.rect(o.w*.3,0,o.w*.4,o.h).fill({color:o.color});
      g.rect(o.w*.35,-4,o.w*.3,5).fill({color:o.color});
      g.rect(0,o.h*.22,o.w*.32,o.w*.35).fill({color:o.color});
      g.rect(0,o.h*.1,o.w*.32,o.h*.18).fill({color:o.color});
      g.rect(o.w*.68,o.h*.32,o.w*.32,o.w*.35).fill({color:o.color});
      g.rect(o.w*.68,o.h*.2,o.w*.32,o.h*.2).fill({color:o.color});
      g.rect(o.w*.04,o.h*.08,o.w*.2,5).fill({color:o.color});
      g.rect(o.w*.72,o.h*.18,o.w*.2,5).fill({color:o.color});
    } else {
      const cx=o.w/2;
      g.rect(cx-3,0,6,o.h).fill({color:0xffd93d});
      g.rect(-5,0,o.w+10,5).fill({color:0xffd93d});
      g.rect(-2,5,o.w+4,3).fill({color:0xffd93d});
      g.rect(-3,o.h*.45,o.w+6,4).fill({color:0xffd93d});
      g.rect(-5,o.h-5,o.w+10,5).fill({color:0xffd93d});
      g.circle(-5,2,4.5).fill({color:0xffd93d});
      g.circle(o.w+5,2,4.5).fill({color:0xffd93d});
      g.circle(-5,2,2).fill({color:0x04020e});
      g.circle(o.w+5,2,2).fill({color:0x04020e});
    }
    g.x=o.x; g.y=o.y;
  }

  function reset(){
    score=0;frame=0;speed=4;
    dino.y=0;dino.vy=0;dino.onGround=true;dino.ducking=false;dino.legPhase=0;
    obstacles.forEach(o=>{obstaclesCont.removeChild(o.gfx);o.gfx.destroy();});
    obstacles=[];nextObs=100;
    particles=[];
    if(particleCont) particleCont.clear();
    gridOffsetY=0;
  }
  window._neonRunReset=function(){state='idle';reset();startMsg.classList.remove('hidden');overMsg.classList.remove('show');};

  function collides(ax,ay,aw,ah,b){const pad=4;return ax+pad<b.x+b.w-pad&&ax+aw-pad>b.x+pad&&ay+pad<b.y+b.h-pad&&ay+ah-pad>b.y+pad;}

  function doJump(){
    if(state==='idle'){state='running';startMsg.classList.add('hidden');overMsg.classList.remove('show');reset();return;}
    if(state==='dead'){state='running';overMsg.classList.remove('show');reset();return;}
    if(state==='running'&&dino.onGround){dino.vy=-11.5;dino.onGround=false;snd_jump();spawnParticles(dino.x+DINO_W/2,groundLineY,'jump');}
  }
  function startDuck(){if(state==='running'&&!dino.ducking){dino.ducking=true;snd_duck();}}
  function stopDuck(){dino.ducking=false;}

  window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();doJump();}if(e.code==='ArrowDown'){e.preventDefault();startDuck();}},{passive:false});
  window.addEventListener('keyup',e=>{if(e.code==='ArrowDown')stopDuck();});
  canvasEl.addEventListener('touchstart',e=>{e.preventDefault();doJump();},{passive:false});
  if(btnJump){btnJump.addEventListener('touchstart',e=>{e.preventDefault();doJump();},{passive:false});btnJump.addEventListener('mousedown',e=>{e.preventDefault();doJump();});}
  if(btnDuck){btnDuck.addEventListener('touchstart',e=>{e.preventDefault();startDuck();},{passive:false});btnDuck.addEventListener('touchend',e=>{e.preventDefault();stopDuck();},{passive:false});btnDuck.addEventListener('mousedown',()=>startDuck());btnDuck.addEventListener('mouseup',()=>stopDuck());}

  function tick(){
    frame++;
    if(!isMobile){
      gridOffsetY=(gridOffsetY+speed*.5)%60;
      gridGfx.clear();
      const horizon=LH*.5;
      // vertical perspective lines — only draw if destination is within canvas
      for(let x=-6;x<=6;x++){
        const bx=LW/2+x*72;
        const ex=LW/2+(bx-LW/2)*5;
        if(ex < 0 || ex > LW) continue; // skip lines that exit canvas
        gridGfx.moveTo(bx,horizon).lineTo(ex,groundLineY+6).stroke({color:0xff2d78,alpha:.08,width:.8});
      }
      // horizontal scan lines — xoff already constrains them naturally
      for(let i=0;i<10;i++){
        const t=(i/10+gridOffsetY/600)%1;
        const y=horizon+(groundLineY-horizon)*Math.pow(t,1.5);
        const xoff=(1-t)*LW*.5;
        if(xoff>=LW/2) continue; // skip fully collapsed lines
        gridGfx.moveTo(xoff,y).lineTo(LW-xoff,y).stroke({color:0xff2d78,alpha:t*.28,width:.8});
      }
    }

    if(state==='running'){
      const wasOnGround=dino.onGround;dino.vy+=.65;dino.y+=dino.vy;
      if(dino.y>=0){dino.y=0;dino.vy=0;if(!wasOnGround)snd_land();dino.onGround=true;}
      nextObs--;if(nextObs<=0){spawnObs();nextObs=Math.floor(58+Math.random()*90);}
      obstacles=obstacles.filter(o=>{if(o.x<-80){obstaclesCont.removeChild(o.gfx);o.gfx.destroy();return false;}return true;});
      obstacles.forEach(o=>{
        o.x-=speed;
        if(o.type==='bird') redrawObs(o,Math.sin(frame*.22)*7);
        else o.gfx.x=o.x;
      });

      // ── ELECTRIC BOLTS on tall towers (desktop only) ──
      if(!isMobile && boltsCont){
        boltsCont.clear();
        const t=frame*.08;
        obstacles.filter(o=>o.type==='tall').forEach(o=>{
          const cx2=o.x+o.w/2;
          const p1=Math.sin(t*2.3), p2=Math.sin(t*2.3+Math.PI);
          // helper: jagged lightning bolt between two points
          const bolt=(x1,y1,x2,y2,segs,color,alpha)=>{
            const dx=(x2-x1)/segs, dy=(y2-y1)/segs;
            for(let i=0;i<segs-1;i++){
              const j=Math.sin(t*6.7+i*2.9+x1*.02)*7;
              const ax=x1+dx*i+j, ay=y1+dy*i+j*.4;
              const bx2=x1+dx*(i+1)+(i===segs-2?0:Math.sin(t*6.7+(i+1)*2.9+x1*.02)*7);
              const by2=y1+dy*(i+1)+(i===segs-2?0:Math.sin(t*6.7+(i+1)*2.9+x1*.02)*7*.4);
              boltsCont.moveTo(ax,ay).lineTo(bx2,by2).stroke({color,alpha,width:1.2});
            }
          };
          // horizontal arcs from isolators to center
          if(p1>-.2) bolt(o.x-5,o.y+2,cx2,o.y+2,6,0x00f5ff,.55+p1*.35);
          if(p2>-.2) bolt(o.x+o.w+5,o.y+2,cx2,o.y+2,6,0x00f5ff,.55+p2*.35);
          // diagonal arcs
          if(p1>.3) bolt(o.x-5,o.y+2,cx2-3,o.y+o.h*.44,8,0x7bf5ff,.35);
          if(p2>.3) bolt(o.x+o.w+5,o.y+2,cx2+3,o.y+o.h*.44,8,0x7bf5ff,.35);
          // vertical center bolts
          bolt(cx2,o.y+7,cx2,o.y+o.h*.43,9,0xffd93d,.55);
          bolt(cx2,o.y+o.h*.49,cx2,o.y+o.h-7,9,0xffd93d,.55);
          // pulsing glow on isolators
          const gr=5+Math.abs(Math.sin(t*3.1))*4;
          const glowA=.25+Math.abs(Math.sin(t*3.1))*.45;
          boltsCont.circle(o.x-5,o.y+2,gr).fill({color:0x00f5ff,alpha:glowA});
          boltsCont.circle(o.x+o.w+5,o.y+2,gr).fill({color:0x00f5ff,alpha:glowA});
        });
      }
      if(frame%6===0){const prev=score;score++;hiscore=Math.max(hiscore,score);if(score%100===0&&score!==prev)snd_milestone();}
      speed=4+Math.floor(score/80)*.6;
      if(dino.onGround&&!dino.ducking)snd_step(frame,speed);
      const dw=dino.ducking?DINO_W+8:DINO_W,dh=dino.ducking?DUCK_H:DINO_H;
      for(const o of obstacles){if(collides(dino.x,groundLineY-dh+dino.y,dw,dh,o)){state='dead';snd_die();spawnParticles(dino.x+dw/2,groundLineY-dh/2,'die');overMsg.classList.add('show');break;}}
      if(!isMobile){
        particleCont.clear();
        particles.forEach(p=>{
          p.x+=p.vx; p.y+=p.vy; p.vy+=.14; p.life-=p.decay;
        });
        particles=particles.filter(p=>p.life>0);
        particles.forEach(p=>{
          particleCont.circle(p.x,p.y,Math.max(0,p.r*p.life)).fill({color:p.color,alpha:p.life*.9});
        });
      }
    }

    // draw dino
    dinoGfx.clear();
    const dx=dino.x,dy=dino.drawY,C=0x00f5ff;
    if(dino.ducking){dinoGfx.rect(dx,dy,DINO_W+8,DUCK_H).fill({color:C});dinoGfx.rect(dx+DINO_W+2,dy+4,5,5).fill({color:0x04020e});}
    else{
      dinoGfx.rect(dx,dy+8,DINO_W,DINO_H-8).fill({color:C});
      dinoGfx.rect(dx+6,dy,DINO_W,13).fill({color:C});
      dinoGfx.rect(dx+DINO_W+1,dy+3,5,5).fill({color:0x04020e});
      dinoGfx.rect(dx+DINO_W+3,dy+11,5,2.5).fill({color:C});
      dinoGfx.rect(dx-7,dy+DINO_H-12,9,7).fill({color:C});
      if(dino.onGround){const lp=Math.sin(dino.legPhase);dinoGfx.rect(dx+4,dy+DINO_H,3+Math.round(lp*2),8).fill({color:C});dinoGfx.rect(dx+14,dy+DINO_H,3+Math.round(lp*-2),8).fill({color:C});dino.legPhase+=.28*(speed/4);}
      else{dinoGfx.rect(dx+4,dy+DINO_H,4,7).fill({color:C});dinoGfx.rect(dx+14,dy+DINO_H,-3,7).fill({color:C});}
    }

    // DOM HUD
    if(scoreDis)   scoreDis.textContent   = String(score).padStart(5,'0');
    if(hiscoreDis) hiscoreDis.textContent = String(hiscore).padStart(5,'0');
  }

  window._neonRunStart=function(){
    if(app&&app.ticker.started)return;
    if(!app){initPixi().then(()=>{window._neonRunReset();app.ticker.start();});return;}
    window._neonRunReset();app.ticker.start();
  };
  window._neonRunStop=function(){
    if(app)app.ticker.stop();
    state='idle';startMsg.classList.remove('hidden');overMsg.classList.remove('show');
  };
  window._neonRunResize=function(){
    if(!app)return;
    const rect=canvasEl.getBoundingClientRect();
    if(!rect.width)return;
    app.renderer.resize(rect.width, rect.height);
    app.stage.scale.set(rect.width/LW, rect.height/LH);
  };
}
