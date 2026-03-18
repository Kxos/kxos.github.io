/**
 * Web Audio Engine per il Dino Runner.
 * Tutti i suoni sono generati proceduralmente — nessun file audio esterno.
 */

/** Crea un AudioContext lazy (rispetta la policy autoplay dei browser). */
function getCtx() {
  if (!getCtx._ctx) {
    getCtx._ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return getCtx._ctx
}

/** Helper: crea oscillatore + gain, agganciato alla destinazione. */
function osc(ctx, type, freq, startTime, duration, gainVal = 0.15) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type            = type
  o.frequency.value = freq
  g.gain.setValueAtTime(gainVal, startTime)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(startTime)
  o.stop(startTime + duration)
}

/**
 * Suono di salto: breve sine ascendente.
 */
export function playJump() {
  try {
    const ctx = getCtx()
    const t   = ctx.currentTime
    osc(ctx, 'sine', 320, t,       0.06, 0.12)
    osc(ctx, 'sine', 480, t + 0.05, 0.08, 0.10)
  } catch (_) {}
}

/**
 * Suono di atterraggio: thud discendente.
 */
export function playLand() {
  try {
    const ctx = getCtx()
    const t   = ctx.currentTime
    osc(ctx, 'sine', 160, t, 0.12, 0.18)
  } catch (_) {}
}

/**
 * Suono di game over: tonfo drammatico.
 */
export function playDeath() {
  try {
    const ctx = getCtx()
    const t   = ctx.currentTime
    ;[[220, 0.12], [160, 0.18], [110, 0.28]].forEach(([freq, delay]) => {
      osc(ctx, 'sawtooth', freq, t + delay, 0.3, 0.2)
    })
  } catch (_) {}
}

/**
 * Suono di milestone (ogni 100 punti): arpeggio ascendente.
 */
export function playMilestone() {
  try {
    const ctx  = getCtx()
    const t    = ctx.currentTime
    const base = 440
    ;[1, 1.25, 1.5, 2].forEach((mul, i) => {
      osc(ctx, 'square', base * mul, t + i * 0.06, 0.1, 0.08)
    })
  } catch (_) {}
}

/**
 * Suono del passo (tick sottile mentre si corre).
 */
export function playStep() {
  try {
    const ctx = getCtx()
    const t   = ctx.currentTime
    osc(ctx, 'square', 880, t, 0.02, 0.04)
  } catch (_) {}
}
