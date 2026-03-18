import { useEffect } from 'react'
import Cursor from './components/ui/Cursor'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Experience from './components/sections/Experience'
import Education from './components/sections/Education'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import Arcade from './components/sections/Arcade'

export default function App() {
  useEffect(() => {
    // Carica tutti gli script vanilla originali dopo il mount del DOM
    import('./scripts.js')
  }, [])

  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Projects />
        <Contact />
        <Arcade />
      </main>
      <Footer />
    </>
  )
}
