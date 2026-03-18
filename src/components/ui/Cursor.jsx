import { useEffect } from 'react'

export default function Cursor() {
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return
    const curEl = document.getElementById('cursor')
    const curRing = document.getElementById('cur-ring')
    if (!curEl || !curRing) return
    let mx = 0, my = 0, rx = 0, ry = 0
    const onMove = e => {
      mx = e.clientX; my = e.clientY
      curEl.style.transform = `translate(${mx}px,${my}px)`
    }
    window.addEventListener('mousemove', onMove)
    const anim = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12
      curRing.style.left = rx + 'px'; curRing.style.top = ry + 'px'
      requestAnimationFrame(anim)
    }
    requestAnimationFrame(anim)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <div id="cursor"><div id="cur-dot"></div></div>
      <div id="cur-ring"></div>
    </>
  )
}
