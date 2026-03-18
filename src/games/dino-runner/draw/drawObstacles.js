/**
 * Rendering degli ostacoli: cactus neon, pterodattilo, torre elettrica.
 */

import { COLORS } from '../constants.js'

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768

/**
 * Dispatcher: seleziona la funzione di draw corretta in base al tipo.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} o   - ostacolo { x, y, w, h, type }
 * @param {number} frame
 */
export function drawObstacle(ctx, o, frame) {
  ctx.save()
  switch (o.type) {
    case 'bird':  drawBird(ctx, o, frame); break
    case 'cactus': drawCactus(ctx, o);    break
    case 'tall':  drawTower(ctx, o, frame); break
  }
  ctx.restore()
}

/* ── Pterodattilo ─────────────────────────────────────────── */
function drawBird(ctx, o, frame) {
  const { x, y, w, h } = o
  const flap = Math.sin(frame * 0.22)

  if (!isMobile) { ctx.shadowColor = COLORS.obs2; ctx.shadowBlur = 10 }
  ctx.fillStyle = COLORS.obs2

  ctx.fillRect(x + w * 0.3, y + 4, w * 0.4, h - 2)  // corpo
  ctx.fillRect(x + w * 0.62, y, w * 0.22, h * 0.7)   // testa
  ctx.fillRect(x + w * 0.84, y + 2, w * 0.18, 3)      // becco

  ctx.fillStyle = '#ff2d78'
  if (!isMobile) { ctx.shadowColor = '#ff2d78'; ctx.shadowBlur = 5 }
  ctx.fillRect(x + w * 0.6, y - 4, 4, 5)              // cresta

  if (!isMobile) { ctx.shadowColor = COLORS.obs2; ctx.shadowBlur = 10 }
  ctx.fillStyle = COLORS.obs2

  // ali che battono
  const wingY = flap * 7
  ctx.fillRect(x,            y + wingY,     w * 0.32, 4)
  ctx.fillRect(x + w * 0.04, y + wingY - 3, w * 0.22, 4)
  ctx.fillRect(x + w * 0.68, y + wingY,     w * 0.32, 4)
  ctx.fillRect(x + w * 0.74, y + wingY - 3, w * 0.22, 4)

  ctx.fillStyle = '#04020e'
  ctx.fillRect(x + w * 0.68, y + 2, 4, 4)   // occhio socket
  ctx.fillStyle = '#ff2d78'
  ctx.fillRect(x + w * 0.69, y + 3, 2, 2)   // pupilla
}

/* ── Cactus ───────────────────────────────────────────────── */
function drawCactus(ctx, o) {
  const { x, y, w, h } = o

  if (!isMobile) { ctx.shadowColor = COLORS.obs1; ctx.shadowBlur = 12 }
  ctx.fillStyle = COLORS.obs1

  ctx.fillRect(x + w * 0.3, y,        w * 0.4, h)         // tronco
  ctx.fillRect(x + w * 0.35, y - 4,   w * 0.3, 5)         // punta top

  // braccio sinistro
  ctx.fillRect(x,            y + h * 0.22, w * 0.32, w * 0.35)
  ctx.fillRect(x,            y + h * 0.1,  w * 0.32, h * 0.18)
  ctx.fillRect(x + w * 0.04, y + h * 0.08, w * 0.2,  5)

  // braccio destro
  ctx.fillRect(x + w * 0.68, y + h * 0.32, w * 0.32, w * 0.35)
  ctx.fillRect(x + w * 0.68, y + h * 0.2,  w * 0.32, h * 0.2)
  ctx.fillRect(x + w * 0.72, y + h * 0.18, w * 0.2,  5)

  // spine
  ctx.fillStyle = 'rgba(255,107,175,.9)'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + w * 0.68 + 1, y + h * 0.32 + i * 6, 3, 2)
    ctx.fillRect(x + w * 0.28 - 2, y + h * 0.22 + i * 5, 3, 2)
  }
}

/* ── Torre elettrica ──────────────────────────────────────── */
function drawTower(ctx, o, frame) {
  const { x, y, w, h } = o
  const t   = frame * 0.08
  const cx2 = x + w / 2

  if (!isMobile) { ctx.shadowColor = '#ffd93d'; ctx.shadowBlur = 14 }
  ctx.fillStyle = '#ffd93d'

  // struttura
  ctx.fillRect(cx2 - 3, y,          6,      h)
  ctx.fillRect(x - 5,   y,          w + 10, 5)
  ctx.fillRect(x - 2,   y + 5,      w + 4,  3)
  ctx.fillRect(x - 3,   y + h * 0.45, w + 6, 4)
  ctx.fillRect(x - 5,   y + h - 5,  w + 10, 5)
  ctx.fillRect(x - 2,   y + h - 8,  w + 4,  3)

  // gambe diagonali
  if (!isMobile) ctx.shadowBlur = 6
  ctx.lineWidth   = 2.5
  ctx.strokeStyle = '#ffd93d'
  ;[
    [cx2 - 3, y + 5,      x - 5,    y + h * 0.44],
    [cx2 + 3, y + 5,      x + w + 5, y + h * 0.44],
    [cx2 - 3, y + h * 0.49, x - 5,  y + h - 5],
    [cx2 + 3, y + h * 0.49, x + w + 5, y + h - 5],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  })

  // isolatori
  ctx.fillStyle = '#ffd93d'
  if (!isMobile) ctx.shadowBlur = 10
  ctx.beginPath(); ctx.arc(x - 5,    y + 2, 4.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x + w + 5, y + 2, 4.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#04020e'
  ctx.beginPath(); ctx.arc(x - 5,    y + 2, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x + w + 5, y + 2, 2, 0, Math.PI * 2); ctx.fill()

  // scariche elettriche (solo desktop)
  if (!isMobile) {
    const bolt = (x1, y1, x2, y2, segs, col, alpha) => {
      ctx.save()
      ctx.strokeStyle = col || '#00f5ff'
      ctx.shadowColor = col || '#00f5ff'
      ctx.shadowBlur  = 8
      ctx.lineWidth   = 1.2
      ctx.globalAlpha = alpha || 0.85
      ctx.beginPath(); ctx.moveTo(x1, y1)
      const dx = (x2 - x1) / segs
      const dy = (y2 - y1) / segs
      for (let i = 1; i < segs; i++) {
        const j = Math.sin(t * 6.7 + i * 2.9 + x1 * 0.02) * 7
        ctx.lineTo(x1 + dx * i + j, y1 + dy * i + j * 0.4)
      }
      ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore()
    }

    const p1 = Math.sin(t * 2.3)
    const p2 = Math.sin(t * 2.3 + Math.PI)
    if (p1 > -0.2) bolt(x - 5, y + 2, cx2, y + 2, 6, '#00f5ff', 0.55 + p1 * 0.35)
    if (p2 > -0.2) bolt(x + w + 5, y + 2, cx2, y + 2, 6, '#00f5ff', 0.55 + p2 * 0.35)
    if (p1 > 0.3)  bolt(x - 5, y + 2, cx2 - 3, y + h * 0.44, 8, '#7bf5ff', 0.35)
    if (p2 > 0.3)  bolt(x + w + 5, y + 2, cx2 + 3, y + h * 0.44, 8, '#7bf5ff', 0.35)

    bolt(cx2, y + 7,      cx2, y + h * 0.43, 9, '#ffd93d', 0.55)
    bolt(cx2, y + h * 0.49, cx2, y + h - 7, 9, '#ffd93d', 0.55)

    // alone pulsante
    const gr = 5 + Math.abs(Math.sin(t * 3.1)) * 4
    ctx.save()
    ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 22
    ctx.fillStyle = `rgba(0,245,255,${0.25 + Math.abs(Math.sin(t * 3.1)) * 0.45})`
    ctx.beginPath(); ctx.arc(x - 5,    y + 2, gr, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + w + 5, y + 2, gr, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}
