/**
 * Storico lavorativo di Vito Iannone.
 * Aggiorna qui per modificare la sezione Experience senza toccare i componenti.
 */

/** @typedef {{ id: string, company: string, role: string, period: string, current: boolean, tags: string[], bullets: string[] }} ExperienceItem */

/** @type {ExperienceItem[]} */
export const experience = [
  {
    id: 'dxc',
    company: 'DXC Technology',
    role: 'Software Engineer · FE Team Lead',
    period: 'Giu 2022 — Presente',
    current: true,
    tags: ['Next.js', 'React', 'Java', 'Spring Boot', 'Jira', 'Scrum', 'DevOps'],
    bullets: [
      'Sviluppo frontend in Next.js e React con ownership sulla qualità del codice.',
      'Sviluppo backend in Java e Spring Boot.',
      'Ruolo di Front-End Team Lead: code review e quality ownership.',
      'Competenza approfondita in DBMS, GitHub/GitLab, metodologie Scrum e DevOps.',
    ],
  },
  {
    id: 'infor2000',
    company: 'INFOR2000 S.R.L.',
    role: 'Sviluppatore Software',
    period: 'Ott 2017 — Mar 2019',
    current: false,
    tags: ['Java', 'AngularJS', 'PHP', 'MySQL', 'MS SQL Server'],
    bullets: [
      'Sviluppo applicazioni Java.',
      'Sviluppo applicazioni web con AngularJS e PHP.',
      'Gestione database MySQL e Microsoft SQL Server.',
    ],
  },
]
