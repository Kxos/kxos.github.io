import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { content } from './content.jsx'

const STORAGE_KEY = 'lang'
const SUPPORTED = ['it', 'en']

function initialLang() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (SUPPORTED.includes(fromUrl)) return fromUrl
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (SUPPORTED.includes(saved)) return saved
  return 'en'
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    document.title = content[lang].meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', content[lang].meta.description)
  }, [lang])

  const value = useMemo(() => ({
    lang,
    t: content[lang],
    toggle: () => setLang(l => (l === 'it' ? 'en' : 'it')),
  }), [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang deve essere usato dentro <LangProvider>')
  return ctx
}
