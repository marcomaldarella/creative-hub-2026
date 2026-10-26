'use client'

import { useRef, useState } from 'react'
import { TransitionRouter } from 'next-transition-router'
import gsap from 'gsap'
import styles from './PageTransition.module.css'

/**
 * Transizione a due andature. Cambiando SEZIONE (primo segmento del
 * path: academy → studios…) salgono dal basso le tre strisce dei colori
 * brand (azzurro, arancio, giallo) e per ultima la nera col logotipo;
 * sulla pagina nuova la pila si sfila verso l'alto. Restando nella
 * stessa sezione, niente tendina: solo un fade+slittamento del main.
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

/* sezione = primo segmento del path, locale escluso: /academy/corsi e
   /en/academy sono entrambi "academy", la home è '' */
const sectionOf = (url?: string | null) => {
  if (!url) return null
  let path = url
  try {
    path = new URL(url, window.location.origin).pathname
  } catch {
    /* già un path relativo */
  }
  const segs = path.split('/').filter(Boolean)
  if (segs[0] === 'en') segs.shift()
  return segs[0] ?? ''
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const veilRef = useRef<HTMLDivElement | null>(null)
  const pageRef = useRef<HTMLDivElement | null>(null)
  /* deciso in leave, letto in enter: la tendina col logo parte solo
     cambiando sezione; dentro la stessa sezione basta il fade della
     pagina, senza rifare tutta la solfa del logo */
  const fullRef = useRef(true)
  const [active, setActive] = useState(false)

  const pageMain = () =>
    pageRef.current?.querySelector<HTMLElement>('main') ?? pageRef.current

  const parts = () => {
    const veil = veilRef.current
    if (!veil)
      return {
        stripes: [] as HTMLElement[],
        logo: null as HTMLElement | null,
        creative: [] as HTMLElement[],
        hub: [] as HTMLElement[],
      }
    const q = (sel: string) => Array.from(veil.querySelectorAll<HTMLElement>(sel))
    return {
      stripes: q('[data-stripe]'),
      logo: veil.querySelector<HTMLElement>('[data-logo]'),
      creative: q('[data-word="creative"] [data-letter]'),
      hub: q('[data-word="hub"] [data-letter]'),
    }
  }

  return (
    <TransitionRouter
      auto
      leave={(next, from, to) => {
        if (reduced()) {
          next()
          return
        }
        const a = sectionOf(from)
        const b = sectionOf(to)
        fullRef.current = a === null || b === null || a !== b
        if (!fullRef.current) {
          /* stessa sezione: si sfuma solo il main della pagina, il
             chrome (nav, topbar) resta fermo */
          const el = pageMain()
          if (!el) {
            next()
            return
          }
          const tl = gsap.timeline({ onComplete: next })
          tl.to(el, { autoAlpha: 0, y: 14, duration: 0.22, ease: 'power2.in' })
          return () => tl.kill()
        }
        setActive(true)
        const { stripes, logo, creative, hub } = parts()
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
             le maschere, "hub" segue in stagger. Il contenitore appare
             secco (set, niente fade) */
          tl.set(logo, { autoAlpha: 1 }, '-=0.15')
          tl.fromTo(
            creative,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.32, ease: 'power3.out', stagger: 0.022 },
            '<'
          )
          tl.fromTo(
            hub,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.32, ease: 'power3.out', stagger: 0.038 },
            '-=0.2'
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
        if (!fullRef.current) {
          const el = pageMain()
          if (!el) {
            next()
            return
          }
          const tl = gsap.timeline({ onComplete: next })
          tl.fromTo(
            el,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out' }
          )
          return () => tl.kill()
        }
        const { stripes, logo } = parts()
        const tl = gsap.timeline({
          onComplete: () => {
            setActive(false)
            next()
          },
        })
        if (logo) {
          tl.to(logo, { autoAlpha: 0, duration: 0.16, ease: 'power2.in' })
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
            <Word text="hub" />
          </span>
        </div>
      </div>
      <div ref={pageRef}>{children}</div>
    </TransitionRouter>
  )
}
