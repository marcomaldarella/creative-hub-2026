'use client'

import { useEffect } from 'react'

/* tinta blu brand della sfera durante la splash (stessa terna delle
   HeroWords per Academy) */
const BOOT_RGB = [0.24, 0.49, 0.6] as const

/** oltre questa attesa la sfera si apre comunque: mai una splash infinita */
const MAX_WAIT_MS = 1200

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
 * Splash della home, come da storyboard del cliente:
 *
 *   1. il disco piccolo — sfera tinta di blu, anello di testo — e al centro
 *      "creative hub" che ENTRA
 *   2. "creative hub" ESCE
 *   3. la sfera si apre a tutta pagina
 *   4. ENTRANO le tre parole della home, una dopo l'altra
 *   5. entra il resto: etichette, caption, nav, footer
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
    const words = q('words')
    const annot = q('annot')
    const sub = q('sub')
    const chrome = [
      document.querySelector<HTMLElement>('body > header'),
      document.querySelector<HTMLElement>('body > footer'),
    ].filter(Boolean) as HTMLElement[]
    const wordLinks = words ? Array.from(words.querySelectorAll('a')) : []

    if (!mark || !stage) return

    let ctx: { revert: () => void } | null = null
    let alive = true

    const finish = () => {
      delete root.dataset.boot
      try {
        sessionStorage.setItem('ch-booted', '1')
      } catch {
        /* navigazione privata: pazienza, si rivedrà al reload */
      }
      tint(null)
    }

    gsapReady
      .then(({ gsap }) => {
        if (!alive) return
        ctx = gsap.context(() => {
          const small = window.matchMedia('(max-width: 760px)').matches
          let ready = false
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

          /* 1 — "creative hub" entra nel disco piccolo */
          tl.fromTo(
            mark,
            { autoAlpha: 0, y: 28, scale: 0.94 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }
          )
            .add(() => tint(BOOT_RGB), 0.1)

            /* 2 — e poi esce */
            .to(
              mark,
              { autoAlpha: 0, y: -24, duration: 0.5, ease: 'power2.in' },
              small ? '+=0.45' : '+=0.6'
            )

            /* attesa della sfera: si riprende su 'hero-ready' o al timeout.
               Il callback copre il caso in cui la sfera sia già pronta
               prima che la timeline arrivi qui */
            .addPause(undefined, () => {
              if (ready) requestAnimationFrame(() => tl.resume())
            })

            /* 3 — il disco si apre a tutta pagina */
            .to(stage, {
              scale: 1,
              duration: small ? 1 : 1.25,
              ease: 'power3.inOut',
            })
            .add(() => tint(null), '<')

            /* 4 — entrano le tre parole, una dopo l'altra */
            .set(words, { autoAlpha: 1 }, '<0.35')
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
            /* prima cade `data-boot`, POI si tolgono gli stili inline:
               invertendo l'ordine la regola di partenza tornerebbe valida
               per un istante e la sfera ricollasserebbe */
            .add(() => {
              finish()
              gsap.set(
                [stage, words, annot, sub, ...wordLinks, ...chrome].filter(
                  Boolean
                ),
                { clearProps: 'all' }
              )
            })

          /* la pausa dura finché la sfera non è pronta, comunque non oltre
             MAX_WAIT_MS: una splash bloccata è peggio di una sfera grezza */
          const go = () => {
            window.removeEventListener('hero-ready', go)
            clearTimeout(timer)
            ready = true
            if (tl.paused()) tl.resume()
          }
          const timer = setTimeout(go, MAX_WAIT_MS)
          window.addEventListener('hero-ready', go)
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
