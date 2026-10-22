'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './UniScreen.module.css'

export type UniSubnavItem = { id: string; label: string }

/* freccia sempre SVG, mai unicode: la prev è la stessa flippata via CSS */
function StepArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  )
}

/**
 * Indice sticky della landing: UI portata pari pari dalla scheda corso
 * (barra azzurra, voci numerate, mirino sulla voce attiva, frecce di
 * salto). Scroll spy manuale come nello shell corso: niente observer,
 * la voce attiva è l'ULTIMA sezione il cui top ha superato il filo
 * inferiore della barra.
 */
export function UniSubnav({
  course,
  year,
  items,
  prevLabel,
  nextLabel,
  tone = 'accent',
}: {
  course: string
  year: string
  items: UniSubnavItem[]
  prevLabel: string
  nextLabel: string
  /* 'accent' = barra nel colore di sezione (landing universitari),
     'dark' = barra nera come nei mockup delle lezioni */
  tone?: 'accent' | 'dark'
}) {
  const [active, setActive] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)
  const jumpRef = useRef<HTMLElement>(null)
  const activeRef = useRef(0)
  activeRef.current = active

  /* su mobile la fila delle voci scorre: la voce attiva si porta da
     sola al centro, altrimenti la spia vive fuori dallo schermo */
  useEffect(() => {
    const nav = jumpRef.current
    if (!nav || nav.scrollWidth <= nav.clientWidth) return
    const a = nav.children[active] as HTMLElement | undefined
    if (!a) return
    nav.scrollTo({
      left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [active])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const bar = barRef.current
        if (!bar) return
        /* tolleranza ≥ (scroll-margin-top − altezza barra): le sezioni
           ancorate atterrano sotto il filo della barra e devono comunque
           accendere la propria voce — su mobile la barra è 54px, quindi
           il margine da coprire sale a 22px */
        const line = bar.getBoundingClientRect().bottom + 24
        let i = 0
        items.forEach((it, k) => {
          const sec = document.getElementById(it.id)
          if (sec && sec.getBoundingClientRect().top <= line) i = k
        })
        if (i !== activeRef.current) setActive(i)
      })
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [items])

  const jump = (dir: -1 | 1) => {
    const i = Math.min(items.length - 1, Math.max(0, activeRef.current + dir))
    document
      .getElementById(items[i].id)
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={
        tone === 'dark'
          ? `scheme-dark ${styles.subnav} ${styles.subnavDark}`
          : styles.subnav
      }
      ref={barRef}
    >
      <div className={`wrap ${styles.subnavIn}`}>
        <div className={styles.subnavCourse}>{course}</div>
        <nav className={styles.jump} aria-label={course} ref={jumpRef}>
          {items.map((it, k) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={k === active ? styles.on : undefined}
            >
              <span className={styles.idx}>
                {String(k + 1).padStart(2, '0')}.
              </span>
              <span>{it.label}</span>
            </a>
          ))}
        </nav>
        <span className={styles.tail}>
          <span className={styles.year}>{year}</span>
          <span className={styles.steps}>
            <button
              type="button"
              className={`${styles.step} ${styles.stepPrev}`}
              onClick={() => jump(-1)}
              disabled={active === 0}
              aria-label={prevLabel}
            >
              <StepArrow />
            </button>
            <button
              type="button"
              className={styles.step}
              onClick={() => jump(1)}
              disabled={active === items.length - 1}
              aria-label={nextLabel}
            >
              <StepArrow />
            </button>
          </span>
        </span>
      </div>
    </div>
  )
}
