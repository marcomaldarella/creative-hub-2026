'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './ExploreField.module.css'

/**
 * Campo-marquee dell'offerta: righe di titoli corso — tutti dello
 * stesso corpo — con le foto della sede intercalate, tutte della
 * stessa misura. Le righe scorrono DA SOLE in direzioni alterne a
 * velocità vicine ma mai uguali (mai sincronizzate); niente drag.
 * L'hover ferma dolcemente SOLO la riga sotto al mouse, così i titoli
 * si cliccano da fermi mentre le altre righe continuano a girare.
 * Un solo rAF time-based per tutto il campo, fermo fuori viewport e
 * con prefers-reduced-motion.
 */

export type ExploreWord = {
  kind: 'word'
  label: string
  tag?: string
  href: string
}

export type ExplorePic = {
  kind: 'pic'
  src: string
  alt: string
  caption: string
}

export type ExploreItem = ExploreWord | ExplorePic

/* px/s per riga: vicine ma mai uguali, le righe non battono mai
   il tempo insieme */
const SPEEDS = [24, 18, 28, 21]

export function ExploreField({ rows }: { rows: ExploreItem[][] }) {
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

  const group = (items: ExploreItem[], hidden: boolean) => (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((item, i) =>
        item.kind === 'word' ? (
          <Link
            key={`${item.label}-${i}`}
            href={item.href}
            className={styles.word}
            draggable={false}
            tabIndex={hidden ? -1 : undefined}
          >
            <span className={styles.wordLabel}>{item.label}</span>
            {item.tag && <small className={styles.tag}>{item.tag}</small>}
          </Link>
        ) : (
          <figure key={`pic-${i}`} className={styles.pic}>
            <Image
              src={item.src}
              alt={hidden ? '' : item.alt}
              width={320}
              height={240}
              draggable={false}
              className={styles.picImg}
              sizes="(max-width: 760px) 46vw, 280px"
            />
            <figcaption className={styles.picCap}>{item.caption}</figcaption>
          </figure>
        )
      )}
    </div>
  )

  return (
    <div
      className={styles.field}
      ref={fieldRef}
      onDragStart={(e) => e.preventDefault()}
    >
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
