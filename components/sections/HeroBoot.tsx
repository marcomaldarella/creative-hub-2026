'use client'

import { useEffect } from 'react'

/* tinta blu brand della sfera durante il preloader (stessa terna delle
   HeroWords per Academy) */
const BOOT_RGB = [0.24, 0.49, 0.6] as const

/** quanto resta visibile il disco piccolo DOPO che la sfera è pronta */
const HOLD_MS = 700
/** oltre questa soglia si apre comunque: mai un preloader infinito */
const MAX_MS = 2600

/**
 * Preloader della home: il disco piccolo (sfera tinta di blu + anello di
 * testo + wordmark "creative hub") si apre nella hero vera.
 *
 * Non monta nulla: lo stato vive in `data-boot` su <html>, scritto PRIMA
 * del paint dallo script `boot-init` nel layout — così non c'è il lampo
 * della hero completa prima del preloader. Qui lo togliamo quando la
 * sfera è pronta, e comunque entro MAX_MS.
 *
 * Si mostra una volta per sessione e mai con prefers-reduced-motion
 * (entrambe le guardie sono già nello script di init).
 */
export function HeroBoot() {
  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.boot !== '1') return

    let released = false
    let holdTimer: ReturnType<typeof setTimeout>

    const release = () => {
      if (released) return
      released = true
      clearTimeout(holdTimer)
      clearTimeout(maxTimer)
      window.removeEventListener('hero-ready', onReady)
      delete root.dataset.boot
      try {
        sessionStorage.setItem('ch-booted', '1')
      } catch {
        /* private browsing: pazienza, si rivedrà al reload */
      }
      /* la sfera torna al suo grigio mentre si apre */
      window.dispatchEvent(
        new CustomEvent('hero-tint', { detail: { on: false } })
      )
    }

    /* la sfera è pronta: la tingo di blu, la tengo un attimo piccola e apro */
    const onReady = () => {
      window.dispatchEvent(
        new CustomEvent('hero-tint', { detail: { on: true, rgb: BOOT_RGB } })
      )
      holdTimer = setTimeout(release, HOLD_MS)
    }

    window.addEventListener('hero-ready', onReady)
    const maxTimer = setTimeout(release, MAX_MS)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(maxTimer)
      window.removeEventListener('hero-ready', onReady)
    }
  }, [])

  return null
}
