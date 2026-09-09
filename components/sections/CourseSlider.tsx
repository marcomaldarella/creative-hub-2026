'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Arrow } from '@/components/ui'
import styles from './CourseSlider.module.css'

export type CourseSliderProps = {
  children: ReactNode
  labels: { prev: string; next: string; hint: string }
  className?: string
}

/**
 * Nastro orizzontale generico per card (i corsi in evidenza): scroll-snap
 * con frecce prev/next e barretta di avanzamento, stesso pattern del
 * TeacherStrip. La larghezza delle card la decide chi la usa (flex-basis
 * sui figli). `overscroll-behavior: contain` nel CSS: lo scroll non si
 * propaga mai alla pagina.
 */
export function CourseSlider({ children, labels, className }: CourseSliderProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0) // 0..1, posizione del pollice
  const [thumb, setThumb] = useState(1) // 0..1, quota di nastro visibile
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setThumb(el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1)
    setProgress(max > 0 ? el.scrollLeft / max : 0)
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(max <= 1 || el.scrollLeft >= max - 1)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const nudge = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    /* un passo = una card: prima figlia + gap */
    const first = el.firstElementChild as HTMLElement | null
    const step = first ? first.offsetWidth + 20 : el.clientWidth * 0.4
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const hasOverflow = thumb < 0.999

  return (
    <div className={className}>
      <div
        ref={ref}
        className={styles.strip}
        onScroll={measure}
        tabIndex={-1}
        aria-label={labels.hint}
      >
        {children}
      </div>

      {hasOverflow && (
        <div className={styles.controls}>
          <div className={styles.track} role="presentation" title={labels.hint}>
            <span
              className={styles.thumb}
              style={{
                width: `${Math.max(thumb, 0.12) * 100}%`,
                left: `${progress * (100 - Math.max(thumb, 0.12) * 100)}%`,
              }}
            />
          </div>
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.nav}
              aria-label={labels.prev}
              disabled={atStart}
              onClick={() => nudge(-1)}
            >
              <Arrow dir="w" size={16} />
            </button>
            <button
              type="button"
              className={styles.nav}
              aria-label={labels.next}
              disabled={atEnd}
              onClick={() => nudge(1)}
            >
              <Arrow dir="e" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
