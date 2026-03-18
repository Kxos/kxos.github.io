/**
 * Rendering dello sfondo: cielo, stelle, sole, montagne, griglia, terreno.
 * Tutti i gradient statici vengono cachati per non ricrearli ogni frame.
 */

import { COLORS } from '../constants.js'

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768

// Cache dei gradient statici
let _skyGrad    = null
let _sunGlow    = null
let _sunGrad    = null
let _groundGrad = null

/**
 * Genera i punti di una catena montuosa casuale.
 * @param {number} amp   - ampiezza massima (moltiplicatore di H)
 * @param {number} base  - posizione verticale base (moltiplicatore di H)
 * @param {number} W
 * @param {number} H
 * @returns {{ x: number, y: number }[]}
 */
export function genMountain(amp, base, W, H) {
  const pts = [{ x: 0, y: H * base }]
  for (let x = 0; x <= W; x += 36) {
    pts.push({ x, y: H * base - Math.random() * H * amp * (0.3 + Math.random() * 0.4) })
  }
  pts.push({ x: W, y: H * base }, { x: W, y: H }, { x: 0, y: H })
  return pts
}

/**
 * Disegna il cielo (gradient statico cachato).
 */
export function drawBg(ctx, W, H) {
  if (!_skyGrad) {
    _skyGrad = ctx.createLinearGradient(0, 0, 0, H)
    _skyGrad.addColorStop(0,   '#04020e')
    _skyGrad.addColorStop(0.6, '#0b0620')
    _skyGrad.addColorStop(1,   '#150830')
  }
  ctx.fillStyle = _skyGrad
  ctx.fillRect(0, 0, W, H)
}

/**
 * Disegna le stelle con effetto twinkle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x, y, r, blink }[]} stars
 * @param {number} frame
 */
export function drawStars(ctx, stars, frame) {
  stars.forEach(s => {
    const b = 0.5 + 0.5 * Math.sin(s.blink + frame * 0.02)
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(240,236,255,${0.4 * b + 0.1})`
    if (!isMobile) { ctx.shadowColor = 'white'; ctx.shadowBlur = 4 * b }
    ctx.fill()
    if (!isMobile) ctx.shadowBlur = 0
  })
}

/**
 * Disegna il sole synthwave con strisce orizzontali.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W - larghezza logica del canvas
 * @param {number} H - altezza logica del canvas
 */
export function drawSun(ctx, W, H) {
  const sx = W / 2
  const sy = H * 0.38
  const sr = 75

  if (!isMobile) {
    if (!_sunGlow) {
      _sunGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3)
      _sunGlow.addColorStop(0, 'rgba(255,45,120,.2)')
      _sunGlow.addColorStop(1, 'transparent')
    }
    ctx.fillStyle = _sunGlow
    ctx.fillRect(sx - sr * 3, sy - sr * 2, sr * 6, sr * 3)
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(sx, sy, sr, Math.PI, 0)
  ctx.closePath()
  ctx.clip()

  if (!_sunGrad) {
    _sunGrad = ctx.createLinearGradient(sx - sr, sy, sx + sr, sy)
    _sunGrad.addColorStop(0,   '#ff6baf')
    _sunGrad.addColorStop(0.5, '#ff2d78')
    _sunGrad.addColorStop(1,   '#ff6baf')
  }
  ctx.fillStyle = _sunGrad
  if (!isMobile) { ctx.shadowColor = '#ff2d78'; ctx.shadowBlur = 16 }
  ctx.fill()
  if (!isMobile) ctx.shadowBlur = 0

  const stripes = isMobile ? 5 : 8
  for (let i = 0; i < stripes; i++) {
    const ly = sy - 5 - i * 7
    ctx.fillStyle = 'rgba(4,2,14,.88)'
    ctx.fillRect(sx - sr, ly, sr * 2, 3.5)
  }
  ctx.restore()
}

/**
 * Disegna le due catene montuose (sfondo + primo piano).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x, y }[][]} mountains - [mtn2 (sfondo), mtn1 (primo piano)]
 */
export function drawMountains(ctx, mountains) {
  const [mtn2, mtn1] = mountains
  ;[mtn2, mtn1].forEach((pts, idx) => {
    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.closePath()
    ctx.fillStyle = idx === 0 ? 'rgba(7,4,18,.78)' : 'rgba(7,4,18,.88)'
    ctx.fill()

    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.closePath()
    ctx.fillStyle = idx === 0 ? COLORS.mtn2 : COLORS.mtn
    ctx.fill()
  })
}

/**
 * Disegna la griglia prospettica synthwave animata.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W - larghezza logica del canvas
 * @param {number} H - altezza logica del canvas
 * @param {number} gridOffsetY - offset verticale per l'animazione scroll
 * @param {number} groundLineY
 */
export function drawGrid(ctx, W, H, gridOffsetY, groundLineY) {
  const horizon = H * 0.5

  // Linee verticali
  for (let x = -6; x <= 6; x++) {
    const bx = W / 2 + x * 72
    ctx.beginPath()
    ctx.moveTo(bx, horizon)
    ctx.lineTo(W / 2 + (bx - W / 2) * 5, groundLineY + 6)
    ctx.strokeStyle = COLORS.grid2
    ctx.lineWidth   = 0.8
    ctx.stroke()
  }

  // Linee orizzontali con prospettiva
  for (let i = 0; i < 10; i++) {
    const t    = (i / 10 + gridOffsetY / 600) % 1
    const y    = horizon + (groundLineY - horizon) * Math.pow(t, 1.5)
    const xoff = (1 - t) * W * 0.5
    ctx.beginPath()
    ctx.moveTo(xoff, y)
    ctx.lineTo(W - xoff, y)
    ctx.strokeStyle = `rgba(255,45,120,${t * 0.28})`
    ctx.lineWidth   = 0.8
    ctx.stroke()
  }
}

/**
 * Disegna la linea del terreno con gradient sotto.
 */
export function drawGround(ctx, W, H, groundLineY) {
  ctx.beginPath()
  ctx.moveTo(0, groundLineY)
  ctx.lineTo(W, groundLineY)
  ctx.strokeStyle = COLORS.ground
  ctx.lineWidth   = 2
  if (!isMobile) { ctx.shadowColor = COLORS.ground; ctx.shadowBlur = 10 }
  ctx.stroke()
  if (!isMobile) ctx.shadowBlur = 0

  if (!_groundGrad) {
    _groundGrad = ctx.createLinearGradient(0, groundLineY, 0, H)
    _groundGrad.addColorStop(0, COLORS.groundG)
    _groundGrad.addColorStop(1, 'transparent')
  }
  ctx.fillStyle = _groundGrad
  ctx.fillRect(0, groundLineY, W, H - groundLineY)
}
