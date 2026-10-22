'use client'

import Image, { type StaticImageData } from 'next/image'
import { useCallback } from 'react'
import {
  ScrollerControls,
  useScrollRail,
  type ScrollerLabels,
} from '@/components/ui'
import styles from './PhotoStrip.module.css'

export type PhotoStripProps = {
  /** caption: il nome dello spazio sotto la foto, se c'è */
  photos: { src: StaticImageData; alt: string; caption?: string }[]
  kicker?: string
  title?: string
  text?: string
  labels: ScrollerLabels
}

/**
 * Nastro di foto a filo di pagina.
 *
 * Stessa grammatica di tutti gli scroller: utility globali
 * `.scroller .scroller-snap` (barra di sistema nascosta, snap proximity,
 * `overscroll-behavior-x: contain` — il gesto orizzontale non passa al
 * documento) e la riga di controlli condivisa sotto, con le frecce che
 * spostano via scrollBy.
 */
export function PhotoStrip({
  photos,
  kicker,
  title,
  text,
  labels,
}: PhotoStripProps) {
  const step = useCallback(
    (el: HTMLUListElement) => el.clientWidth * 0.62,
    []
  )
  const { attach, measure, nudge, progress, thumb, atStart, atEnd, hasOverflow } =
    useScrollRail<HTMLUListElement>(step)

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
        ref={attach}
        className={`scroller scroller-snap ${styles.strip}`}
        onScroll={measure}
        tabIndex={0}
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
            {photo.caption && (
              <span className={styles.caption}>{photo.caption}</span>
            )}
          </li>
        ))}
      </ul>

      <ScrollerControls
        progress={progress}
        thumb={thumb}
        atStart={atStart}
        atEnd={atEnd}
        hasOverflow={hasOverflow}
        nudge={nudge}
        labels={labels}
        className={`wrap ${styles.controls}`}
      />
    </div>
  )
}
