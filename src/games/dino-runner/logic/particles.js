/**
 * Sistema di particelle: spawn e aggiornamento.
 */

import { COLORS } from '../constants.js'

/**
 * @typedef {{ x: number, y: number, vx: number, vy: number, r: number, life: number, color: string }} Particle
 */

/**
 * Genera un burst di particelle in un punto.
 * @param {number} x
 * @param {number} y
 * @param {'jump'|'land'|'hit'} type
 * @returns {Particle[]}
 */
export function spawnParticles(x, y, type) {
  const count = type === 'hit' ? 14 : 8
  return Array.from({ length: count }, () => ({
    x,
    y,
    vx:    (Math.random() - 0.5) * (type === 'hit' ? 6 : 3),
    vy:    -(Math.random() * (type === 'hit' ? 5 : 3) + 1),
    r:     Math.random() * 3 + 1,
    life:  1,
    color: type === 'hit' ? COLORS.obs1 : COLORS.particle,
  }))
}

/**
 * Aggiorna le particelle: muovile, riduci vita, rimuovi le morte.
 * @param {Particle[]} particles
 * @returns {Particle[]}
 */
export function updateParticles(particles) {
  return particles
    .map(p => ({
      ...p,
      x:    p.x + p.vx,
      y:    p.y + p.vy,
      vy:   p.vy + 0.2,
      life: p.life - 0.025,
    }))
    .filter(p => p.life > 0)
}
