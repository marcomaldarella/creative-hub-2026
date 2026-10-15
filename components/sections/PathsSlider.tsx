'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './PathsSlider.module.css'

/**
 * Wrapper dello "scegli il tuo percorso": sul desktop è TRASPARENTE
 * (display: contents, resta la griglia a 3 colonne della pagina); su
 * mobile diventa un nastro infinito che scorre DA SOLO e non si
 * ferma mai — contenuto duplicato, wrap al 50%, un rAF time-based.
 * Il dito in appoggio mette solo in pausa (per il tap sui link),
 * al rilascio riparte. Mai con prefers-reduced-motion.
 */
const SPEED = 26 // px/s

export function PathsSlider({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const outerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track) return
    let reduced = false
    let mobile = false
    try {
      reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
      mobile = matchMedia('(max-width: 800px)').matches
    } catch {}
    if (reduced || !mobile) return

    let x = 0
    let half = track.scrollWidth / 2
    const ro = new ResizeObserver(() => {
      half = track.scrollWidth / 2
    })
    ro.observe(track)

    let running = false
    let holding = false
    let raf = 0
    let last = 0

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(48, now - last) / 1000
      last = now
      if (!holding) {
        x += SPEED * dt
        if (half > 0) x = ((x % half) + half) % half
        track.style.transform = `translate3d(${-x}px,0,0)`
      }
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: '80px' }
    )
    io.observe(outer)

    /* pausa solo col dito appoggiato: serve a centrare il tap */
    const down = () => {
      holding = true
    }
    const up = () => {
      holding = false
    }
    outer.addEventListener('pointerdown', down)
    outer.addEventListener('pointerup', up)
    outer.addEventListener('pointercancel', up)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      outer.removeEventListener('pointerdown', down)
      outer.removeEventListener('pointerup', up)
      outer.removeEventListener('pointercancel', up)
    }
  }, [])

  return (
    <div ref={outerRef} className={styles.outer}>
      <div ref={trackRef} className={styles.track}>
        <div className={className}>{children}</div>
        <div className={`${styles.clone} ${className ?? ''}`} aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  )
}
