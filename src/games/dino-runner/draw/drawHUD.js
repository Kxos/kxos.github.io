/**
 * Rendering del HUD: score e hi-score.
 */

import { COLORS } from '../constants.js'

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score
 * @param {number} hiscore
 * @param {number} W
 */
export function drawHUD(ctx, score, hiscore, W) {
  const fs = Math.max(10, W * 0.015)
  ctx.font = `bold ${fs}px 'Share Tech Mono',monospace`

  const s  = String(score).padStart(5, '0')
  const hi = String(hiscore).padStart(5, '0')

  ctx.fillStyle   = COLORS.hiscore
  ctx.shadowColor = COLORS.hiscore
  ctx.shadowBlur  = 5
  ctx.fillText('HI ' + hi, W - 220, 18)
  ctx.shadowBlur  = 0

  ctx.fillStyle   = COLORS.score
  ctx.shadowColor = COLORS.score
  ctx.shadowBlur  = 5
  ctx.fillText('SCORE ' + s, W - 110, 18)
  ctx.shadowBlur  = 0
}

/**
 * Disegna le particelle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x,y,r,life,color }[]} particles
 */
export function drawParticles(ctx, particles) {
  particles.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, Math.PI * 2)
    ctx.fillStyle   = p.color
    ctx.globalAlpha = p.life * 0.9
    ctx.fill()
  })
  ctx.globalAlpha = 1
}
