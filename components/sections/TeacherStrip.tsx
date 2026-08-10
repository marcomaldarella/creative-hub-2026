'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Arrow } from '@/components/ui'
import { l } from '@/lib/sanity/l'
import type { Locale } from '@/lib/i18n/config'
import type { Teacher } from '@/lib/sanity/types'
import { Thumb } from './Thumb'
import styles from './TeacherStrip.module.css'

export type TeacherStripProps = {
  teachers: Teacher[]
  locale: Locale
  /** ultima cella: cerchio vuoto col + che invita a candidarsi */
  join: { label: string; role: string; href: string }
  labels: { prev: string; next: string; hint: string }
}

/**
 * Fila di docenti che scorre in orizzontale.
 *
 * Tre regole, tutte volute:
 *  · `overscroll-behavior: contain` (nel CSS) — lo scroll orizzontale non
 *    si propaga MAI alla pagina: senza, arrivati in fondo alla fila il
 *    gesto continuava sul documento e la pagina saltava in alto;
 *  · niente scrollbar di sistema: al suo posto una barretta di avanzamento
 *    che dice quanta fila resta;
 *  · le frecce muovono il nastro con scrollBy — mai scrollIntoView, che
 *    porterebbe con sé anche lo scroll verticale del documento.
 */
export function TeacherStrip({
  teachers,
  locale,
  join,
  labels,
}: TeacherStripProps) {
  const ref = useRef<HTMLUListElement | null>(null)
  const [progress, setProgress] = useState(0) // 0..1, posizione del pollice
  const [thumb, setThumb] = useState(1) // 0..1, quota di fila visibile
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
    /* un passo ≈ due ritratti, mai più di uno schermo di fila */
    const step = Math.min(el.clientWidth * 0.8, 340)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const hasOverflow = thumb < 0.999

  return (
    <div className={styles.wrap}>
      <ul
        ref={ref}
        className={styles.strip}
        onScroll={measure}
        tabIndex={-1}
        aria-label={labels.hint}
      >
        {teachers.map((teacher, i) => (
          <li key={teacher._id} className={styles.person}>
            <Thumb
              image={teacher.photo}
              alt={teacher.name ?? ''}
              index={i}
              round
              width={320}
              className={styles.photo}
            />
            <span className={styles.name}>{teacher.name}</span>
            {l(teacher.role, locale) && (
              <span className={`mono ${styles.role}`}>
                {l(teacher.role, locale)}
              </span>
            )}
          </li>
        ))}

        {/* ultima cella: il posto vuoto — cerchio con il + e "join us" */}
        <li className={`${styles.person} ${styles.joinCell}`}>
          <a href={join.href} className={styles.join}>
            <span className={styles.joinDisc} aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className={styles.name}>{join.label}</span>
            <span className={`mono ${styles.role}`}>{join.role}</span>
          </a>
        </li>
      </ul>

      {hasOverflow && (
        <div className={styles.controls}>
          {/* indicatore: la barretta dice quanta fila manca alla fine */}
          <div
            className={styles.track}
            role="presentation"
            title={labels.hint}
          >
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
