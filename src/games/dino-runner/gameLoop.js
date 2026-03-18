/**
 * Loop principale del Dino Runner.
 * Gestisce stato, fisica, spawn, collisioni e rendering.
 * Viene chiamato da DinoRunner.jsx che possiede il ref del canvas.
 */

import { LW, LH, GROUND_Y, COLORS } from './constants.js'
import { createDino, updateDino, collides, jump, setDuck } from './logic/physics.js'
import { spawnObstacle, nextSpawnInterval, updateObstacles } from './logic/obstacles.js'
import { spawnParticles, updateParticles } from './logic/particles.js'
import { genMountain, drawBg, drawStars, drawSun, drawMountains, drawGrid, drawGround } from './draw/drawScene.js'
import { drawDino } from './draw/drawDino.js'
import { drawObstacle } from './draw/drawObstacles.js'
import { drawHUD, drawParticles } from './draw/drawHUD.js'
import { playJump, playLand, playDeath, playMilestone, playStep } from './audio/sounds.js'

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768

/**
 * Avvia il game loop sul canvas fornito.
 * Ritorna una funzione `destroy()` che ferma il loop e rimuove gli event listener.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ onScore: (n: number) => void, onGameOver: () => void }} callbacks
 * @returns {{ destroy: () => void, jump: () => void, duck: (v: boolean) => void }}
 */
export function startGameLoop(canvas, { onScore, onGameOver } = {}) {
  const ctx = canvas.getContext('2d')

  // ── Resize canvas (DPR cappato a 1 su mobile per performance) ──
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false
    const dpr        = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    canvas.width     = rect.width  * dpr
    canvas.height    = rect.height * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(canvas.width / LW, canvas.height / LH)
    return true
  }

  resizeCanvas()
  const resizeObs = () => resizeCanvas()
  window.addEventListener('resize', resizeObs, { passive: true })

  // ── Costanti derivate ──
  const W          = LW
  const H          = LH
  const groundLineY = H - GROUND_Y

  // ── Stato gioco ──
  let state    = 'idle'    // 'idle' | 'running' | 'dead'
  let score    = 0
  let hiscore  = 0
  let frame    = 0
  let speed    = 4
  let nextObs  = 100
  let gridOffsetY = 0

  // ── Entità ──
  let dino      = createDino(groundLineY)
  let obstacles = []
  let particles = []

  // ── Scenografia statica ──
  const starCount = isMobile ? 20 : 55
  const stars = Array.from({ length: starCount }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * (H * 0.52),
    r:     Math.random() * 1.1 + 0.3,
    blink: Math.random() * Math.PI * 2,
  }))
  const mountains = [genMountain(0.42, 0.42, W, H), genMountain(0.7, 0.5, W, H)]

  // ── Reset ──
  function reset() {
    score       = 0
    frame       = 0
    speed       = 4
    nextObs     = 100
    gridOffsetY = 0
    dino        = createDino(groundLineY)
    obstacles   = []
    particles   = []
    state       = 'running'
  }

  // ── Azioni pubbliche ──
  function doJump() {
    if (state === 'idle' || state === 'dead') { reset(); return }
    if (state === 'running') {
      if (dino.onGround) {
        jump(dino, () => {
          playJump()
          particles = [...particles, ...spawnParticles(dino.x + 13, groundLineY, 'jump')]
        })
      }
    }
  }

  function doDuck(active) {
    setDuck(dino, active)
  }

  // ── Loop principale ──
  let rafId = null

  function loop() {
    rafId = requestAnimationFrame(loop)
    frame++
    ctx.clearRect(0, 0, W, H)

    // Sfondo
    drawBg(ctx, W, H)
    drawStars(ctx, stars, frame)
    drawSun(ctx, W, H)
    drawMountains(ctx, mountains)
    gridOffsetY = (gridOffsetY + speed * 0.5) % 60
    drawGrid(ctx, W, H, gridOffsetY, groundLineY)
    drawGround(ctx, W, H, groundLineY)

    if (state === 'running') {
      // Fisica dino
      const wasOnGround = dino.onGround
      updateDino(dino, groundLineY)
      if (!wasOnGround && dino.onGround) {
        playLand()
        particles = [...particles, ...spawnParticles(dino.x + 13, groundLineY, 'land')]
      }

      // Animazione passi
      if (dino.onGround && frame % 8 === 0) playStep()

      // Score e velocità
      score++
      if (score % 100 === 0) {
        speed += 0.3
        playMilestone()
      }
      onScore?.(score)

      // Ostacoli
      if (--nextObs <= 0) {
        obstacles = [...obstacles, spawnObstacle(groundLineY)]
        nextObs   = nextSpawnInterval()
      }
      obstacles = updateObstacles(obstacles, speed)

      // Particelle
      particles = updateParticles(particles)

      // Collisioni
      for (const o of obstacles) {
        if (collides(dino, groundLineY, o)) {
          state = 'dead'
          if (score > hiscore) hiscore = score
          particles = [...particles, ...spawnParticles(dino.x + 13, dino.drawY, 'hit')]
          playDeath()
          onGameOver?.()
          break
        }
      }
    }

    // Rendering entità
    obstacles.forEach(o => drawObstacle(ctx, o, frame))
    drawDino(ctx, dino, groundLineY, speed)
    drawParticles(ctx, particles)
    drawHUD(ctx, score, hiscore, W)
  }

  loop()

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeObs)
    },
    jump:  doJump,
    duck:  doDuck,
    state: () => state,
  }
}
