'use client'

import { useEffect } from 'react'

/* L'intro resta MONOCROMA (richiesta cliente): niente blu, scritta e blob
   bianchi. Il canale 'hero-tint' serve qui solo a ILLUMINARE la nuvola —
   verso il bianco (la hero è sempre in fascia nera) */
const BOOT_LIGHT = [1, 1, 1] as const

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
 *      nella sfera, ancora monocroma (evento 'hero-form' verso HeroOrb)
 *   2. "creative hub" entra al centro, una riga dopo l'altra, e insieme
 *      sfera e logotipo si ILLUMINANO (tinta + data-lit sul mark: la
 *      scritta si accende nello stesso istante in cui cambia la sfera).
 *      L'intro è monocroma: bianco su nero, nessun colore di sezione
 *   3. la luce si spegne mentre il logotipo se ne va, con lo stagger al
 *      contrario (dall'ultima riga alla prima, verso l'alto), lasciando il
 *      posto alle tre parole
 *   4. ENTRANO le tre parole della home, una dopo l'altra
 *   5. entra il resto: etichette, caption, nav, footer
 *   6. e per ultimo il marquee circolare attorno alla sfera
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
    /* i listener della scorciatoia vivono dentro il context di GSAP:
       qui fuori resta il modo di staccarli allo smontaggio */
    let unbindSkip: (() => void) | null = null

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

          /* 1 — il blob si materializza: la nuvola si compone, ancora
             monocroma. Nessuna scala: la sfera è già alla sua misura */
          tl.add(() => window.dispatchEvent(new Event('hero-form')))
            .to({}, { duration: FORM_S })

            /* 2 — "creative hub" entra al centro, riga dopo riga */
            .fromTo(
              markLines,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.12 },
              `-=${FORM_S * 0.35}`
            )

            /* ...e nello stesso istante sfera e logotipo si ILLUMINANO:
               la scritta si accende in corrispondenza del cambio della
               sfera, non prima e non dopo. Tutto bianco: nessun colore
               nell'intro */
            .add(() => {
              /* hero sempre in fascia nera: accensione chiara fissa */
              tint(BOOT_LIGHT)
              mark.dataset.lit = '1'
            }, '<0.15')

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

            /* il colore si spegne mentre il logotipo esce: sfera e scritta
               tornano mono insieme */
            .add(() => {
              tint(null)
              delete mark.dataset.lit
            }, '<')

            /* 4 — nel posto lasciato libero entrano le tre parole */
            .set(words, { autoAlpha: 1 }, '<0.45')
            .fromTo(
              wordLinks,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.13 },
              '<'
            )

            /* 5 — e infine il resto della pagina */
            .to(
              [annot, sub, ...chrome].filter(Boolean),
              { autoAlpha: 1, duration: 0.6, stagger: 0.07 },
              '-=0.45'
            )

            /* 6 — ULTIMO di tutti, il marquee circolare (data-splash="disc"):
               arriva sfocato e si mette a fuoco, e per l'occasione gira più
               veloce del solito prima di rientrare al passo lento (il boost
               lo raccoglie HeroRing) */
            .fromTo(
              [disc].filter(Boolean),
              { autoAlpha: 0, filter: 'blur(16px)' },
              {
                autoAlpha: 1,
                filter: 'blur(0px)',
                duration: 1.3,
                ease: 'power2.out',
                onStart: () =>
                  window.dispatchEvent(
                    new CustomEvent('hero-ring-boost', { detail: { rate: 2.6 } })
                  ),
              },
              '-=0.15'
            )
            /* prima cade `data-boot`, POI si tolgono gli stili inline:
               invertendo l'ordine le regole di partenza tornerebbero valide
               per un istante e la hero sfarfallerebbe */
            .add(() => {
              finish()
              gsap.set(
                [stage, disc, words, annot, sub, ...markLines, ...chrome].filter(
                  Boolean
                ),
                { clearProps: 'all' }
              )
              /* ⚠️ sulle tre parole SOLO le proprietà animate: ognuna porta
                 inline la sua `--wcol` (il colore di sezione per hover e
                 autoplay) e `clearProps: 'all'` cancellava l'intero
                 attributo style — l'hover restava senza colore e le parole
                 rimanevano bianche per sempre */
              gsap.set(wordLinks, {
                clearProps: 'opacity,visibility,transform',
              })
            })

          /* ——— scorciatoia: chi prova a scrollare vuole il sito, non la
             splash. Durante l'intro lo scroll è bloccato (overflow hidden
             su html/body) e insistere dava la sensazione che la pagina si
             fosse incartata: al primo gesto si salta alla fine ——— */
          const skipEvents = ['wheel', 'touchmove', 'keydown'] as const
          const skip = () => {
            unbind()
            tl.kill()
            tint(null)
            delete mark.dataset.lit
            /* la sfera si compone comunque: senza, resterebbe una nebbia */
            window.dispatchEvent(new Event('hero-form'))
            finish()
            gsap.set(
              [stage, disc, words, annot, sub, mark, ...markLines, ...chrome].filter(
                Boolean
              ),
              { clearProps: 'all' }
            )
            gsap.set(wordLinks, { clearProps: 'opacity,visibility,transform' })
          }
          function unbind() {
            skipEvents.forEach((ev) => window.removeEventListener(ev, skip))
          }
          unbindSkip = unbind
          skipEvents.forEach((ev) =>
            window.addEventListener(ev, skip, { passive: true })
          )
          tl.eventCallback('onComplete', unbind)

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
      unbindSkip?.()
      ctx?.revert()
    }
  }, [])

  return null
}
