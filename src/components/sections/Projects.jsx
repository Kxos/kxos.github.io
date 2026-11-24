import { useLang } from '../../i18n/LangContext'
import { GitHubIcon, LockIcon } from '../ui/Icons'

export default function Projects() {
  const { t } = useLang()
  const p = t.projects
  return (
    <section id="projects">
      <canvas className="section-canvas" data-sec="projects"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">05</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">{p.title}</h2>
        <div className="proj-grid">
          {p.items.map((item, i) => (
            <div className="pcard" key={i}>
              <div className="pcard-inner-glow"></div>
              <div className="pnum">{'// ' + String(i + 1).padStart(3, '0')}</div>
              <div className="ptitle">{item.title}</div>
              <div className="psub">{item.sub}</div>
              <div className="pdesc">{item.desc}</div>
              <div className="ptechs">
                {item.tags.map(tag => <span className="ptag" key={tag}>{tag}</span>)}
              </div>
              <div className="plinks">
                {item.link ? (
                  <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="plink">
                    <GitHubIcon />
                    {item.link.label}
                  </a>
                ) : (
                  <span className="pnda">
                    <LockIcon style={{width:'11px',height:'11px'}} />
                    {p.nda}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
