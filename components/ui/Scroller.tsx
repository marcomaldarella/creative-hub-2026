'use client'

import { useCallback, useEffect, useState } from 'react'
import { Arrow } from './Arrow'
import styles from './Scroller.module.css'

export type ScrollerLabels = { prev: string; next: string; hint: string }

export type ScrollRail<T extends HTMLElement> = {
  /** callback ref da mettere sull'elemento che scorre */
  attach: (el: T | null) => void
  /** l'elemento, quando è montato */
  el: T | null
  /** da passare a onScroll dell'elemento che scorre */
  measure: () => void
  nudge: (dir: 1 | -1) => void
  /** 0..1 — posizione del pollice */
  progress: number
  /** 0..1 — quota di nastro visibile */
  thumb: number
  atStart: boolean
  atEnd: boolean
  /** false = il nastro ci sta tutto: i controlli non servono */
  hasOverflow: boolean
}

/**
 * Stato condiviso dei nastri orizzontali: misura quanto nastro resta
 * (per la barretta) e sposta con `scrollBy` — mai `scrollIntoView`, che
 * si porterebbe dietro anche lo scroll verticale del documento.
 *
 * `step` dice quanto vale un passo di freccia (lo decide il nastro:
 * una card, due ritratti, mezzo schermo…).
 *
 * L'elemento sta in uno state, non in una ref: così niente ref
 * attraversa il render (regola react-hooks/refs) e l'osservatore parte
 * appena il nodo è montato.
 */
export function useScrollRail<T extends HTMLElement>(
  step: (el: T) => number
): ScrollRail<T> {
  const [el, setEl] = useState<T | null>(null)
  const [progress, setProgress] = useState(0)
  const [thumb, setThumb] = useState(1)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const measure = useCallback(() => {
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setThumb(el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1)
    setProgress(max > 0 ? el.scrollLeft / max : 0)
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(max <= 1 || el.scrollLeft >= max - 1)
  }, [el])

  /* la prima misura la fa l'osservatore stesso: ResizeObserver chiama
     la callback appena si mette in ascolto (niente setState nel corpo
     dell'effetto, niente render a cascata) */
  useEffect(() => {
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [el, measure])

  const nudge = useCallback(
    (dir: 1 | -1) => {
      if (!el) return
      el.scrollBy({ left: dir * step(el), behavior: 'smooth' })
    },
    [el, step]
  )

  return {
    attach: setEl,
    el,
    measure,
    nudge,
    progress,
    thumb,
    atStart,
    atEnd,
    hasOverflow: thumb < 0.999,
  }
}

/**
 * La riga di controlli di OGNI nastro: barretta di avanzamento a
 * sinistra, le due frecce a destra, sotto al contenuto. Una forma sola,
 * una misura sola, lo stesso stato disabilitato agli estremi.
 */
export function ScrollerControls({
  progress,
  thumb,
  atStart,
  atEnd,
  hasOverflow,
  nudge,
  labels,
  className,
}: {
  progress: number
  thumb: number
  atStart: boolean
  atEnd: boolean
  hasOverflow: boolean
  nudge: (dir: 1 | -1) => void
  labels: ScrollerLabels
  className?: string
}) {
  if (!hasOverflow) return null
  /* il pollice non scende sotto il 12%: più sottile non si vede */
  const w = Math.max(thumb, 0.12)

  return (
    <div className={[styles.controls, className].filter(Boolean).join(' ')}>
      <div className={styles.track} role="presentation" title={labels.hint}>
        <span
          className={styles.thumb}
          style={{
            width: `${w * 100}%`,
            left: `${progress * (100 - w * 100)}%`,
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
  )
}

/**
 * Dice se un nastro sborda davvero. Serve alla sfumatura delle file di
 * voci (barre sticky): la mask va messa SOLO quando c'è overflow,
 * altrimenti su desktop sbiadirebbe l'ultima voce di una fila che ci
 * sta tutta.
 */
export function useScrollerOverflow<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    if (!el) return
    /* come sopra: la prima misura arriva dall'osservatore */
    const check = () => setOverflow(el.scrollWidth - el.clientWidth > 1)
    const ro = new ResizeObserver(check)
    ro.observe(el)
    Array.from(el.children).forEach((c) => ro.observe(c))
    return () => ro.disconnect()
  }, [el])

  return { attach: setEl, el, overflow }
}

/**
 * Fila di voci che scorre (le barre sticky: pagine di sezione, indice
 * delle schede corso): barra di sistema nascosta, nessun chaining sulla
 * pagina e la sfumatura al taglio destro solo quando sborda davvero.
 */
export function ScrollerRow({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<'nav'>) {
  const { attach, overflow } = useScrollerOverflow<HTMLElement>()

  return (
    <nav
      ref={attach}
      className={['scroller', overflow ? 'scroller-fade-end' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </nav>
  )
}

/** Il solo bottone-freccia, per i caroselli che hanno i controlli altrove. */
export function ScrollerNav({
  dir,
  label,
  disabled,
  onClick,
  className,
}: {
  dir: 'w' | 'e'
  label: string
  disabled?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={[styles.nav, className].filter(Boolean).join(' ')}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Arrow dir={dir} size={16} />
    </button>
  )
}
