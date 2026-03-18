/**
 * Tech stack e livelli di competenza.
 * `level` è un valore 0–100 usato dalla barra di progresso.
 */

/** @typedef {{ name: string, level: number, color: 'pink' | 'cyan' | 'violet' }} Skill */
/** @typedef {{ label: string, skills: Skill[] }} SkillGroup */

/** @type {SkillGroup[]} */
export const skillGroups = [
  {
    label: 'Frontend',
    skills: [
      { name: 'React / Next.js', level: 92, color: 'cyan' },
      { name: 'TypeScript',      level: 80, color: 'cyan' },
      { name: 'JavaScript ES6+', level: 90, color: 'cyan' },
      { name: 'HTML5 / CSS3',    level: 88, color: 'cyan' },
    ],
  },
  {
    label: 'Backend',
    skills: [
      { name: 'Java',        level: 88, color: 'pink' },
      { name: 'Spring Boot', level: 82, color: 'pink' },
      { name: 'PHP',         level: 60, color: 'pink' },
    ],
  },
  {
    label: 'Database & DevOps',
    skills: [
      { name: 'MySQL / MS SQL', level: 80, color: 'violet' },
      { name: 'GitHub / GitLab', level: 88, color: 'violet' },
      { name: 'Scrum / DevOps',  level: 82, color: 'violet' },
      { name: 'Jira',            level: 78, color: 'violet' },
    ],
  },
]
