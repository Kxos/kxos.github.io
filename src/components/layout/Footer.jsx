import { useLang } from '../../i18n/LangContext'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer>
      <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
        <div className="foot-brand">Vito<span>.</span>Iannone</div>
        <div className="foot-copy">© {new Date().getFullYear()} · {t.footer}</div>
      </div>
    </footer>
  )
}
