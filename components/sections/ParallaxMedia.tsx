'use client'

import { useEffect } from 'react'

/** spostamento massimo, in percentuale dell'altezza dell'immagine */
const SHIFT = 3.2
/** ingrandimento che copre lo spostamento: nessun bordo vuoto */
const ZOOM = 1.08

/**
 * Parallasse leggero sulle foto grandi (regia SSL, sede, live room).
 *
 * Non è un componente da avvolgere: marca le figure con `data-parallax`
 * e questo, montato una volta per pagina, le muove tutte con un solo rAF.
 * Il ciclo gira solo mentre almeno una foto è in viewport — fuori si
 * ferma del tutto, niente lavoro a vuoto durante lo scroll del resto
 * della pagina.
 *
 * Lo spostamento è dentro un `scale(1.08)`: l'immagine di next/image ha
 * misure inline (fill), quindi non si può sovradimensionare da CSS.
 */
export function ParallaxMedia() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax]')
    )
    if (!nodes.length) return

    /* l'<img> di ogni figura si cerca una volta sola: farlo dentro il
       loop (querySelector ad ogni frame, per ogni foto in viewport)
       è lavoro di scripting che si somma a quello di scroll+compositing
       del browser — con foto 100svh e' proprio li' che lo scroll si
       sente scattare */
    const imgs = new Map<HTMLElement, HTMLImageElement>()
    for (const n of nodes) {
      const img = n.querySelector('img')
      if (img) imgs.set(n, img)
    }

    const visible = new Set<HTMLElement>()
    let raf = 0

    const frame = () => {
      const vh = window.innerHeight
      visible.forEach((el) => {
        const img = imgs.get(el)
        if (!img) return
        const r = el.getBoundingClientRect()
        /* -1 quando la foto sta entrando dal basso, +1 quando esce in alto */
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)
        const y = Math.max(-1, Math.min(1, p)) * SHIFT
        img.style.transform = `scale(${ZOOM}) translate3d(0, ${y.toFixed(2)}%, 0)`
      })
      raf = visible.size ? requestAnimationFrame(frame) : 0
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement
          const img = imgs.get(el)
          if (e.isIntersecting) {
            visible.add(el)
            /* promuove la foto a layer proprio SOLO mentre e' animata:
               un will-change permanente su una foto 100svh pesa in
               memoria (vedi il marquee del footer), qui si accende e
               si spegne con la visibilita' */
            if (img) img.style.willChange = 'transform'
          } else {
            visible.delete(el)
            if (img) {
              img.style.transform = ''
              img.style.willChange = ''
            }
          }
        })
        if (visible.size && !raf) raf = requestAnimationFrame(frame)
      },
      { rootMargin: '12% 0px' }
    )
    nodes.forEach((n) => io.observe(n))

    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
      imgs.forEach((img) => {
        img.style.transform = ''
        img.style.willChange = ''
      })
    }
  }, [])

  return null
}
