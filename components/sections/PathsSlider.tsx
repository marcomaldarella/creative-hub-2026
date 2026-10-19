'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './PathsSlider.module.css'

/**
 * Wrapper dello "scegli il tuo percorso": nastro infinito a OGNI
 * misura (stessa ricetta del campo dell'offerta) — scorre DA SOLO e
 * non si ferma mai: contenuto duplicato, wrap al 50%, un rAF
 * time-based. Si trascina 1:1 col puntatore (axis lock: il gesto
 * verticale resta scroll di pagina) con momentum al rilascio; il
 * click subito dopo un drag è soppresso. Mai con
 * prefers-reduced-motion.
 *
 * NOTA: il wrap al 50% regge solo se le due copie sono IDENTICHE in
 * larghezza — le card devono avere width esplicita (non solo
 * flex-basis), altrimenti nel track a max-content la larghezza
 * intrinseca la detta il testo non wrappato e il loop salta nel
 * vuoto (il bug storico di questo slider su mobile).
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
  const cloneRef = useRef<HTMLDivElement | null>(null)
  const movedRef = useRef(false)

  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track) return

    /* la copia resta fuori dal tab order ma DEVE restare interattiva:
       col nastro che scorre metà delle card a schermo sono cloni, e
       con inert non rispondevano né all'hover né al click */
    cloneRef.current
      ?.querySelectorAll<HTMLAnchorElement>('a')
      .forEach((a) => {
        a.tabIndex = -1
      })
    let reduced = false
    try {
      reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {}
    if (reduced) return

    let x = 0
    let vel = 0
    let half = track.scrollWidth / 2
    const ro = new ResizeObserver(() => {
      half = track.scrollWidth / 2
    })
    ro.observe(track)

    let running = false
    let raf = 0
    let last = 0

    /* drag */
    let dragging = false
    let axis: 'x' | 'y' | null = null
    let pointerId = -1
    let startX = 0
    let startY = 0
    let lastX = 0
    let lastT = 0

    const wrap = () => {
      if (half > 0) x = ((x % half) + half) % half
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(48, now - last) / 1000
      last = now
      if (!dragging) {
        x += SPEED * dt
        /* momentum del drag: scivola e si spegne */
        x -= vel * dt * 1000
        vel *= 0.94
      }
      wrap()
      track.style.transform = `translate3d(${-x}px,0,0)`
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

    const down = (e: PointerEvent) => {
      dragging = true
      axis = null
      pointerId = e.pointerId
      startX = lastX = e.clientX
      startY = e.clientY
      lastT = performance.now()
      vel = 0
      movedRef.current = false
    }
    const move = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (axis === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        if (Math.abs(dy) > Math.abs(dx)) {
          dragging = false
          return
        }
        axis = 'x'
        outer.setPointerCapture(pointerId)
      }
      const now = performance.now()
      const step = e.clientX - lastX
      if (Math.abs(dx) > 6) movedRef.current = true
      x -= step
      wrap()
      vel = step / Math.max(1, now - lastT)
      lastX = e.clientX
      lastT = now
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      dragging = false
      axis = null
      setTimeout(() => {
        movedRef.current = false
      }, 0)
    }
    outer.addEventListener('pointerdown', down)
    outer.addEventListener('pointermove', move)
    outer.addEventListener('pointerup', up)
    outer.addEventListener('pointercancel', up)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      outer.removeEventListener('pointerdown', down)
      outer.removeEventListener('pointermove', move)
      outer.removeEventListener('pointerup', up)
      outer.removeEventListener('pointercancel', up)
    }
  }, [])

  return (
    <div
      ref={outerRef}
      className={styles.outer}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (movedRef.current) e.preventDefault()
      }}
    >
      <div ref={trackRef} className={styles.track}>
        <div className={className}>{children}</div>
        <div
          ref={cloneRef}
          className={`${styles.clone} ${className ?? ''}`}
          aria-hidden
        >
          {children}
        </div>
      </div>
    </div>
  )
}
