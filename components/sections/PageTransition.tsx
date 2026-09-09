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
export function PageTransition({ children }: { children: React.ReactNode }) {
  const veilRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)

  const parts = () => {
    const veil = veilRef.current
    if (!veil) return { stripes: [] as HTMLElement[], logo: null as HTMLElement | null }
    return {
      stripes: Array.from(veil.querySelectorAll<HTMLElement>('[data-stripe]')),
      logo: veil.querySelector<HTMLElement>('[data-logo]'),
    }
  }

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        setActive(true)
        const { stripes, logo } = parts()
        const tl = gsap.timeline({ onComplete: next })
        tl.fromTo(
          stripes,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.55,
            ease: 'power3.inOut',
            stagger: 0.09,
          }
        )
        if (logo) {
          tl.fromTo(
            logo,
            { autoAlpha: 0, yPercent: 30 },
            { autoAlpha: 1, yPercent: 0, duration: 0.35, ease: 'power2.out' },
            '-=0.15'
          )
        }
        return () => tl.kill()
      }}
      enter={(next) => {
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
            creative <i /> hub
          </span>
        </div>
      </div>
      {children}
    </TransitionRouter>
  )
}
