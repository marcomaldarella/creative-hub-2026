'use client'

import { useCallback } from 'react'
import type { ReactNode } from 'react'
import { ScrollerControls, useScrollRail, type ScrollerLabels } from '@/components/ui'
import styles from './CourseSlider.module.css'

export type CourseSliderProps = {
  children: ReactNode
  labels: ScrollerLabels
  className?: string
}

/**
 * Nastro orizzontale generico per card (i corsi in evidenza): stessa
 * grammatica di tutti gli scroller del sito — utility globali
 * `.scroller .scroller-snap` sulla superficie (barra di sistema
 * nascosta, snap proximity, il gesto non passa alla pagina) e la riga
 * di controlli condivisa sotto (barretta + due frecce).
 * La larghezza delle card la decide chi la usa (flex-basis sui figli).
 */
export function CourseSlider({ children, labels, className }: CourseSliderProps) {
  /* un passo = una card: prima figlia + gap */
  const step = useCallback((el: HTMLDivElement) => {
    const first = el.firstElementChild as HTMLElement | null
    return first ? first.offsetWidth + 20 : el.clientWidth * 0.4
  }, [])
  const { attach, measure, nudge, progress, thumb, atStart, atEnd, hasOverflow } =
    useScrollRail<HTMLDivElement>(step)

  return (
    <div className={className}>
      <div
        ref={attach}
        className={`scroller scroller-snap ${styles.strip}`}
        onScroll={measure}
        tabIndex={0}
        aria-label={labels.hint}
      >
        {children}
      </div>

      <ScrollerControls
        progress={progress}
        thumb={thumb}
        atStart={atStart}
        atEnd={atEnd}
        hasOverflow={hasOverflow}
        nudge={nudge}
        labels={labels}
        className={styles.controls}
      />
    </div>
  )
}
