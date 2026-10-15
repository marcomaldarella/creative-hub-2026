'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './ExploreField.module.css'

/**
 * Campo-marquee dell'offerta formativa: righe infinite di titoli corso
 * (tre corpi tipografici) con foto intercalate, TUTTE della stessa
 * misura. Le righe scorrono da sole in direzioni alterne a velocità
 * diverse (mai sincronizzate), si fermano dolcemente al passaggio del
 * mouse e si trascinano col dito/puntatore — gesto orizzontale con
 * axis lock, come il carosello in home: se il gesto è verticale la
 * pagina continua a scrollare. Un solo rAF time-based per tutto il
 * campo, fermo quando la sezione è fuori viewport.
 */

export type ExploreWord = {
  kind: 'word'
  label: string
  tag?: string
  href: string
  size: 'xl' | 'l' | 'm'
}

export type ExplorePic = {
  kind: 'pic'
  src: string
  alt: string
  caption: string
}

export type ExploreItem = ExploreWord | ExplorePic

/* velocità base per riga (px/s) — vicine ma mai uguali, così le righe
   non battono mai il tempo insieme */
const SPEEDS = [22, 17, 26, 19]

export function ExploreField({
  rows,
  hint,
}: {
  rows: ExploreItem[][]
  hint: string
}) {
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])
  const movedRef = useRef(false)

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const tracks = trackRefs.current.filter(Boolean) as HTMLDivElement[]
    if (tracks.length === 0) return

    let reduced = false
    try {
      reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {}

    /* stato per riga: posizione e larghezza di mezzo nastro (il
       contenuto è doppio, il wrap avviene al 50%) */
    const xs = tracks.map(() => 0)
    let halves = tracks.map((tr) => tr.scrollWidth / 2)
    const ro = new ResizeObserver(() => {
      halves = tracks.map((tr) => tr.scrollWidth / 2)
    })
    tracks.forEach((tr) => ro.observe(tr))

    let ease = 1 // moltiplicatore dell'autoscroll (hover → 0)
    let easeTarget = reduced ? 0 : 1
    let running = false
    let raf = 0
    let last = 0

    /* drag */
    let dragging = false
    let axis: 'x' | 'y' | null = null
    let startX = 0
    let startY = 0
    let lastX = 0
    let lastT = 0
    let vel = 0 // px/ms, momentum al rilascio
    let pointerId = -1

    const wrap = (i: number) => {
      const w = halves[i]
      if (w > 0) xs[i] = ((xs[i] % w) + w) % w
    }

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(48, now - last) / 1000
      last = now
      ease += (easeTarget - ease) * 0.08
      const momentum = dragging ? 0 : vel
      if (!dragging) vel *= 0.94
      tracks.forEach((tr, i) => {
        const dir = i % 2 === 0 ? 1 : -1
        if (!dragging) xs[i] += dir * SPEEDS[i % SPEEDS.length] * dt * ease
        /* il momentum del drag spinge tutte le righe nello stesso verso,
           come il dito faceva un attimo prima */
        xs[i] -= momentum * dt * 1000
        wrap(i)
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

    /* hover desktop: l'autoscroll si spegne dolcemente, i link si
       cliccano da fermi */
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') easeTarget = 0
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !reduced) easeTarget = 1
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      dragging = true
      axis = e.pointerType === 'mouse' ? 'x' : null
      pointerId = e.pointerId
      startX = lastX = e.clientX
      startY = e.clientY
      lastT = performance.now()
      vel = 0
      movedRef.current = false
      if (axis === 'x') field.setPointerCapture(pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (axis === null) {
        /* axis lock: decide una volta sola; se il gesto è verticale
           molliamo tutto e lasciamo scrollare la pagina */
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        if (Math.abs(dy) > Math.abs(dx)) {
          dragging = false
          return
        }
        axis = 'x'
        field.setPointerCapture(pointerId)
      }
      const now = performance.now()
      const step = e.clientX - lastX
      if (Math.abs(e.clientX - startX) > 6) movedRef.current = true
      tracks.forEach((_, i) => {
        xs[i] -= step
        wrap(i)
      })
      vel = step / Math.max(1, now - lastT)
      lastX = e.clientX
      lastT = now
      field.classList.add(styles.dragging)
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      dragging = false
      axis = null
      field.classList.remove(styles.dragging)
      /* il flag moved cade al prossimo giro di event loop: il click
         subito dopo un drag viene soppresso, quello successivo no */
      setTimeout(() => {
        movedRef.current = false
      }, 0)
    }

    field.addEventListener('pointerenter', onEnter)
    field.addEventListener('pointerleave', onLeave)
    field.addEventListener('pointerdown', onDown)
    field.addEventListener('pointermove', onMove)
    field.addEventListener('pointerup', onUp)
    field.addEventListener('pointercancel', onUp)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      field.removeEventListener('pointerenter', onEnter)
      field.removeEventListener('pointerleave', onLeave)
      field.removeEventListener('pointerdown', onDown)
      field.removeEventListener('pointermove', onMove)
      field.removeEventListener('pointerup', onUp)
      field.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const group = (items: ExploreItem[], hidden: boolean) => (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((item, i) =>
        item.kind === 'word' ? (
          <Link
            key={`${item.label}-${i}`}
            href={item.href}
            className={`${styles.word} ${styles[item.size]}`}
            draggable={false}
            tabIndex={hidden ? -1 : undefined}
            onClickCapture={(e) => {
              if (movedRef.current) e.preventDefault()
            }}
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
              sizes="(max-width: 760px) 46vw, 300px"
            />
            <figcaption className={styles.picCap}>{item.caption}</figcaption>
          </figure>
        )
      )}
    </div>
  )

  return (
    <div className={styles.field} ref={fieldRef} onDragStart={(e) => e.preventDefault()}>
      {rows.map((items, r) => (
        <div key={r} className={styles.row}>
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
      <p className={`mono ${styles.hint}`}>
        <span className={styles.hintDot} aria-hidden="true">
          <svg viewBox="0 0 14 10" width="14" height="10">
            <path
              d="M4 1 1 5l3 4M10 1l3 4-3 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {hint}
      </p>
    </div>
  )
}
