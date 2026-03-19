import { initHero }          from './scripts/hero.js';
import { initUI }            from './scripts/ui.js';
import { initArcadeUnlock, initArcadeLogic } from './scripts/arcade.js';
import { initBrickPreview }  from './scripts/game-brickpreview.js';

initHero();
initUI();
initArcadeUnlock();
initArcadeLogic();
initBrickPreview();

// Lazy load games — solo quando il panel arcade viene aperto
// I moduli vengono scaricati e parsati solo al primo click sul cabinato
window._lazyLoadGames = async function() {
  if (window._gamesLoaded) return;
  window._gamesLoaded = true;
  const [{ initNeonRun }, { initBrickBreaker }] = await Promise.all([
    import('./scripts/game-neonrun.js'),
    import('./scripts/game-brickbreaker.js'),
  ]);
  initNeonRun();
  initBrickBreaker();
};
