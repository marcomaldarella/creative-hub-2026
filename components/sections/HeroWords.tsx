'use client'

import Link from 'next/link'
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

/**
 * Le tre anime dell'hub al centro della sfera nuda. In hover la parola
 * si accende del colore della sua sezione (con glow) e avvisa l'orb
 * via CustomEvent 'hero-tint': la nuvola di particelle si tinge.
 */
export function HeroWords({ words }: { words: [HeroWord, HeroWord, HeroWord] }) {
  const tint = (i: number | null) => {
    window.dispatchEvent(
      new CustomEvent('hero-tint', {
        detail: i === null ? { on: false } : { on: true, rgb: ACCENTS[i].rgb },
      })
    )
  }

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
