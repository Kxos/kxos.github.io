/**
 * Rendering del dinosauro protagonista (stile synthwave cyan).
 */

import { DINO_W, DINO_H, DUCK_H, COLORS } from '../constants.js'

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768

/**
 * Disegna il dino sul canvas in base al suo stato corrente.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} dino   - stato del dinosauro
 * @param {number} groundLineY
 * @param {number} speed  - velocità corrente (per legPhase)
 */
export function drawDino(ctx, dino, groundLineY, speed) {
  const x = dino.x
  const y = dino.drawY
  const w = DINO_W
  const h = dino.ducking ? DUCK_H : DINO_H

  if (!isMobile) { ctx.shadowColor = COLORS.dino; ctx.shadowBlur = 10 }
  ctx.fillStyle = COLORS.dino

  if (dino.ducking) {
    ctx.fillRect(x, y, w + 8, h)
    ctx.fillStyle = '#04020e'
    ctx.fillRect(x + w + 2, y + 4, 5, 5)
  } else {
    ctx.fillRect(x, y + 8, w, h - 8)          // corpo
    ctx.fillRect(x + 6, y, w, 13)              // testa
    ctx.fillStyle = '#04020e'
    ctx.fillRect(x + w + 1, y + 3, 5, 5)       // occhio
    ctx.fillStyle = COLORS.dino
    ctx.fillRect(x + w + 3, y + 11, 5, 2.5)    // bocca
    ctx.fillRect(x - 7, y + h - 12, 9, 7)      // coda

    // zampe animate
    if (dino.onGround) {
      const lp = Math.sin(dino.legPhase)
      ctx.fillRect(x + 4,  y + h, 3 + Math.round(lp * 2),  8)
      ctx.fillRect(x + 14, y + h, 3 + Math.round(lp * -2), 8)
      dino.legPhase += 0.28 * (speed / 4)
    } else {
      ctx.fillRect(x + 4,  y + h,  4,  7)
      ctx.fillRect(x + 14, y + h, -3,  7)
    }
  }

  if (!isMobile) ctx.shadowBlur = 0

  // ombra sul terreno
  if (!isMobile) {
    const dg = ctx.createRadialGradient(x + w / 2, groundLineY, 0, x + w / 2, groundLineY, 28)
    dg.addColorStop(0, 'rgba(0,245,255,.22)')
    dg.addColorStop(1, 'transparent')
    ctx.fillStyle = dg
    ctx.fillRect(x - 8, groundLineY - 4, w + 16, 18)
  }
}
