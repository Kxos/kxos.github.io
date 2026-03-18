/**
 * Wrapper React per IntersectionObserver.
 * Utile per animazioni on-scroll (aggiunge classe 'in' quando l'elemento è visibile).
 */

import { useEffect, useRef } from 'react'

/**
 * @param {IntersectionObserverInit} [options]
 * @returns {React.RefObject} ref da attaccare all'elemento da osservare
 */
export function useIntersectionObserver(options = { threshold: 0.15 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('in')
        observer.unobserve(el)   // osserva una volta sola
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return ref
}
