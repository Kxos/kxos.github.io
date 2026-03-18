/**
 * Componente React del Dino Runner.
 * Gestisce il ciclo di vita del canvas e delega tutta la logica a gameLoop.js.
 */

import { useEffect, useRef, useCallback } from 'react'
import { startGameLoop } from './gameLoop.js'
import styles from './DinoRunner.module.css'

export default function DinoRunner({ onScore, onGameOver }) {
  const canvasRef  = useRef(null)
  const gameRef    = useRef(null)   // istanza del game loop

  // Avvia il loop quando il canvas è montato
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    gameRef.current = startGameLoop(canvas, { onScore, onGameOver })

    return () => {
      gameRef.current?.destroy()
      gameRef.current = null
    }
  }, [onScore, onGameOver])

  // Touch/click → salto
  const handleAction = useCallback(() => {
    gameRef.current?.jump()
  }, [])

  // Tasti fisici (gestiti qui invece che globalmente, per evitare conflitti)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        gameRef.current?.jump()
      }
      if (e.code === 'ArrowDown') {
        gameRef.current?.duck(true)
      }
    }
    const onKeyUp = (e) => {
      if (e.code === 'ArrowDown') {
        gameRef.current?.duck(false)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup',   onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup',   onKeyUp)
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onClick={handleAction}
        onTouchStart={handleAction}
      />
      {/* Pulsanti mobile */}
      <div className={styles.mobileControls}>
        <button
          className={styles.btn}
          onTouchStart={() => gameRef.current?.duck(true)}
          onTouchEnd={()   => gameRef.current?.duck(false)}
          onClick={() => gameRef.current?.duck(true)}
        >
          ▼ Abbassati
        </button>
        <button
          className={styles.btn}
          onTouchStart={handleAction}
          onClick={handleAction}
        >
          ▲ Salta
        </button>
      </div>
    </div>
  )
}
