'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './ExploreField.module.css'

/**
 * Campo-marquee dell'offerta: TRE righe automatiche di card "jelly
 * glass" (ref infinite-jelly-glass.shader.se) — cover del corso sotto
 * un vetro bombato disegnato in CSS (riflessi, rim light, hairline),
 * meta mono negli angoli, titolo grande e sottotitolo al piede. Le
 * card sono TUTTE della stessa misura. Le righe scorrono da sole in
 * direzioni alterne a velocità vicine ma mai uguali; niente drag.
 * L'hover ferma dolcemente SOLO la riga sotto al mouse. Un solo rAF
 * time-based, fermo fuori viewport e con prefers-reduced-motion.
 */

export type ExploreCard = {
  label: string
  tag?: string
  meta?: string
  sub?: string
  href: string
  img: string
}

/* px/s per riga: vicine ma mai uguali, le righe non battono mai
   il tempo insieme */
const SPEEDS = [24, 18, 28]

export function ExploreField({ rows }: { rows: ExploreCard[][] }) {
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const rowEls = rowRefs.current.filter(Boolean) as HTMLDivElement[]
    const tracks = trackRefs.current.filter(Boolean) as HTMLDivElement[]
    if (tracks.length === 0) return

    let reduced = false
    try {
      reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {}
    if (reduced) return

    /* stato per riga: posizione, easing della pausa, mezzo nastro */
    const xs = tracks.map(() => 0)
    const eases = tracks.map(() => 1)
    const targets = tracks.map(() => 1)
    let halves = tracks.map((tr) => tr.scrollWidth / 2)
    const ro = new ResizeObserver(() => {
      halves = tracks.map((tr) => tr.scrollWidth / 2)
    })
    tracks.forEach((tr) => ro.observe(tr))

    let running = false
    let raf = 0
    let last = 0

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(48, now - last) / 1000
      last = now
      tracks.forEach((tr, i) => {
        eases[i] += (targets[i] - eases[i]) * 0.08
        const dir = i % 2 === 0 ? 1 : -1
        xs[i] += dir * SPEEDS[i % SPEEDS.length] * dt * eases[i]
        const w = halves[i]
        if (w > 0) xs[i] = ((xs[i] % w) + w) % w
        tr.style.transform = `translate3d(${-xs[i]}px,0,0)`
      })
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: '80px' }
    )
    io.observe(field)

    /* pausa PER RIGA: si ferma solo quella sotto al mouse */
    const unsub = rowEls.map((el, i) => {
      const enter = (e: PointerEvent) => {
        if (e.pointerType === 'mouse') targets[i] = 0
      }
      const leave = (e: PointerEvent) => {
        if (e.pointerType === 'mouse') targets[i] = 1
      }
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', leave)
      }
    })

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      unsub.forEach((fn) => fn())
    }
  }, [])

  const group = (items: ExploreCard[], hidden: boolean) => (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((card, i) => (
        <Link
          key={`${card.label}-${i}`}
          href={card.href}
          className={styles.card}
          draggable={false}
          tabIndex={hidden ? -1 : undefined}
        >
          {/* img puro come in Thumb: le cover arrivano dalla CDN
              Sanity, che non è tra i domini di next/image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.img}
            alt={hidden ? '' : card.label}
            width={680}
            height={480}
            loading="lazy"
            draggable={false}
            className={styles.cardImg}
          />
          {/* vetro: velo di lettura + riflessi, tutto nel CSS */}
          <span className={styles.glass} aria-hidden="true" />
          <span className={`mono ${styles.cardMeta}`}>
            <span>{card.tag}</span>
            {card.meta && <span>{card.meta}</span>}
          </span>
          <span className={styles.cardBody}>
            <span className={styles.cardTitle}>{card.label}</span>
            {card.sub && <span className={styles.cardSub}>{card.sub}</span>}
          </span>
        </Link>
      ))}
    </div>
  )

  return (
    <div className={styles.field} ref={fieldRef} onDragStart={(e) => e.preventDefault()}>
      {rows.map((items, r) => (
        <div
          key={r}
          className={styles.row}
          ref={(el) => {
            rowRefs.current[r] = el
          }}
        >
          <div
            className={styles.track}
            ref={(el) => {
              trackRefs.current[r] = el
            }}
          >
            {group(items, false)}
            {group(items, true)}
          </div>
        </div>
      ))}
    </div>
  )
}
