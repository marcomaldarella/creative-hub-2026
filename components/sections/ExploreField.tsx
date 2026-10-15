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
 * direzioni alterne a velocità vicine ma mai uguali. L'hover ferma
 * dolcemente SOLO la riga sotto al mouse, e ogni riga si trascina
 * 1:1 col puntatore (momentum al rilascio, axis lock su touch così
 * lo scroll verticale della pagina resta libero). Un solo rAF
 * time-based, fermo fuori viewport e con prefers-reduced-motion.
 * Su mobile il CSS mostra solo le prime due righe.
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
const SPEEDS = [36, 28, 42]
/* alternanza non banale: le prime due vanno insieme, la terza contro */
const DIRS = [1, 1, -1]
/* ogni tot una SPINTA con curva a campana (ease-in/out): periodi e
   attacchi diversi per riga, così i surge non battono mai insieme */
const BOOST_PERIODS = [7000, 9500, 8200]
const BOOST_OFFSETS = [1800, 4200, 6400]
const BOOST_DUR = 1600
const BOOST_AMP = 2.2

export function ExploreField({ rows }: { rows: ExploreCard[][] }) {
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])
  /* true subito dopo un drag: il click sul link va soppresso */
  const movedRef = useRef(false)

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

    /* stato per riga: posizione, easing della pausa, mezzo nastro,
       velocità residua del drag (momentum) */
    const xs = tracks.map(() => 0)
    const eases = tracks.map(() => 1)
    const targets = tracks.map(() => 1)
    const vels = tracks.map(() => 0)
    const boostAt = tracks.map(
      (_, i) => performance.now() + BOOST_OFFSETS[i % BOOST_OFFSETS.length]
    )
    const boostStart = tracks.map(() => -1)
    let halves = tracks.map((tr) => tr.scrollWidth / 2)
    const ro = new ResizeObserver(() => {
      halves = tracks.map((tr) => tr.scrollWidth / 2)
    })
    tracks.forEach((tr) => ro.observe(tr))

    let running = false
    let raf = 0
    let last = 0

    /* drag per riga: 1:1 col puntatore, axis lock su touch */
    let dragRow = -1
    let axis: 'x' | 'y' | null = null
    let pointerId = -1
    let startX = 0
    let startY = 0
    let lastX = 0
    let lastT = 0

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(48, now - last) / 1000
      last = now
      tracks.forEach((tr, i) => {
        eases[i] += (targets[i] - eases[i]) * 0.08
        const dir = DIRS[i % DIRS.length]
        /* spinta periodica: campana coseno (parte e muore morbida) */
        if (now >= boostAt[i]) {
          boostStart[i] = now
          boostAt[i] = now + BOOST_PERIODS[i % BOOST_PERIODS.length]
        }
        let boost = 1
        if (boostStart[i] >= 0) {
          const p = (now - boostStart[i]) / BOOST_DUR
          if (p < 1) boost = 1 + (BOOST_AMP * (1 - Math.cos(2 * Math.PI * p))) / 2
          else boostStart[i] = -1
        }
        if (dragRow !== i) {
          xs[i] += dir * SPEEDS[i % SPEEDS.length] * dt * eases[i] * boost
          /* momentum del drag: scivola e si spegne */
          xs[i] -= vels[i] * dt * 1000
          vels[i] *= 0.94
        }
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

    /* pausa PER RIGA (hover) + drag della singola riga */
    const unsub = rowEls.map((el, i) => {
      const enter = (e: PointerEvent) => {
        if (e.pointerType === 'mouse') targets[i] = 0
      }
      const leave = (e: PointerEvent) => {
        if (e.pointerType === 'mouse') targets[i] = 1
      }
      const down = (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        dragRow = i
        /* col mouse l'asse è subito orizzontale; su touch si decide
           al primo movimento (axis lock: il verticale resta scroll) */
        axis = e.pointerType === 'mouse' ? 'x' : null
        pointerId = e.pointerId
        startX = lastX = e.clientX
        startY = e.clientY
        lastT = performance.now()
        vels[i] = 0
        movedRef.current = false
        if (axis === 'x') el.setPointerCapture(pointerId)
      }
      const move = (e: PointerEvent) => {
        if (dragRow !== i || e.pointerId !== pointerId) return
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (axis === null) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
          if (Math.abs(dy) > Math.abs(dx)) {
            dragRow = -1
            return
          }
          axis = 'x'
          el.setPointerCapture(pointerId)
        }
        const now = performance.now()
        const step = e.clientX - lastX
        if (Math.abs(dx) > 6) movedRef.current = true
        xs[i] -= step
        vels[i] = step / Math.max(1, now - lastT)
        lastX = e.clientX
        lastT = now
        el.classList.add(styles.dragging)
      }
      const up = (e: PointerEvent) => {
        if (dragRow !== i || e.pointerId !== pointerId) return
        dragRow = -1
        axis = null
        el.classList.remove(styles.dragging)
        /* il flag moved cade al giro dopo: il click post-drag è
           soppresso, quello successivo no */
        setTimeout(() => {
          movedRef.current = false
        }, 0)
      }
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
      return () => {
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', leave)
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', up)
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
          onClickCapture={(e) => {
            if (movedRef.current) e.preventDefault()
          }}
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
