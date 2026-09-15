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
 * Parte con il taglio orizzontale già nel markup, così c'è anche senza
 * JS; su schermo stretto e verticale la sorgente viene sostituita al
 * mount, PRIMA che il browser abbia scaricato quella sbagliata.
 */
export function BgVideo({ src, portrait, poster, className }: BgVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    if (!v || !portrait) return
    if (
      !window.matchMedia('(max-width: 760px) and (orientation: portrait)')
        .matches
    ) {
      return
    }
    v.src = portrait
    v.load()
    // su iOS il play dopo uno swap va richiesto a mano; se il browser lo
    // rifiuta resta il poster, nessun errore in console
    void v.play().catch(() => {})
  }, [portrait])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  )
}
