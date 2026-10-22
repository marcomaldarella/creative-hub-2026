'use client'

import { useEffect, useRef, useState } from 'react'
import { Arrow, useScrollerOverflow } from '@/components/ui'
import styles from './UniScreen.module.css'

export type UniSubnavItem = { id: string; label: string }

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
  /* la sfumatura al taglio destro compare solo se la fila sborda */
  const { attach: attachJump, el: jumpEl, overflow } =
    useScrollerOverflow<HTMLElement>()
  const activeRef = useRef(0)
  activeRef.current = active

  /* su mobile la fila delle voci scorre: la voce attiva si porta da
     sola al centro, altrimenti la spia vive fuori dallo schermo */
  useEffect(() => {
    const nav = jumpEl
    if (!nav || nav.scrollWidth <= nav.clientWidth) return
    const a = nav.children[active] as HTMLElement | undefined
    if (!a) return
    nav.scrollTo({
      left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [active, jumpEl])

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
        {/* fila di voci: grammatica condivisa degli scroller — scorre
            senza barra di sistema e sfuma al taglio destro */}
        <nav
          className={`scroller ${overflow ? 'scroller-fade-end' : ''} ${styles.jump}`}
          aria-label={course}
          ref={attachJump}
        >
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
            {/* stessa freccia di ogni controllo del sito: il componente
                Arrow (svg, mai unicode). Il verso lo dà `dir`, mai un
                flip in CSS: l'svg porta già un transform inline */}
            <button
              type="button"
              className={styles.step}
              onClick={() => jump(-1)}
              disabled={active === 0}
              aria-label={prevLabel}
            >
              <Arrow dir="w" />
            </button>
            <button
              type="button"
              className={styles.step}
              onClick={() => jump(1)}
              disabled={active === items.length - 1}
              aria-label={nextLabel}
            >
              <Arrow dir="e" />
            </button>
          </span>
        </span>
      </div>
    </div>
  )
}
