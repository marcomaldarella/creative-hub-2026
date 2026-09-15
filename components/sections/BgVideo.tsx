'use client'

import { useEffect, useRef } from 'react'

export type BgVideoProps = {
  /** taglio 16:9, quello che parte di default */
  src: string
  /** taglio 9:16 per schermo stretto e verticale */
  portrait?: string
  /** immagine mostrata finché il video non è pronto */
  poster?: string
  className?: string
}

/**
 * Video di sfondo: muto, in loop, senza controlli.
 *
 * Non scarica NIENTE finché non serve: `preload="none"` e nessun
 * `autoplay`. La sorgente viene assegnata — e la riproduzione avviata —
 * solo quando il video entra nel viewport, e si mette in pausa quando
 * esce. Su una pagina con nove sfondi (bento + cloni del carosello)
 * questo è tutta la differenza fra 5 MB al load e quasi zero.
 *
 * Finché il file non è pronto resta il poster, quindi visivamente non
 * c'è mai un buco.
 */
export function BgVideo({ src, portrait, poster, className }: BgVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    const wanted =
      portrait &&
      window.matchMedia('(max-width: 760px) and (orientation: portrait)')
        .matches
        ? portrait
        : src

    const start = () => {
      // la sorgente si assegna una volta sola, al primo ingresso
      if (!v.getAttribute('src')) {
        v.setAttribute('src', wanted)
        v.load()
      }
      // su iOS il play va richiesto a mano; se il browser lo rifiuta
      // resta il poster, nessun errore in console
      void v.play().catch(() => {})
    }

    // niente riproduzione automatica per chi ha chiesto meno movimento:
    // resta il poster, che è il fotogramma di sempre
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) start()
        else if (!v.paused) v.pause()
      },
      { rootMargin: '200px' }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src, portrait])

  return (
    <video
      ref={ref}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  )
}
