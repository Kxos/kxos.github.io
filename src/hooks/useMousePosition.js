/**
 * Traccia la posizione del mouse relativa a un elemento o alla finestra.
 * Restituisce { x, y } in pixel e { rx, ry } normalizzati (-1..1).
 */

import { useState, useEffect, useRef } from 'react'

/**
 * @param {React.RefObject<HTMLElement>} [targetRef]
 *   Se fornito, le coordinate sono relative all'elemento.
 *   Se omesso, sono relative alla finestra.
 */
export function useMousePosition(targetRef) {
  const [pos, setPos] = useState({ x: 0, y: 0, rx: 0, ry: 0 })

  useEffect(() => {
    const el = targetRef?.current || window

    const handler = (e) => {
      const rect = targetRef?.current?.getBoundingClientRect()
      const x    = rect ? e.clientX - rect.left  : e.clientX
      const y    = rect ? e.clientY - rect.top   : e.clientY
      const W    = rect ? rect.width  : window.innerWidth
      const H    = rect ? rect.height : window.innerHeight

      setPos({
        x,
        y,
        rx: (x / W) * 2 - 1,   // -1 (sinistra) … +1 (destra)
        ry: (y / H) * 2 - 1,   // -1 (top) … +1 (bottom)
      })
    }

    el.addEventListener('mousemove', handler, { passive: true })
    return () => el.removeEventListener('mousemove', handler)
  }, [targetRef])

  return pos
}
