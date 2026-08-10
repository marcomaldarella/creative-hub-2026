'use client'

import Image, { type StaticImageData } from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Arrow } from '@/components/ui'
import styles from './PhotoStrip.module.css'

export type PhotoStripProps = {
  photos: { src: StaticImageData; alt: string }[]
  kicker?: string
  title?: string
  text?: string
  labels: { prev: string; next: string; hint: string }
}

/**
 * Nastro di foto a filo di pagina.
 *
 * Stesse regole della fila docenti: `overscroll-behavior-x: contain` (il
 * gesto orizzontale non passa al documento), scrollbar di sistema
 * nascosta con una barretta di avanzamento al suo posto, frecce che
 * spostano con scrollBy.
 */
export function PhotoStrip({
  photos,
  kicker,
  title,
  text,
  labels,
}: PhotoStripProps) {
  const ref = useRef<HTMLUListElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [thumb, setThumb] = useState(1)
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
    el.scrollBy({ left: dir * el.clientWidth * 0.62, behavior: 'smooth' })
  }

  const hasOverflow = thumb < 0.999

  return (
    <div className={styles.block}>
      {(kicker || title || text) && (
        <div className={`wrap ${styles.head}`}>
          <div>
            {kicker && <span className={`mono ${styles.kicker}`}>{kicker}</span>}
            {title && <h2 className={`display-thin ${styles.title}`}>{title}</h2>}
          </div>
          {text && <p className={styles.text}>{text}</p>}
        </div>
      )}

      <ul
        ref={ref}
        className={styles.strip}
        onScroll={measure}
        aria-label={labels.hint}
      >
        {photos.map((photo, i) => (
          <li key={i} className={styles.item}>
            <Image
              src={photo.src}
              alt={photo.alt}
              sizes="(max-width: 760px) 78vw, 34vw"
              className={styles.img}
              placeholder="blur"
            />
          </li>
        ))}
      </ul>

      {hasOverflow && (
        <div className={`wrap ${styles.controls}`}>
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
