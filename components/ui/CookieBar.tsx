'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './CookieBar.module.css'

export type CookieBarProps = {
  labels: {
    text: string
    privacy: string
    cookie: string
    ok: string
  }
  privacyHref: string
  cookieHref: string
}

const KEY = 'cookie-ok'

/**
 * Barra cookie a tutta larghezza in fondo al viewport, alla vercel:
 * superficie scura appena più chiara del nero, filo sottile sopra,
 * testo a sinistra e azioni a destra. Il consenso vive in localStorage;
 * finché non serve (o dopo l'ok) il componente NON è montato — regola
 * iOS: mai lasciare overlay fixed inattivi nel layer tree.
 */
export function CookieBar({ labels, privacyHref, cookieHref }: CookieBarProps) {
  /* parte nascosta anche al primo paint (SSR non conosce localStorage):
     compare solo dopo il check al mount, senza flash */
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== '1') setOpen(true)
    } catch {
      /* niente storage: la barra resta chiusa, il sito funziona uguale */
    }
  }, [])

  if (!open) return null

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* senza storage vale per la pagina */
    }
    setOpen(false)
  }

  return (
    <div className={styles.bar} role="region" aria-label="cookie">
      <div className={styles.in}>
        <p className={styles.text}>
          {labels.text}{' '}
          <Link href={privacyHref} className={styles.link}>
            {labels.privacy}
          </Link>
          {' · '}
          <Link href={cookieHref} className={styles.link}>
            {labels.cookie}
          </Link>
        </p>
        <button type="button" className={styles.ok} onClick={accept}>
          {labels.ok}
        </button>
      </div>
    </div>
  )
}
