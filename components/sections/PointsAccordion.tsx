'use client'

import { useState } from 'react'
import { Thumb } from './Thumb'
import styles from './PointsAccordion.module.css'

export type PointsAccordionItem = {
  title: string
  text: string
}

/**
 * I punti elenco di un topic, quando invece di una riga secca hanno un
 * testo esteso: accordion "pieno" — una voce alla volta, righe con +/−
 * (stessa grammatica del menu mobile: il trattino verticale collassa,
 * MAI rotazione del cerchio), pannello che si apre su grid-template-rows
 * 0fr→1fr con dentro testo + foto a metà, non una card piccola.
 *
 * Senza una foto reale in Sanity, il pannello usa il gradient di fallback
 * di `Thumb` (stesso placeholder delle cover corso): si sostituisce da
 * solo appena arriva un'immagine vera.
 */
export function PointsAccordion({ items }: { items: PointsAccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className={styles.list}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.title} className={styles.row}>
            <button
              type="button"
              className={styles.head}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className={`display-thin ${styles.title}`}>{item.title}</span>
              <span
                className={isOpen ? `${styles.plus} ${styles.plusOpen}` : styles.plus}
                aria-hidden="true"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M9 3v12" className={styles.plusV} />
                  <path d="M3 9h12" />
                </svg>
              </span>
            </button>

            <div className={isOpen ? `${styles.panel} ${styles.panelOpen}` : styles.panel}>
              <div className={styles.panelInner}>
                <p className={styles.text}>{item.text}</p>
                <Thumb index={i} fill className={styles.photo} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
