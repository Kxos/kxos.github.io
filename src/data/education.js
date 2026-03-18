/**
 * Percorso formativo di Vito Iannone.
 */

/** @typedef {{ id: string, title: string, institution: string, period: string, grade?: string, description: string[] }} EducationItem */

/** @type {EducationItem[]} */
export const education = [
  {
    id: 'uniba',
    title: 'Laurea in Informatica e tecnologie per la produzione del software',
    institution: 'Università degli Studi di Bari Aldo Moro',
    period: 'Lug 2019 — Ott 2022',
    grade: '95/110',
    description: [
      'Progettazione di basi di dati.',
      'Sviluppo software in Java.',
      'Sviluppo mobile Android.',
      'Progettazione dell\'interazione con l\'utente (UX).',
    ],
  },
  {
    id: 'panetti',
    title: 'Perito Capo Tecnico Informatico',
    institution: 'I.I.S.S. "Panetti-Pitagora", Bari',
    period: 'Set 2013 — Lug 2017',
    description: [
      'Indirizzo Informatica.',
    ],
  },
]
