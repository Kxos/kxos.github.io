/**
 * Progetti in evidenza.
 * Aggiungi qui nuovi progetti senza modificare i componenti.
 */

/** @typedef {{ id: string, title: string, description: string, tags: string[], links: { label: string, href: string }[] }} Project */

/** @type {Project[]} */
export const projects = [
  {
    id: 'portfolio',
    title: 'Portfolio Synthwave',
    description:
      'Questo portfolio — un\'esperienza interattiva in stile synthwave con canvas animati, gioco arcade integrato e design system neon.',
    tags: ['React', 'Vite', 'Canvas API', 'Web Audio API'],
    links: [
      { label: 'GitHub', href: 'https://github.com/vitoiannone/vito-iannone-portfolio' },
    ],
  },
  // Aggiungi qui altri progetti
]
