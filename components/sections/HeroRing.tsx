'use client'

import { useEffect } from 'react'

/** velocità massima dell'anello: 1 = riposo (ringSpin 90s in CSS) */
const MAX_RATE = 2.6
/** quanto un pixel di scroll carica la velocità */
const SCROLL_GAIN = 0.025
/** sfocatura massima: l'anello che gira forte "smaterializza" un po' */
const MAX_BLUR = 3.4
/** rientro verso il riposo, per frame */
const DECAY = 0.05

/**
 * Moto del marquee circolare attorno alla sfera.
 *
 * L'anello ruota sempre (animazione CSS, 90s). Qui si agisce solo sulla
 * VELOCITÀ — `playbackRate` sull'animazione, non `animation-duration`:
 * cambiare la durata a metà corsa farebbe saltare la fase, il playbackRate
 * no — e sulla sfocatura, che cresce con la velocità.
 *
 * Due cose lo caricano:
 *   · la prima apparizione (la splash manda 'hero-ring-boost')
 *   · lo scroll della pagina, in proporzione a quanto è veloce
 *
 * Poi rientra da solo al passo lento di riposo.
 */
export function HeroRing() {
  useEffect(() => {
    const ring = document.querySelector<SVGElement>('[data-splash="disc"]')
    if (!ring) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let target = 1
    let rate = 1
    let lastY = window.scrollY
    let raf = 0

    const boost = (to: number) => {
      target = Math.min(MAX_RATE, Math.max(target, to))
    }
    const onBoost = (e: Event) => {
      const d = (e as CustomEvent).detail
      boost(typeof d?.rate === 'number' ? d.rate : 3)
    }
    const onScroll = () => {
      const y = window.scrollY
      boost(1 + Math.abs(y - lastY) * SCROLL_GAIN)
      lastY = y
    }

    const frame = () => {
      target += (1 - target) * DECAY
      rate += (target - rate) * 0.1
      /* l'unica animazione dell'anello è ringSpin; se il browser non
         espone getAnimations si resta al passo di riposo */
      ring.getAnimations?.().forEach((a) => {
        a.playbackRate = rate
      })
      /* durante la splash il filtro lo guida GSAP (blur che si ritira):
         due mani sulla stessa proprietà si annullerebbero a vicenda */
      if (!root.dataset.boot) {
        const b = Math.max(0, rate - 1) * 1.1
        ring.style.filter = b > 0.05 ? `blur(${Math.min(MAX_BLUR, b).toFixed(2)}px)` : ''
      }
      raf = requestAnimationFrame(frame)
    }

    window.addEventListener('hero-ring-boost', onBoost)
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('hero-ring-boost', onBoost)
      window.removeEventListener('scroll', onScroll)
      ring.getAnimations?.().forEach((a) => {
        a.playbackRate = 1
      })
      ring.style.filter = ''
    }
  }, [])

  return null
}
