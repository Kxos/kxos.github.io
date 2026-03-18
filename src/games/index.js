/**
 * Registry dei giochi disponibili nell'Arcade.
 *
 * Per aggiungere un nuovo gioco:
 * 1. Crea la directory src/games/nome-gioco/
 * 2. Esporta il componente principale come default da NomeGioco.jsx
 * 3. Aggiungi una entry qui sotto
 *
 * Il componente viene importato con lazy() in Arcade.jsx
 * per non appesantire il bundle principale.
 */

/** @typedef {{ id: string, name: string, description: string, unlockCode: string }} GameEntry */

/** @type {GameEntry[]} */
export const games = [
  {
    id: 'dino-runner',
    name: 'NEON RUN',
    description: 'Endless runner synthwave. Salta ostacoli, accumula punti.',
    /** Codice segreto che sblocca il cabinet nell'UI (opzionale) */
    unlockCode: 'NEON',
  },
]
