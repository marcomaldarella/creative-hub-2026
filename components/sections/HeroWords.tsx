'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './HeroWords.module.css'

export type HeroWord = {
  label: string
  href: string
}

/* colori di sezione: token CSS per il glow, rgb normalizzato per lo shader */
const ACCENTS = [
  { token: 'var(--azzurro)', rgb: [0.31, 0.66, 0.87] }, // academy #4FA8DF
  { token: 'var(--arancio)', rgb: [1.0, 0.43, 0.07] }, // studio #FF6E12
  { token: 'var(--giallo-fluo)', rgb: [0.87, 1.0, 0.23] }, // coworking #DFFF3A
] as const

/* autoplay su touch: una parola accesa per ON_MS, poi pausa OFF_MS */
const ON_MS = 2600
const OFF_MS = 2900

/* avvisa l'orb che deve tingersi (stesso canale dei pin di home 2) */
const tintEvent = (rgb: readonly number[] | null) => {
  window.dispatchEvent(
    new CustomEvent('hero-tint', {
      detail: rgb ? { on: true, rgb } : { on: false },
    })
  )
}

/**
 * Le tre anime dell'hub al centro della sfera nuda. Col mouse la parola
 * si accende in hover; su touch — dove l'hover non esiste — le tre si
 * illuminano a rotazione da sole. In entrambi i casi la sfera dietro
 * prende lo stesso colore.
 */
export function HeroWords({ words }: { words: [HeroWord, HeroWord, HeroWord] }) {
  const [auto, setAuto] = useState<number | null>(null)

  /* autoplay solo dove non c'è puntatore e il moto non è ridotto */
  useEffect(() => {
    const touch = window.matchMedia('(hover: none)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!touch || reduced) return

    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const on = () => {
      setAuto(i)
      tintEvent(ACCENTS[i].rgb)
      timer = setTimeout(off, ON_MS)
    }
    const off = () => {
      setAuto(null)
      tintEvent(null)
      i = (i + 1) % words.length
      timer = setTimeout(on, OFF_MS)
    }
    timer = setTimeout(on, 1400)
    return () => {
      clearTimeout(timer)
      tintEvent(null)
    }
  }, [words.length])

  const tint = (i: number | null) =>
    tintEvent(i === null ? null : ACCENTS[i].rgb)

  return (
    <div className={styles.words}>
      <span className={`mono ${styles.mark}`}>
        creative <span aria-hidden="true">—</span> hub
      </span>
      <h1 className={`display-black ${styles.title}`}>
        {words.map((w, i) => (
          <Link
            key={w.href}
            href={w.href}
            className={auto === i ? styles.lit : undefined}
            style={{ '--wcol': ACCENTS[i].token } as React.CSSProperties}
            onPointerEnter={() => tint(i)}
            onPointerLeave={() => tint(null)}
            onFocus={() => tint(i)}
            onBlur={() => tint(null)}
          >
            {w.label}
          </Link>
        ))}
      </h1>
    </div>
  )
}
