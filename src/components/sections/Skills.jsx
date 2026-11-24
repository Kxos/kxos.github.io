import { useLang } from '../../i18n/LangContext'

function SkillCard({ group, index }) {
  return (
    <div className={`skill-card sr accent-${group.accent}${group.wide ? ' wide' : ''}`}>
      <div className="skill-card-head">
        <span className="skill-card-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="skill-card-label">{group.label}</span>
        <span className="skill-card-count">{group.tags.length}</span>
      </div>
      <div className="skill-tags">
        {group.tags.map(tag => <span className="stag" key={tag}>{tag}</span>)}
      </div>
    </div>
  )
}

export default function Skills() {
  const { t } = useLang()
  const s = t.skills
  const catIndex = Object.fromEntries(s.groups.map((g, i) => [g.key, i]))
  return (
    <section id="skills">
      <canvas className="section-canvas" data-sec="skills"></canvas>
      <div className="sec-glow-line"></div>
      <div className="container">
        <div className="sec-eyebrow sr"><span className="sec-eyebrow-num">02</span><span className="sec-eyebrow-line"></span></div>
        <h2 className="sec-title sr">{s.title}</h2>

        <div className="skill-core sr">
          <div className="skill-core-head">
            <span className="skill-core-prompt">&gt;</span>
            <span className="skill-core-label">{s.coreLabel}</span>
            <span className="skill-core-caret" aria-hidden="true"></span>
            <span className="skill-core-hint">{'// ' + s.coreHint}</span>
          </div>
          <div className="skill-core-list">
            {s.core.map(item => {
              const group = s.groups[catIndex[item.cat]]
              return (
              <div className={`skill-core-tile accent-${group.accent}`} key={item.name} title={group.label}>
                <span className="skill-core-cat">{String(catIndex[item.cat] + 1).padStart(2, '0')}</span>
                <span className="skill-core-name">{item.name}</span>
                <span className="skill-core-meta">{item.meta}</span>
              </div>
              )
            })}
          </div>
        </div>

        <div className="skill-grid">
          {s.groups.map((g, i) => <SkillCard group={g} index={i} key={i} />)}
        </div>
      </div>
    </section>
  )
}
