/**
 * Tutti i testi del sito, in italiano e in inglese.
 * Per aggiornare il portfolio si modifica solo questo file.
 *
 * Riservatezza: i progetti per clienti sono descritti in modo generico,
 * senza nomi di clienti, enti, repository o URL interni.
 */

/** Percorso del CV da scaricare (servito da /public). null = pulsanti CV nascosti. */
export const CV_URL = null

export const LINKS = {
  github: 'https://github.com/Kxos',
  linkedin: 'https://www.linkedin.com/in/vito-iannone-3841801a4/',
  portfolioRepo: 'https://github.com/Kxos/kxos.github.io',
}

const projectTags = {
  wallet: ['Angular 21', 'TypeScript', 'Spring Boot 4', 'Java 25', 'OpenAPI 3.1', 'OIDC · CIE', 'Vitest', 'axe-core'],
  gateway: ['Next.js 16', 'React 19', 'Tailwind CSS 4', 'GraphQL', 'Keycloak · SPID', 'next-intl', 'Jenkins', 'Kubernetes'],
  tpl: ['Next.js 14', 'React 18', 'TypeScript', 'Apollo GraphQL', 'next-auth', 'Keycloak', 'Leaflet', 'Chart.js'],
  spa: ['React 18', 'TypeScript', 'OpenAPI codegen', 'RxJS', 'TanStack Table', 'react-hook-form', 'Jest', 'Docker'],
  portfolio: ['React', 'Vite', 'Canvas API', 'Web Audio API', 'GitHub Actions'],
}

/** Colore fisso per categoria: le card e i riquadri del core stack lo condividono. */
const ACCENT = { frontend: 'pink', api: 'cyan', identity: 'violet', backend: 'gold', delivery: 'cyan', quality: 'pink', method: 'violet' }

const coreStack = [
  { name: 'React', meta: '17 → 19', cat: 'frontend' },
  { name: 'Next.js', meta: '14 → 16', cat: 'frontend' },
  { name: 'Angular', meta: '21', cat: 'frontend' },
  { name: 'TypeScript', meta: '5.x', cat: 'frontend' },
  { name: 'Spring Boot', meta: '2 → 4', cat: 'backend' },
  { name: 'GraphQL', meta: 'Apollo', cat: 'api' },
  { name: 'OpenAPI', meta: 'contract-first', cat: 'api' },
]

const skillGroups = {
  frontend: ['React', 'Next.js', 'Angular', 'TypeScript', 'Tailwind CSS', 'Bootstrap Italia', 'next-intl', 'Transloco'],
  api: ['GraphQL', 'Apollo Client', 'OpenAPI contract-first', 'openapi-generator', 'BFF'],
  identity: ['OIDC / OAuth2', 'Keycloak', 'next-auth', 'angular-oauth2-oidc', 'SPID', 'CIE'],
  backend: ['Java 11 → 25', 'Spring Boot 2 → 4', 'Apache Camel', 'RabbitMQ', 'JPA', 'Oracle', 'PostgreSQL'],
  delivery: ['Docker', 'Kubernetes', 'Helm', 'Jenkins', 'SonarQube', 'GitLab', 'GitHub Actions'],
  quality: ['Vitest', 'Jest', 'Testing Library', 'JUnit 5', 'JaCoCo', 'ESLint', 'axe-core'],
  method: ['Git (rebase, PR)', 'Code review', 'Scrum', 'Claude Code', 'ADR · C4'],
}

export const content = {
  it: {
    meta: {
      title: 'Vito Iannone — Software Engineer',
      description: 'Vito Iannone — Software Engineer full-stack e Front-End Team Lead. React, Next.js, Angular, TypeScript, Spring Boot.',
    },
    nav: {
      about: 'Chi sono', skills: 'Competenze', experience: 'Esperienza',
      education: 'Formazione', projects: 'Progetti', contact: 'Contatti',
      cv: '↓ Scarica CV', switchTo: 'Switch to English',
    },
    hero: {
      tag: 'Software Engineer · Bari, Italia',
      role: 'Full-Stack Developer & Front-End Team Lead',
      company: 'DXC Technology',
      desc: [
        'Progetto e realizzo portali web e SPA per servizi digitali su larga scala.',
        'React · Next.js · Angular · TypeScript, con BFF Spring Boot, OpenAPI e GraphQL.',
      ],
      contact: 'Contattami',
      cv: 'Scarica CV',
      scroll: 'scroll',
    },
    about: {
      title: 'Chi sono',
      paragraphs: [
        <>Sono <strong>Vito Iannone</strong>, <span className="hl-p">Software Engineer</span> a Bari. Dal 2022 lavoro in <strong>DXC Technology</strong> come sviluppatore full-stack e <span className="hl-c">Front-End Team Lead</span>: code review, qualità del codice e scelte di architettura sul frontend.</>,
        <>Il mio baricentro è il frontend, con <strong>React, Next.js e Angular</strong>, sempre in TypeScript. Lavoro volentieri anche sul resto della catena: <strong>BFF Spring Boot</strong>, contratti <strong>OpenAPI</strong>, <strong>GraphQL</strong>, autenticazione OIDC con Keycloak, container e pipeline su Kubernetes.</>,
        <>Tengo a contratti espliciti tra frontend e backend, interfacce accessibili e una storia Git lineare. Sviluppo anche con agenti AI (Claude Code) e ne rivedo il lavoro come qualsiasi altra pull request.</>,
      ],
      meta: [
        { key: 'Email', email: true },
        { key: 'Sede', value: 'Bari, Italia' },
        { key: 'Lingue', value: 'Italiano (madrelingua) · Inglese (B2–C1)' },
      ],
      cards: [
        { val: '6', label: 'Anni di esperienza' },
        { val: '15', label: 'App web realizzate' },
        { val: '2', label: 'Aziende' },
        { val: '95', label: 'Laurea /110' },
      ],
    },
    skills: {
      title: 'Competenze',
      coreLabel: 'stack_principale',
      coreHint: 'quello che uso ogni giorno',
      core: coreStack,
      groups: [
        { key: 'frontend', accent: ACCENT.frontend, label: 'Frontend', tags: skillGroups.frontend, wide: true },
        { key: 'quality', accent: ACCENT.quality, label: 'Test e qualità', tags: skillGroups.quality },
        { key: 'backend', accent: ACCENT.backend, label: 'Backend', tags: skillGroups.backend },
        { key: 'api', accent: ACCENT.api, label: 'API e integrazione', tags: skillGroups.api },
        { key: 'delivery', accent: ACCENT.delivery, label: 'Delivery e DevOps', tags: skillGroups.delivery },
        { key: 'identity', accent: ACCENT.identity, label: 'Identità e accesso', tags: skillGroups.identity },
        { key: 'method', accent: ACCENT.method, label: 'Metodo', tags: skillGroups.method, wide: true },
      ],
    },
    experience: {
      title: 'Esperienza',
      items: [
        {
          date: 'Giu 2022 — Oggi',
          role: 'Software Engineer · Front-End Team Lead',
          company: 'DXC Technology · Bari, Italia',
          desc: 'Sviluppo full-stack, con baricentro sul frontend, di portali e SPA per servizi digitali su larga scala. Come Front-End Team Lead curo code review, qualità del codice e scelte di architettura.',
          bullets: [
            <><strong>2026:</strong> SPA Angular 21 e BFF Spring Boot 4 / Java 25 contract-first su OpenAPI 3.1. Sviluppo assistito da agenti AI, con una knowledge base per gli agenti (ADR, C4, guardrail).</>,
            <><strong>2025–2026:</strong> quattro portali Next.js 16, React 19 e Tailwind CSS 4 con GraphQL, login Keycloak/SPID e i18n. Immagini Docker non-root, pipeline Jenkins su Kubernetes e SonarQube.</>,
            <><strong>2024–2025:</strong> progetto principale (~880 commit), un portale riservato in Next.js 14 con Apollo GraphQL, next-auth + Keycloak, mappe Leaflet e dashboard Chart.js.</>,
            <><strong>2023–2024:</strong> archetipo React + TypeScript riusato su 5 SPA, con client generati da OpenAPI e BFF Spring.</>,
            <><strong>2022–2023:</strong> SPA React con Storybook e microservizi Java / Spring Boot con Apache Camel, RabbitMQ e Oracle.</>,
          ],
          tags: ['Next.js', 'React', 'Angular', 'TypeScript', 'GraphQL', 'OpenAPI', 'Keycloak', 'Spring Boot', 'Docker', 'Kubernetes'],
        },
        {
          date: 'Ott 2017 — Mar 2019',
          role: 'Sviluppatore Software',
          company: 'INFOR2000 S.R.L. · Modugno (BA), Italia',
          desc: 'Sviluppo di applicazioni Java e web (AngularJS, PHP). Progettazione e gestione di database relazionali su MySQL e Microsoft SQL Server.',
          bullets: [],
          tags: ['Java', 'AngularJS', 'PHP', 'MySQL', 'SQL Server'],
        },
      ],
    },
    education: {
      title: 'Formazione',
      items: [
        {
          year: '2019 — 2022',
          degree: 'Laurea in Informatica e Tecnologie per la Produzione del Software',
          school: 'Università degli Studi di Bari Aldo Moro',
          desc: 'Sviluppo software in Java e Android, progettazione di basi di dati, progettazione dell\'interazione utente.',
          badge: 'Voto: 95/110 · EQF 6',
        },
        {
          year: '2013 — 2017',
          degree: 'Perito Capo Tecnico Informatico',
          school: 'I.I.S.S. "Panetti-Pitagora" · Bari',
          desc: 'Diploma tecnico a indirizzo informatico: programmazione, reti e sistemi.',
          badge: 'EQF Livello 4',
        },
      ],
    },
    projects: {
      title: 'Progetti',
      nda: 'Progetto per un cliente · codice non pubblico',
      items: [
        {
          title: 'Wallet digitale per i cittadini',
          sub: '2026 · SPA + BFF',
          desc: 'SPA Angular 21 e BFF Spring Boot 4 costruiti contract-first su OpenAPI 3.1. Il client API è generato dal contratto e una regola ESLint vieta le chiamate HTTP scritte a mano. Login CIE via OIDC, errori problem+json con correlation id, probe Kubernetes e test di accessibilità con axe-core.',
          tags: projectTags.wallet,
        },
        {
          title: 'Portali per un gateway di interoperabilità',
          sub: '2025 — 2026 · 4 portali',
          desc: 'Suite di portali per consultare e gestire le API scambiate tra enti: catalogo con Swagger UI, autenticazione SPID tramite Keycloak, interfaccia multilingua. Immagini Docker non-root costruite da Jenkins su pod Kubernetes, con BuildKit e quality gate SonarQube.',
          tags: projectTags.gateway,
        },
        {
          title: 'Osservatorio sul trasporto pubblico locale',
          sub: '2024 — 2025 · progetto principale',
          desc: 'Portale riservato per la raccolta e l\'analisi dei dati sul TPL, più la versione pubblica. Dashboard con mappe Leaflet e grafici Chart.js, dati via GraphQL, accesso OIDC con Keycloak e configurazione a runtime tramite l\'entrypoint del container.',
          tags: projectTags.tpl,
        },
        {
          title: 'SPA per pratiche amministrative',
          sub: '2023 — 2024 · 5 SPA',
          desc: 'Cinque SPA su un archetipo comune React + TypeScript: accreditamento di soggetti esterni, pratiche sui veicoli, portale pubblico e riservato. Client typescript-rxjs generati da OpenAPI, Jest + Testing Library, build Docker multi-stage con stage SonarQube.',
          tags: projectTags.spa,
        },
        {
          title: 'Portfolio synthwave',
          sub: 'Open source · questo sito',
          desc: 'Il sito che stai guardando: React + Vite, sfondi animati su canvas, un arcade nascosto con giochi scritti da zero ed effetti sonori procedurali. Deploy automatico su GitHub Pages.',
          tags: projectTags.portfolio,
          link: { label: 'GitHub', href: LINKS.portfolioRepo },
        },
      ],
    },
    contact: {
      title: 'Contatti',
      sub: ['Sei un recruiter, un collega o hai un progetto in mente?', 'Scrivimi: rispondo volentieri.'],
      cv: 'Scarica il mio CV',
      mail: 'Inviami una mail',
    },
    footer: 'Bari, Italia',
  },

  en: {
    meta: {
      title: 'Vito Iannone — Software Engineer',
      description: 'Vito Iannone — full-stack software engineer and front-end team lead. React, Next.js, Angular, TypeScript, Spring Boot.',
    },
    nav: {
      about: 'About', skills: 'Skills', experience: 'Experience',
      education: 'Education', projects: 'Projects', contact: 'Contact',
      cv: '↓ Download CV', switchTo: 'Passa all\'italiano',
    },
    hero: {
      tag: 'Software Engineer · Bari, Italy',
      role: 'Full-Stack Developer & Front-End Team Lead',
      company: 'DXC Technology',
      desc: [
        'I design and build web portals and SPAs for large-scale digital services.',
        'React · Next.js · Angular · TypeScript, backed by Spring Boot BFFs, OpenAPI and GraphQL.',
      ],
      contact: 'Get in touch',
      cv: 'Download CV',
      scroll: 'scroll',
    },
    about: {
      title: 'About',
      paragraphs: [
        <>I&apos;m <strong>Vito Iannone</strong>, a <span className="hl-p">software engineer</span> based in Bari, Italy. Since 2022 I&apos;ve worked at <strong>DXC Technology</strong> as a full-stack developer and <span className="hl-c">front-end team lead</span>, responsible for code review, code quality and front-end architecture decisions.</>,
        <>My focus is the front end, with <strong>React, Next.js and Angular</strong>, always in TypeScript. I also work across the rest of the stack: <strong>Spring Boot BFFs</strong>, <strong>OpenAPI</strong> contracts, <strong>GraphQL</strong>, OIDC sign-in with Keycloak, containers and Kubernetes pipelines.</>,
        <>I care about explicit front-end/back-end contracts, accessible interfaces and a linear Git history. I also build with AI coding agents (Claude Code) and review their work like any other pull request.</>,
      ],
      meta: [
        { key: 'Email', email: true },
        { key: 'Location', value: 'Bari, Italy' },
        { key: 'Languages', value: 'Italian (native) · English (B2–C1)' },
      ],
      cards: [
        { val: '6', label: 'Years of experience' },
        { val: '15', label: 'Web apps shipped' },
        { val: '2', label: 'Companies' },
        { val: '95', label: 'Degree /110' },
      ],
    },
    skills: {
      title: 'Skills',
      coreLabel: 'core_stack',
      coreHint: 'what I work with every day',
      core: coreStack,
      groups: [
        { key: 'frontend', accent: ACCENT.frontend, label: 'Front end', tags: skillGroups.frontend, wide: true },
        { key: 'quality', accent: ACCENT.quality, label: 'Testing & quality', tags: skillGroups.quality },
        { key: 'backend', accent: ACCENT.backend, label: 'Back end', tags: skillGroups.backend },
        { key: 'api', accent: ACCENT.api, label: 'APIs & integration', tags: skillGroups.api },
        { key: 'delivery', accent: ACCENT.delivery, label: 'Delivery & DevOps', tags: skillGroups.delivery },
        { key: 'identity', accent: ACCENT.identity, label: 'Identity & access', tags: skillGroups.identity },
        { key: 'method', accent: ACCENT.method, label: 'Ways of working', tags: skillGroups.method, wide: true },
      ],
    },
    experience: {
      title: 'Experience',
      items: [
        {
          date: 'Jun 2022 — Present',
          role: 'Software Engineer · Front-End Team Lead',
          company: 'DXC Technology · Bari, Italy',
          desc: 'Full-stack development, mainly front end, of web portals and SPAs for large-scale digital services. As front-end team lead I own code review, code quality and architecture decisions.',
          bullets: [
            <><strong>2026:</strong> Angular 21 SPA and Spring Boot 4 / Java 25 BFF, contract-first on OpenAPI 3.1. AI-assisted development backed by a knowledge base for the agents (ADRs, C4, guardrails).</>,
            <><strong>2025–2026:</strong> four Next.js 16, React 19 and Tailwind CSS 4 portals with GraphQL, Keycloak/SPID sign-in and i18n. Non-root Docker images, Jenkins pipelines on Kubernetes, SonarQube.</>,
            <><strong>2024–2025:</strong> main project (~880 commits), a restricted portal in Next.js 14 with Apollo GraphQL, next-auth + Keycloak, Leaflet maps and Chart.js dashboards.</>,
            <><strong>2023–2024:</strong> React + TypeScript archetype reused across 5 SPAs, with OpenAPI-generated clients and a Spring BFF.</>,
            <><strong>2022–2023:</strong> React SPAs with Storybook and Java / Spring Boot microservices with Apache Camel, RabbitMQ and Oracle.</>,
          ],
          tags: ['Next.js', 'React', 'Angular', 'TypeScript', 'GraphQL', 'OpenAPI', 'Keycloak', 'Spring Boot', 'Docker', 'Kubernetes'],
        },
        {
          date: 'Oct 2017 — Mar 2019',
          role: 'Software Developer',
          company: 'INFOR2000 S.R.L. · Modugno (BA), Italy',
          desc: 'Java and web application development (AngularJS, PHP). Design and administration of relational databases on MySQL and Microsoft SQL Server.',
          bullets: [],
          tags: ['Java', 'AngularJS', 'PHP', 'MySQL', 'SQL Server'],
        },
      ],
    },
    education: {
      title: 'Education',
      items: [
        {
          year: '2019 — 2022',
          degree: 'Bachelor\'s degree in Computer Science and Software Production Technologies',
          school: 'University of Bari Aldo Moro',
          desc: 'Software development in Java and Android, database design, interaction design.',
          badge: 'Grade: 95/110 · EQF 6',
        },
        {
          year: '2013 — 2017',
          degree: 'Technical diploma in Computer Science',
          school: 'I.I.S.S. "Panetti-Pitagora" · Bari',
          desc: 'Technical high-school diploma in computing: programming, networks and systems.',
          badge: 'EQF Level 4',
        },
      ],
    },
    projects: {
      title: 'Projects',
      nda: 'Client project · code not public',
      items: [
        {
          title: 'Digital wallet for citizens',
          sub: '2026 · SPA + BFF',
          desc: 'Angular 21 SPA and Spring Boot 4 BFF built contract-first on OpenAPI 3.1. The API client is generated from the contract and an ESLint rule forbids hand-written HTTP calls. CIE sign-in over OIDC, problem+json errors with correlation IDs, Kubernetes probes and accessibility tests with axe-core.',
          tags: projectTags.wallet,
        },
        {
          title: 'Interoperability gateway portals',
          sub: '2025 — 2026 · 4 portals',
          desc: 'A suite of portals to browse and manage the APIs exchanged between public bodies: a catalogue with Swagger UI, SPID sign-in through Keycloak, a multilingual UI. Non-root Docker images built by Jenkins on Kubernetes pods, with BuildKit and a SonarQube quality gate.',
          tags: projectTags.gateway,
        },
        {
          title: 'Local public transport observatory',
          sub: '2024 — 2025 · main project',
          desc: 'A restricted portal to collect and analyse public transport data, plus its public counterpart. Dashboards with Leaflet maps and Chart.js charts, data over GraphQL, OIDC access with Keycloak and runtime configuration through the container entrypoint.',
          tags: projectTags.tpl,
        },
        {
          title: 'SPAs for administrative procedures',
          sub: '2023 — 2024 · 5 SPAs',
          desc: 'Five SPAs on a shared React + TypeScript archetype: accreditation of external operators, vehicle procedures, a public and a restricted portal. typescript-rxjs clients generated from OpenAPI, Jest + Testing Library, multi-stage Docker builds with a SonarQube stage.',
          tags: projectTags.spa,
        },
        {
          title: 'Synthwave portfolio',
          sub: 'Open source · this site',
          desc: 'The site you\'re looking at: React + Vite, animated canvas backgrounds, a hidden arcade with games written from scratch and procedural sound effects. Deployed automatically to GitHub Pages.',
          tags: projectTags.portfolio,
          link: { label: 'GitHub', href: LINKS.portfolioRepo },
        },
      ],
    },
    contact: {
      title: 'Contact',
      sub: ['Recruiter, colleague, or have a project in mind?', 'Drop me a line and I\'ll get back to you.'],
      cv: 'Download my CV',
      mail: 'Send me an email',
    },
    footer: 'Bari, Italy',
  },
}
