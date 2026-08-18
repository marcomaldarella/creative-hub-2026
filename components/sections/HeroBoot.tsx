'use client'

import { useEffect } from 'react'

/* tinta blu brand della sfera durante la splash (stessa terna delle
   HeroWords per Academy) */
const BOOT_RGB = [0.24, 0.49, 0.6] as const

/** oltre questa attesa la sequenza parte comunque: mai una splash infinita */
const MAX_WAIT_MS = 900

/** durata della materializzazione della nuvola (lerp uForm lato shader) */
const FORM_S = 1.5

/** quanto resta in campo il logotipo prima di uscire */
const HOLD_S = 2.2

/* il download parte alla valutazione del modulo, in parallelo con
   l'idratazione: dentro l'effect arrivava troppo tardi e in produzione la
   splash sforava i 5 secondi */
const gsapReady = import('gsap')

const tint = (rgb: readonly number[] | null) =>
  window.dispatchEvent(
    new CustomEvent('hero-tint', {
      detail: rgb ? { on: true, rgb } : { on: false },
    })
  )

/**
 * Splash della home:
 *
 *   1. il blob si MATERIALIZZA — i grani arrivano da fuori e si compongono
 *      nella sfera, tinta di blu (evento 'hero-form' verso HeroOrb)
 *   2. "creative hub" entra al centro, una riga dopo l'altra
 *   3. e se ne va con lo stagger al contrario (dall'ultima riga alla prima,
 *      verso l'alto), lasciando il posto alle tre parole
 *   4. ENTRANO le tre parole della home, una dopo l'altra
 *   5. entra il resto: etichette, caption, nav, footer
 *
 * ⚠️ NESSUNA SCALA in tutta la sequenza: sfera, anello e testi hanno da
 * subito la loro misura definitiva. Scalare il palco (la vecchia versione
 * partiva da 0.46) faceva ballare centri e dimensioni, ed era la cosa che
 * si notava di più all'atterraggio.
 *
 * Lo stato iniziale è in CSS (`data-boot` su <html>, scritto prima del
 * paint dallo script boot-init): senza, si vedrebbe la hero completa per
 * un fotogramma prima che parta l'animazione. GSAP anima da lì con stili
 * inline, che vincono sul foglio di stile, e alla fine toglie l'attributo.
 *
 * GSAP è importato dinamicamente: non entra nel bundle iniziale, e se il
 * caricamento fallisce la hero resta comunque visibile (il timer di
 * sicurezza nello script di init toglie `data-boot` a prescindere).
 */
export function HeroBoot() {
  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.boot !== '1') return

    const q = (s: string) => document.querySelector<HTMLElement>(`[data-splash="${s}"]`)
    const mark = q('mark')
    const stage = q('stage')
    const disc = q('disc')
    const words = q('words')
    const annot = q('annot')
    const sub = q('sub')
    const chrome = [
      document.querySelector<HTMLElement>('body > header'),
      document.querySelector<HTMLElement>('body > footer'),
    ].filter(Boolean) as HTMLElement[]
    const wordLinks = words ? Array.from(words.querySelectorAll('a')) : []
    /* le due righe del logotipo: entrano ed escono in stagger */
    const markLines = mark ? Array.from(mark.querySelectorAll('span')) : []

    if (!mark || !stage) return

    /* Il wordmark vive fuori dal palco — non deve rimpicciolirsi con lui — ma
       deve stare al centro del disco, e il centro del disco è l'ANELLO, non il
       riquadro del palco: dentro al palco sfera, anello e parole stanno nella
       stessa cella di griglia, e se le parole sono più alte dell'anello la
       riga cresce e deborda in basso. Anello e sfera si centrano su quella
       riga, il palco no — misurati, ballavano di 16px in verticale, ed è lo
       scarto che si vedeva fra logotipo e marquee.

       Il rect dell'anello è già quello scalato dal boot, e la scala è
       centrata: il centro è quello buono. */
    const align = () => {
      const host = mark.offsetParent as HTMLElement | null
      if (!host) return
      const h = host.getBoundingClientRect()
      const d = (disc ?? stage).getBoundingClientRect()
      const top = d.top - h.top
      mark.style.top = `${top}px`
      mark.style.height = `${d.height}px`
      mark.style.bottom = 'auto'

      /* Secondo passaggio, sui glifi. Centrare il riquadro non basta: la
         riga di testo porta con sé il piombo sopra e sotto, e "creative /
         hub" ci finisce dentro storto. Si misura dove sta davvero
         l'inchiostro con una Range e si corregge lo scarto — così il
         logotipo è concentrico al marquee, non quasi. */
      const r = document.createRange()
      r.selectNodeContents(mark)
      const ink = r.getBoundingClientRect()
      if (ink.height) {
        const dy = d.top + d.height / 2 - (ink.top + ink.height / 2)
        mark.style.top = `${top + dy}px`
      }
    }

    align()
    /* e di nuovo a font caricato: la prima misura cade spesso mentre è
       ancora in piedi il fallback di sistema, che ha metriche diverse — su
       telefono, dove il wordmark è 15vw, lo scarto era di otto pixel */
    document.fonts?.ready.then(() => {
      if (root.dataset.boot === '1') align()
    })

    let ctx: { revert: () => void } | null = null
    let alive = true

    const finish = () => {
      delete root.dataset.boot
      tint(null)
    }

    gsapReady
      .then(({ gsap }) => {
        if (!alive) return
        ctx = gsap.context(() => {
          /* parte in pausa: la materializzazione ha senso solo quando il
             canvas della sfera è vivo (evento 'hero-ready') */
          const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            paused: true,
          })

          /* 1 — il blob si materializza: la nuvola si compone e prende
             la tinta blu. Nessuna scala: la sfera è già alla sua misura */
          tl.add(() => {
            tint(BOOT_RGB)
            window.dispatchEvent(new Event('hero-form'))
          })
            .to({}, { duration: FORM_S })

            /* 2 — "creative hub" entra al centro, riga dopo riga */
            .fromTo(
              markLines,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.12 },
              `-=${FORM_S * 0.35}`
            )

            /* 3 — e se ne va allo stesso modo ma al contrario: dall'ultima
               riga alla prima, verso l'alto */
            .to(
              markLines,
              {
                autoAlpha: 0,
                y: -26,
                duration: 0.55,
                ease: 'power2.in',
                stagger: { each: 0.12, from: 'end' },
              },
              `+=${HOLD_S}`
            )

            /* 4 — nel posto lasciato libero entrano le tre parole */
            .set(words, { autoAlpha: 1 }, '<0.45')
            .fromTo(
              wordLinks,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.13 },
              '<'
            )
            .add(() => tint(null), '<')

            /* 5 — e infine il resto della pagina */
            .to(
              [annot, sub, ...chrome].filter(Boolean),
              { autoAlpha: 1, duration: 0.6, stagger: 0.07 },
              '-=0.45'
            )
            /* prima cade `data-boot`, POI si tolgono gli stili inline:
               invertendo l'ordine le regole di partenza tornerebbero valide
               per un istante e la hero sfarfallerebbe */
            .add(() => {
              finish()
              gsap.set(
                [
                  stage,
                  words,
                  annot,
                  sub,
                  ...markLines,
                  ...wordLinks,
                  ...chrome,
                ].filter(Boolean),
                { clearProps: 'all' }
              )
            })

          /* si parte quando la sfera è viva, comunque non oltre MAX_WAIT_MS:
             una splash bloccata è peggio di una sfera grezza */
          const go = () => {
            window.removeEventListener('hero-ready', go)
            clearTimeout(timer)
            if (tl.paused()) tl.play()
          }
          const timer = setTimeout(go, MAX_WAIT_MS)
          window.addEventListener('hero-ready', go)
          /* sfera già pronta prima di questo punto: l'evento è passato,
             resta il flag su <html> */
          if (root.dataset.heroReady === '1') go()
        })
      })
      .catch(finish)

    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  return null
}
