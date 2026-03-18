/**
 * Costanti condivise tra tutti i moduli del Dino Runner.
 * Modificare qui per cambiare le dimensioni o i colori globali.
 */

// Dimensioni logiche del canvas (pixel virtuali — scalati al canvas reale)
export const LW = 880
export const LH = 220

// Dimensioni del dinosauro
export const DINO_W  = 26
export const DINO_H  = 34
export const DUCK_H  = 18

// Fisica
export const GRAVITY     = 0.65
export const JUMP_FORCE  = -11
export const GROUND_Y    = 24   // altezza del terreno dalla base del canvas

// Spawn ostacoli
export const OBS_INTERVAL_MIN = 58
export const OBS_INTERVAL_RNG = 90

// Palette colori (usare le stesse CSS vars non è possibile nel canvas)
export const COLORS = {
  ground:  '#ff2d78',
  groundG: 'rgba(255,45,120,.5)',
  grid2:   'rgba(255,45,120,.08)',
  mtn:     'rgba(180,79,255,.35)',
  mtn2:    'rgba(180,79,255,.15)',
  dino:    '#00f5ff',
  dinoG:   'rgba(0,245,255,.6)',
  obs1:    '#ff2d78',
  obs2:    '#b44fff',
  particle:'#ffd93d',
  score:   '#00f5ff',
  hiscore: '#ffd93d',
}
