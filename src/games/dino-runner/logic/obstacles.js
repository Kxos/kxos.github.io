/**
 * Gestione degli ostacoli: spawn, movimento, tipologie.
 */

import { LW, COLORS, OBS_INTERVAL_MIN, OBS_INTERVAL_RNG } from '../constants.js'

/**
 * @typedef {{ x: number, y: number, w: number, h: number, type: 'cactus'|'bird'|'tall', color: string }} Obstacle
 */

/**
 * Genera un nuovo ostacolo casuale.
 * @param {number} groundLineY
 * @returns {Obstacle}
 */
export function spawnObstacle(groundLineY) {
  const roll = Math.random()
  let w, h, type

  if (roll < 0.5) {
    // Cactus: più basso, più stretto
    w    = 12 + Math.random() * 10
    h    = 26 + Math.random() * 24
    type = 'cactus'
  } else if (roll < 0.8) {
    // Pterodattilo: largo, vola in aria
    w    = 44 + Math.random() * 28
    h    = 14
    type = 'bird'
  } else {
    // Torre elettrica: alta
    w    = 10
    h    = 42 + Math.random() * 18
    type = 'tall'
  }

  const yOff = type === 'bird' ? -(18 + Math.random() * 36) : 0

  return {
    x:     LW + 20,
    y:     groundLineY - h + yOff,
    w,
    h,
    type,
    color: roll < 0.5 ? COLORS.obs1 : COLORS.obs2,
  }
}

/**
 * Calcola il prossimo intervallo di spawn (in frame).
 * @returns {number}
 */
export function nextSpawnInterval() {
  return Math.floor(OBS_INTERVAL_MIN + Math.random() * OBS_INTERVAL_RNG)
}

/**
 * Aggiorna tutti gli ostacoli: muovili verso sinistra e rimuovi quelli usciti.
 * @param {Obstacle[]} obstacles
 * @param {number} speed
 * @returns {Obstacle[]} array filtrato
 */
export function updateObstacles(obstacles, speed) {
  return obstacles
    .map(o => ({ ...o, x: o.x - speed }))
    .filter(o => o.x > -80)
}
