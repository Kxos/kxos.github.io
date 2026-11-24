"""CV in HTML A4 (EN/IT) da stampare in PDF con Chrome headless.
Niente dati personali sensibili: nessun indirizzo, telefono, data di nascita o foto.
Uso: python gen_cv.py <cartella output>
"""
import sys, os
from html import escape as e

OUT = sys.argv[1]

C = {
    'en': dict(
        role='Full-Stack Software Engineer · Front-End Team Lead',
        location='Bari, Italy',
        h_profile='Profile', h_exp='Experience', h_proj='Selected projects', h_skills='Skills',
        h_edu='Education', h_lang='Languages',
        profile=('Software engineer building web portals and single-page applications for large-scale digital services. '
                 'Front-end focused (React, Next.js, Angular, TypeScript) with solid experience across the stack: Spring Boot BFFs, '
                 'contract-first OpenAPI, GraphQL, OIDC authentication with Keycloak, containers and Kubernetes pipelines. '
                 'As front-end team lead I own code review, code quality and front-end architecture decisions.'),
        jobs=[
            dict(role='Software Engineer · Front-End Team Lead', org='DXC Technology', place='Bari, Italy',
                 date='Jun 2022 — Present', bullets=[
                     '<b>2026:</b> Angular 21 SPA and Spring Boot 4 / Java 25 BFF, contract-first on OpenAPI 3.1, with generated API clients, OIDC sign-in (CIE), problem+json errors and Kubernetes probes. AI-assisted development (Claude Code) backed by a knowledge base for the agents (ADRs, C4, guardrails).',
                     '<b>2025–2026:</b> four Next.js 16 / React 19 / Tailwind CSS 4 portals with GraphQL, Keycloak/SPID sign-in and i18n; non-root Docker images, Jenkins pipelines on Kubernetes, SonarQube quality gates.',
                     '<b>2024–2025:</b> main project (~880 commits): a restricted Next.js 14 portal with Apollo GraphQL, next-auth + Keycloak, Leaflet maps and Chart.js dashboards, plus its public counterpart.',
                     '<b>2023–2024:</b> React + TypeScript archetype reused across five SPAs, with OpenAPI-generated clients and a Spring BFF.',
                     '<b>2022–2023:</b> React SPAs with Storybook; Java / Spring Boot microservices with Apache Camel, RabbitMQ and Oracle.',
                 ]),
            dict(role='Software Developer', org='INFOR2000 S.R.L.', place='Modugno (BA), Italy',
                 date='Oct 2017 — Mar 2019', bullets=[
                     'Java and web application development (AngularJS, PHP); design and administration of relational databases on MySQL and Microsoft SQL Server.',
                 ]),
        ],
        projects=[
            ('Digital wallet for citizens', '2026', 'Angular 21 SPA and Spring Boot 4 BFF built contract-first on OpenAPI 3.1; an ESLint rule forbids hand-written HTTP calls; accessibility tests with axe-core.'),
            ('Interoperability gateway portals', '2025–2026', 'Portals to browse and manage the APIs exchanged between public bodies: Swagger UI catalogue, SPID sign-in via Keycloak, multilingual UI.'),
            ('Local public transport observatory', '2024–2025', 'Restricted data-collection and analytics portal with maps and dashboards, GraphQL data layer and runtime configuration via the container entrypoint.'),
            ('SPAs for administrative procedures', '2023–2024', 'Five SPAs on a shared React + TypeScript archetype: accreditation of external operators, vehicle procedures, public and restricted portals.'),
        ],
        proj_note='Client projects, described generically.',
        edu=[
            ("Bachelor's degree in Computer Science and Software Production Technologies", 'University of Bari Aldo Moro', '2019 — 2022', 'Grade 95/110 · EQF 6'),
            ('Technical diploma in Computer Science', 'I.I.S.S. "Panetti-Pitagora", Bari', '2013 — 2017', 'EQF 4'),
        ],
        langs=[('Italian', 'native'), ('English', 'C1 listening and reading · B2 speaking and writing')],
        skills_labels=['Front end', 'Testing & quality', 'Back end', 'APIs & integration', 'Delivery & DevOps',
                       'Identity & access', 'Ways of working'],
        footer='',
    ),
    'it': dict(
        role='Software Engineer full-stack · Front-End Team Lead',
        location='Bari, Italia',
        h_profile='Profilo', h_exp='Esperienza', h_proj='Progetti in evidenza', h_skills='Competenze',
        h_edu='Formazione', h_lang='Lingue',
        profile=('Software engineer: realizzo portali web e single-page application per servizi digitali su larga scala. '
                 'Baricentro sul frontend (React, Next.js, Angular, TypeScript) con esperienza solida su tutta la catena: BFF Spring Boot, '
                 'OpenAPI contract-first, GraphQL, autenticazione OIDC con Keycloak, container e pipeline su Kubernetes. '
                 'Come Front-End Team Lead curo code review, qualità del codice e scelte di architettura sul frontend.'),
        jobs=[
            dict(role='Software Engineer · Front-End Team Lead', org='DXC Technology', place='Bari, Italia',
                 date='Giu 2022 — Oggi', bullets=[
                     '<b>2026:</b> SPA Angular 21 e BFF Spring Boot 4 / Java 25 contract-first su OpenAPI 3.1, con client API generati, login OIDC (CIE), errori problem+json e probe Kubernetes. Sviluppo assistito da AI (Claude Code) con una knowledge base per gli agenti (ADR, C4, guardrail).',
                     '<b>2025–2026:</b> quattro portali Next.js 16 / React 19 / Tailwind CSS 4 con GraphQL, login Keycloak/SPID e i18n; immagini Docker non-root, pipeline Jenkins su Kubernetes, quality gate SonarQube.',
                     '<b>2024–2025:</b> progetto principale (~880 commit): portale riservato in Next.js 14 con Apollo GraphQL, next-auth + Keycloak, mappe Leaflet e dashboard Chart.js, più la versione pubblica.',
                     '<b>2023–2024:</b> archetipo React + TypeScript riusato su cinque SPA, con client generati da OpenAPI e BFF Spring.',
                     '<b>2022–2023:</b> SPA React con Storybook; microservizi Java / Spring Boot con Apache Camel, RabbitMQ e Oracle.',
                 ]),
            dict(role='Sviluppatore Software', org='INFOR2000 S.R.L.', place='Modugno (BA), Italia',
                 date='Ott 2017 — Mar 2019', bullets=[
                     'Sviluppo di applicazioni Java e web (AngularJS, PHP); progettazione e gestione di database relazionali su MySQL e Microsoft SQL Server.',
                 ]),
        ],
        projects=[
            ('Wallet digitale per i cittadini', '2026', 'SPA Angular 21 e BFF Spring Boot 4 costruiti contract-first su OpenAPI 3.1; una regola ESLint vieta le chiamate HTTP scritte a mano; test di accessibilità con axe-core.'),
            ('Portali per un gateway di interoperabilità', '2025–2026', 'Portali per consultare e gestire le API scambiate tra enti: catalogo con Swagger UI, login SPID tramite Keycloak, interfaccia multilingua.'),
            ('Osservatorio sul trasporto pubblico locale', '2024–2025', "Portale riservato di raccolta e analisi dati con mappe e dashboard, dati via GraphQL e configurazione a runtime tramite l'entrypoint del container."),
            ('SPA per pratiche amministrative', '2023–2024', 'Cinque SPA su un archetipo comune React + TypeScript: accreditamento di soggetti esterni, pratiche sui veicoli, portale pubblico e riservato.'),
        ],
        proj_note='Progetti per clienti, descritti in modo generico.',
        edu=[
            ('Laurea in Informatica e Tecnologie per la Produzione del Software', 'Università degli Studi di Bari Aldo Moro', '2019 — 2022', 'Voto 95/110 · EQF 6'),
            ('Perito Capo Tecnico Informatico', 'I.I.S.S. "Panetti-Pitagora", Bari', '2013 — 2017', 'EQF 4'),
        ],
        langs=[('Italiano', 'madrelingua'), ('Inglese', 'C1 ascolto e lettura · B2 parlato e scritto')],
        skills_labels=['Frontend', 'Test e qualità', 'Backend', 'API e integrazione', 'Delivery e DevOps',
                       'Identità e accesso', 'Metodo'],
        footer=('Autorizzo il trattamento dei miei dati personali presenti nel CV ai sensi del Regolamento (UE) 2016/679 (GDPR) '
                'e del D.Lgs. 196/2003.'),
    ),
}

# Stesse categorie, ordine e colori della sezione Skills del sito.
SKILLS = [
    ('#d6125a', 'React · Next.js · Angular · TypeScript · Tailwind CSS · Bootstrap Italia · next-intl · Transloco'),
    ('#d6125a', 'Vitest · Jest · Testing Library · JUnit 5 · JaCoCo · ESLint · axe-core'),
    ('#b7791f', 'Java 11 → 25 · Spring Boot 2 → 4 · Apache Camel · RabbitMQ · JPA · Oracle · PostgreSQL'),
    ('#00838f', 'GraphQL · Apollo Client · OpenAPI contract-first · openapi-generator · BFF'),
    ('#00838f', 'Docker · Kubernetes · Helm · Jenkins · SonarQube · GitLab · GitHub Actions'),
    ('#7b2fc4', 'OIDC / OAuth2 · Keycloak · next-auth · angular-oauth2-oidc · SPID · CIE'),
    ('#7b2fc4', 'Git (rebase, PR) · Code review · Scrum · Claude Code · ADR · C4'),
]

CSS = """
@page { size: A4; margin: 11mm 15mm 9mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 9.3pt; line-height: 1.42; color: #241c3d;
       -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.bar { height: 4px; border-radius: 2px; background: linear-gradient(90deg, #d6125a, #7b2fc4 50%, #00838f); margin-bottom: 11px; }
header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
h1 { margin: 0; font-family: 'Courier New', monospace; font-size: 25pt; letter-spacing: 4px; line-height: 1; color: #d6125a; }
h1 span { color: #7b2fc4; }
.role { margin-top: 6px; font-size: 11pt; font-weight: 600; color: #3b3260; }
.contacts { text-align: right; font-size: 8.6pt; line-height: 1.6; color: #4b4570; white-space: nowrap; }
.contacts a { color: inherit; text-decoration: none; }
h2 { margin: 11px 0 5px; font-family: 'Courier New', monospace; font-size: 10.5pt; letter-spacing: 2.5px; text-transform: uppercase;
     color: #d6125a; display: flex; align-items: center; gap: 8px; }
h2::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(123,47,196,.45), rgba(0,131,143,0)); }
p { margin: 0; }
.job { margin-bottom: 8px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.job-role { font-weight: 700; font-size: 10pt; }
.job-org { color: #7b2fc4; font-weight: 600; }
.date { font-family: 'Courier New', monospace; font-size: 8.6pt; color: #5b5680; white-space: nowrap; }
ul { margin: 3px 0 0; padding-left: 14px; }
li { margin-bottom: 2.5px; }
li::marker { color: #d6125a; }
li b { color: #00838f; }
.projects { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
.proj { break-inside: avoid; }
.proj-title { font-weight: 700; }
.proj-title span { font-family: 'Courier New', monospace; font-weight: 400; font-size: 8.4pt; color: #5b5680; margin-left: 6px; }
.note { font-size: 8pt; color: #8a84b0; margin: -2px 0 5px; }
.skills { display: grid; grid-template-columns: 160px 1fr; gap: 3px 12px; }
.sk-label { font-family: 'Courier New', monospace; font-weight: 700; font-size: 8.6pt; letter-spacing: .5px; }
.sk-label i { font-style: normal; margin-right: 6px; }
.two { display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px; }
.edu { margin-bottom: 5px; break-inside: avoid; }
.edu-title { font-weight: 700; }
.muted { color: #5b5680; }
footer { margin-top: 9px; font-size: 7.4pt; color: #8a84b0; }
"""


def html(lang):
    c = C[lang]
    contacts = (
        f'<div>{e(c["location"])}</div>'
        '<div><a href="mailto:vito.iannone90@gmail.com">vito.iannone90@gmail.com</a></div>'
        '<div><a href="https://kxos.github.io">kxos.github.io</a> · <a href="https://github.com/Kxos">github.com/Kxos</a></div>'
        '<div><a href="https://www.linkedin.com/in/vito-iannone-3841801a4/">linkedin.com/in/vito-iannone-3841801a4</a></div>'
    )
    jobs = ''.join(
        f'<div class="job"><div class="row"><div><span class="job-role">{e(j["role"])}</span> · '
        f'<span class="job-org">{e(j["org"])}</span> <span class="muted">· {e(j["place"])}</span></div>'
        f'<div class="date">{e(j["date"])}</div></div>'
        '<ul>' + ''.join(f'<li>{b}</li>' for b in j['bullets']) + '</ul></div>'
        for j in c['jobs'])
    projects = ''.join(
        f'<div class="proj"><div class="proj-title">{e(t)}<span>{e(d)}</span></div><p>{e(x)}</p></div>'
        for t, d, x in c['projects'])
    skills = ''.join(
        f'<div class="sk-label" style="color:{col}"><i>{i + 1:02d}</i>{e(lbl)}</div><div>{e(items)}</div>'
        for i, (lbl, (col, items)) in enumerate(zip(c['skills_labels'], SKILLS)))
    edu = ''.join(
        f'<div class="edu"><div class="row"><span class="edu-title">{e(t)}</span><span class="date">{e(d)}</span></div>'
        f'<div class="muted">{e(s)} · {e(g)}</div></div>'
        for t, s, d, g in c['edu'])
    langs = ''.join(f'<div><b>{e(n)}</b> <span class="muted">— {e(lv)}</span></div>' for n, lv in c['langs'])
    footer = f'<footer>{e(c["footer"])}</footer>' if c['footer'] else ''
    return (
        f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>Vito Iannone — CV</title>'
        f'<style>{CSS}</style></head><body>'
        '<div class="bar"></div>'
        f'<header><div><h1>VITO <span>IANNONE</span></h1><div class="role">{e(c["role"])}</div></div>'
        f'<div class="contacts">{contacts}</div></header>'
        f'<h2>{e(c["h_profile"])}</h2><p>{e(c["profile"])}</p>'
        f'<h2>{e(c["h_exp"])}</h2>{jobs}'
        f'<h2>{e(c["h_proj"])}</h2><div class="note">{e(c["proj_note"])}</div><div class="projects">{projects}</div>'
        f'<h2>{e(c["h_skills"])}</h2><div class="skills">{skills}</div>'
        f'<div class="two"><div><h2>{e(c["h_edu"])}</h2>{edu}</div><div><h2>{e(c["h_lang"])}</h2>{langs}</div></div>'
        f'{footer}</body></html>'
    )


for lang in ('en', 'it'):
    p = os.path.join(OUT, f'cv-{lang}.html')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(html(lang))
    print(p)
