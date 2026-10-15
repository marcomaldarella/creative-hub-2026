'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Wrapper dello "scegli il tuo percorso": sul desktop è una griglia
 * inerte (il layout vive nel CSS della pagina), quando il CSS lo fa
 * diventare uno slider orizzontale (mobile, scroll-snap) avanza DA
 * SOLO di una card ogni AUTOPLAY_MS, tornando alla prima in fondo.
 * L'autoplay si ferma mentre l'utente tocca/trascina e riparte dopo;
 * gira solo in viewport e mai con prefers-reduced-motion.
 */
const AUTOPLAY_MS = 7000

export function PathsSlider({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    try {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    } catch {}

    let visible = false
    let holdUntil = 0

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(el)

    /* il dito ha la precedenza: pausa durante il gesto e per un giro
       intero dopo l'ultimo tocco */
    const hold = () => {
      holdUntil = performance.now() + AUTOPLAY_MS
    }
    el.addEventListener('pointerdown', hold)
    el.addEventListener('touchmove', hold, { passive: true })

    const timer = setInterval(() => {
      /* attivo solo quando il CSS l'ha reso scorrevole (mobile) */
      if (!visible || el.scrollWidth <= el.clientWidth + 8) return
      if (performance.now() < holdUntil) return
      const cards = [...el.children] as HTMLElement[]
      const next = cards.find((c) => c.offsetLeft > el.scrollLeft + 8)
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8
      el.scrollTo({
        left: atEnd || !next ? 0 : next.offsetLeft,
        behavior: 'smooth',
      })
    }, AUTOPLAY_MS)

    return () => {
      clearInterval(timer)
      io.disconnect()
      el.removeEventListener('pointerdown', hold)
      el.removeEventListener('touchmove', hold)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
