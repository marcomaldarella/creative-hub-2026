'use client'

import { useCallback } from 'react'
import {
  ScrollerControls,
  useScrollRail,
  type ScrollerLabels,
} from '@/components/ui'
import { l } from '@/lib/sanity/l'
import type { Locale } from '@/lib/i18n/config'
import type { Teacher } from '@/lib/sanity/types'
import { Thumb } from './Thumb'
import styles from './TeacherStrip.module.css'

/* nome e, a capo, cognome: si spezza al primo spazio (i cognomi
   composti restano insieme sulla seconda riga) */
function nameLines(name?: string | null): [string] | [string, string] {
  const n = name ?? ''
  const i = n.indexOf(' ')
  return i === -1 ? [n] : [n.slice(0, i), n.slice(i + 1)]
}

export type TeacherStripProps = {
  teachers: Teacher[]
  locale: Locale
  /** ultima cella: cerchio vuoto col + che invita a candidarsi */
  join: { label: string; role: string; href: string }
  labels: ScrollerLabels
}

/**
 * Fila di docenti che scorre in orizzontale.
 *
 * Stessa grammatica di tutti gli scroller del sito: utility globali
 * `.scroller .scroller-snap` sulla superficie e `ScrollerControls` sotto.
 * In particolare, tre regole che restano volute:
 *  · `overscroll-behavior-x: contain` (in `.scroller`) — lo scroll
 *    orizzontale non si propaga MAI alla pagina: senza, arrivati in fondo
 *    alla fila il gesto continuava sul documento e la pagina saltava in alto;
 *  · niente scrollbar di sistema: al suo posto la barretta di avanzamento
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
  /* un passo ≈ due ritratti, mai più di uno schermo di fila */
  const step = useCallback(
    (el: HTMLUListElement) => Math.min(el.clientWidth * 0.8, 340),
    []
  )
  const rail = useScrollRail<HTMLUListElement>(step)

  return (
    <div className={styles.wrap}>
      <ul
        ref={rail.ref}
        className={`scroller scroller-snap ${styles.strip}`}
        onScroll={rail.measure}
        tabIndex={0}
        aria-label={labels.hint}
      >
        {teachers.map((teacher, i) => (
          <li key={teacher._id} className={styles.person}>
            <Thumb
              image={teacher.photo}
              alt={teacher.name ?? ''}
              index={i}
              ratio="4 / 5"
              width={320}
              className={styles.photo}
            />
            <span className={styles.name}>
              {nameLines(teacher.name).map((line, j) => (
                <span key={j} className={styles.nameLine}>
                  {line}
                </span>
              ))}
            </span>
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

      <ScrollerControls rail={rail} labels={labels} />
    </div>
  )
}
