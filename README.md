# Vito Iannone — Portfolio

Portfolio personale in stile synthwave costruito con **React + Vite**.

## Stack

| Tool | Scopo |
|------|-------|
| React 18 | UI components |
| Vite 5 | Build tool + dev server |
| CSS Modules | Stili scoped per componente |
| Canvas API | Hero interattivo + gioco arcade |
| Web Audio API | Effetti sonori procedurali |
| GitHub Actions | CI/CD deploy automatico su GitHub Pages |

## Struttura

```
src/
├── components/
│   ├── layout/      # Navbar, Footer
│   ├── sections/    # Hero, About, Skills, Experience, Education, Projects, Contact, Arcade
│   └── ui/          # Cursor, Button, SectionTitle
├── games/
│   ├── index.js           # Registry giochi
│   └── dino-runner/
│       ├── draw/          # Rendering canvas (scene, dino, ostacoli, HUD)
│       ├── logic/         # Fisica, ostacoli, particelle
│       ├── audio/         # Web Audio Engine
│       ├── gameLoop.js    # Loop principale
│       └── DinoRunner.jsx # Componente React
├── hooks/           # useMousePosition, useIntersectionObserver
├── data/            # experience, skills, education, projects
└── styles/          # globals.css (tokens, reset, keyframes)
```

## Sviluppo locale

```bash
npm install
npm run dev
```

## Build e deploy

Il deploy è automatico su ogni push a `main` tramite GitHub Actions.

Per buildare manualmente:

```bash
npm run build
# output in dist/
```

### Configurazione GitHub Pages

1. Vai su **Settings → Pages** del repository
2. Imposta **Source** su `GitHub Actions`
3. Aggiorna `base` in `vite.config.js` con il nome del tuo repository:
   ```js
   base: '/nome-repository/'
   ```
   Se il repository è `username.github.io`, usa `base: '/'`.

## Aggiungere contenuti

- **Esperienza**: modifica `src/data/experience.js`
- **Skills**: modifica `src/data/skills.js`
- **Progetti**: modifica `src/data/projects.js`
- **Formazione**: modifica `src/data/education.js`

## Aggiungere un gioco

1. Crea `src/games/nome-gioco/` con la struttura:
   ```
   nome-gioco/
   ├── NomeGioco.jsx
   ├── gameLoop.js
   ├── constants.js
   ├── draw/
   ├── logic/
   └── audio/
   ```
2. Aggiungi una entry in `src/games/index.js`
3. Registra il componente in `src/components/sections/Arcade.jsx`
