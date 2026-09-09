'use client'

import { useRef, useState } from 'react'
import { TransitionRouter } from 'next-transition-router'
import gsap from 'gsap'
import styles from './PageTransition.module.css'

/**
 * Transizione a tendina: al cambio pagina salgono dal basso le tre
 * strisce dei colori brand (azzurro, arancio, giallo) e per ultima la
 * nera col logotipo; sulla pagina nuova la pila si sfila verso l'alto.
 * Regola iOS: il velo fixed è display:none quando inattivo (un overlay
 * fixed lasciato nel layer tree ammazza lo scroll in Safari mobile).
 */
/* parola spezzata in lettere, ognuna dentro la sua maschera overflow:hidden
   così può salire dal basso senza sbordare */
function Word({ text }: { text: string }) {
  return (
    <span className={styles.word} data-word={text}>
      {[...text].map((c, i) => (
        <span className={styles.mask} key={i}>
          <span className={styles.letter} data-letter>
            {c}
          </span>
        </span>
      ))}
    </span>
  )
}

const reduced = () => {
  try {
    return matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const veilRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)

  const parts = () => {
    const veil = veilRef.current
    if (!veil)
      return {
        stripes: [] as HTMLElement[],
        logo: null as HTMLElement | null,
        creative: [] as HTMLElement[],
        hub: [] as HTMLElement[],
        dash: null as HTMLElement | null,
      }
    const q = (sel: string) => Array.from(veil.querySelectorAll<HTMLElement>(sel))
    return {
      stripes: q('[data-stripe]'),
      logo: veil.querySelector<HTMLElement>('[data-logo]'),
      creative: q('[data-word="creative"] [data-letter]'),
      hub: q('[data-word="hub"] [data-letter]'),
      dash: veil.querySelector<HTMLElement>('[data-dash]'),
    }
  }

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        if (reduced()) {
          next()
          return
        }
        setActive(true)
        const { stripes, logo, creative, hub, dash } = parts()
        const tl = gsap.timeline({ onComplete: next })
        /* y: 0 obbligatorio — il translateY(100%) del CSS arriva a GSAP
           già risolto in pixel (900px) e verrebbe tenuto come offset fisso
           sotto lo yPercent: la tendina "copriva" restando fuori schermo */
        tl.fromTo(
          stripes,
          { yPercent: 100, y: 0 },
          {
            yPercent: 0,
            duration: 0.55,
            ease: 'power3.inOut',
            stagger: 0.09,
          }
        )
        if (logo) {
          /* logotipo composto: "creative" sale lettera per lettera dentro
             le maschere, il trattino cresce in scaleX, "hub" segue in
             stagger. Il contenitore appare secco (set, niente fade) */
          tl.set(logo, { autoAlpha: 1 }, '-=0.15')
          tl.fromTo(
            creative,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.035 },
            '<'
          )
          if (dash) {
            tl.fromTo(
              dash,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.4, ease: 'power3.inOut' },
              '-=0.35'
            )
          }
          tl.fromTo(
            hub,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 },
            '-=0.25'
          )
        }
        return () => tl.kill()
      }}
      enter={(next) => {
        if (reduced()) {
          setActive(false)
          next()
          return
        }
        const { stripes, logo } = parts()
        const tl = gsap.timeline({
          onComplete: () => {
            setActive(false)
            next()
          },
        })
        if (logo) {
          tl.to(logo, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' })
        }
        /* la pila si sfila verso l'alto: prima i colori sotto, per
           ultima la nera che sta sopra */
        tl.to(
          stripes,
          {
            yPercent: -100,
            y: 0,
            duration: 0.55,
            ease: 'power3.inOut',
            stagger: 0.09,
          },
          '-=0.1'
        )
        return () => tl.kill()
      }}
    >
      <div
        ref={veilRef}
        className={styles.veil}
        style={active ? undefined : { display: 'none' }}
        aria-hidden="true"
      >
        <div className={`${styles.stripe} ${styles.azzurro}`} data-stripe />
        <div className={`${styles.stripe} ${styles.arancio}`} data-stripe />
        <div className={`${styles.stripe} ${styles.giallo}`} data-stripe />
        <div className={`${styles.stripe} ${styles.nero}`} data-stripe>
          <span className={styles.logo} data-logo>
            <Word text="creative" />
            <i data-dash />
            <Word text="hub" />
          </span>
        </div>
      </div>
      {children}
    </TransitionRouter>
  )
}
