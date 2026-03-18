/**
 * Fisica del dinosauro: salto, duck, gravità, collisioni.
 */

import { GRAVITY, JUMP_FORCE, DINO_W, DINO_H, DUCK_H } from '../constants.js'

/**
 * Aggiorna la fisica del dino ad ogni frame.
 * @param {object} dino - stato mutabile del dinosauro
 */
export function updateDino(dino) {
  dino.vy += GRAVITY
  dino.y  += dino.vy

  if (dino.y >= 0) {
    dino.y         = 0
    dino.vy        = 0
    dino.onGround  = true
  } else {
    dino.onGround  = false
  }
}

/**
 * Fa saltare il dino se è a terra.
 * @param {object} dino
 * @param {function} playSfx - callback audio (opzionale)
 */
export function jump(dino, playSfx) {
  if (!dino.onGround) return
  dino.vy       = JUMP_FORCE
  dino.onGround = false
  playSfx?.('jump')
}

/**
 * Attiva/disattiva la postura bassa (duck).
 * @param {object} dino
 * @param {boolean} active
 */
export function setDuck(dino, active) {
  dino.ducking = active
}

/**
 * Verifica la collisione AABB tra dino e un ostacolo.
 * Usa un padding interno per rendere la hitbox leggermente più permissiva.
 *
 * @param {object} dino
 * @param {number} groundLineY
 * @param {object} obs - { x, y, w, h }
 * @returns {boolean}
 */
export function collides(dino, groundLineY, obs) {
  const pad = 4
  const dh  = dino.ducking ? DUCK_H : DINO_H
  const dw  = dino.ducking ? DINO_W + 8 : DINO_W
  const dx  = dino.x
  const dy  = groundLineY - dh + dino.y

  return (
    dx + pad       < obs.x + obs.w - pad &&
    dx + dw - pad  > obs.x + pad         &&
    dy + pad       < obs.y + obs.h - pad &&
    dy + dh - pad  > obs.y + pad
  )
}

/**
 * Crea lo stato iniziale del dinosauro.
 * @param {number} groundLineY
 * @returns {object}
 */
export function createDino(groundLineY) {
  return {
    x:        60,
    y:        0,      // 0 = a terra; negativo = in aria
    vy:       0,
    onGround: true,
    ducking:  false,
    legPhase: 0,
    /** Coordinata Y di draw (dipende da dino.y e dino.ducking) */
    get drawY() { return groundLineY - (this.ducking ? DUCK_H : DINO_H) + this.y },
    get boxY()  { return groundLineY - (this.ducking ? DUCK_H : DINO_H) + this.y },
    get boxH()  { return this.ducking ? DUCK_H : DINO_H },
  }
}
