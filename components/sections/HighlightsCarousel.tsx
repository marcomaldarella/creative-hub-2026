'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import academyImg from '@/public/img/sections/node-academy.jpg'
import studioImg from '@/public/img/sections/node-studio.jpg'
import spaziImg from '@/public/img/sections/node-spazi.jpg'
import styles from './HighlightsCarousel.module.css'

export type HighlightSlide = {
  kicker: string
  title: string
  text: string
  tags: string[]
  cta: string
}

export type HighlightsCarouselProps = {
  eyebrow: string
  slides: HighlightSlide[]
  /** [studio, coworking, corsi custom] */
  hrefs: string[]
}

/* media e accento di sezione per i tre hi-lights */
const LOOK = [
  { img: studioImg, accent: 'var(--arancio)' },
  { img: spaziImg, accent: 'var(--giallo-fluo)' },
  { img: academyImg, accent: 'var(--azzurro)' },
]

const AUTOPLAY_MS = 6500
const SWIPE_RATIO = 0.16

function ArrowIcon({ dir }: { dir: 1 | -1 }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={dir === -1 ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M4 12h15" />
      <path d="M13 5.5 19.5 12 13 18.5" />
    </svg>
  )
}

/**
 * Carosello hi-lights: slide principale al centro, le altre che sbucano
 * ai lati. Loop infinito con cloni agli estremi, drag/swipe, frecce,
 * tastiera. L'autoplay è guidato dalla barra progress stile storia:
 * la barra attiva si riempie in AUTOPLAY_MS e a fine animazione avanza
 * la slide — pausa su hover/drag, spento con prefers-reduced-motion
 * (l'animazione CSS non parte, quindi non avanza).
 */
export function HighlightsCarousel({
  eyebrow,
  slides,
  hrefs,
}: HighlightsCarouselProps) {
  const n = slides.length
  // extended: [ultima, ...slides, prima] — pos parte da 1
  const ext = [slides[n - 1], ...slides, slides[0]]
  const [pos, setPos] = useState(1)
  const [anim, setAnim] = useState(true)
  const [drag, setDrag] = useState(0)
  const [paused, setPaused] = useState(false)
  const dragging = useRef(false)
  const moved = useRef(false)
  const startX = useRef(0)
  const viewportRef = useRef<HTMLDivElement>(null)

  const real = ((pos - 1) % n + n) % n // indice logico 0..n-1

  const go = useCallback((to: number) => {
    setAnim(true)
    setPos(to)
  }, [])

  /* avanti/indietro con clamp sui cloni: mai fuori da [0, n+1] */
  const step = useCallback(
    (dir: 1 | -1) => {
      setAnim(true)
      setPos((p) => Math.max(0, Math.min(n + 1, p + dir)))
    },
    [n],
  )

  /* rientro dai cloni: snap senza transizione */
  const onEnd = () => {
    if (pos === 0) {
      setAnim(false)
      setPos(n)
    } else if (pos === n + 1) {
      setAnim(false)
      setPos(1)
    }
  }

  /* pausa autoplay su hover (solo mouse: su touch enter/leave non è affidabile) */
  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setPaused(true)
  }
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setPaused(false)
  }

  /* drag / swipe */
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragging.current = true
    moved.current = false
    startX.current = e.clientX
    setPaused(true)
    viewportRef.current?.setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 8) moved.current = true
    setDrag(dx)
  }
  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    const w = viewportRef.current?.clientWidth ?? 1200
    const dx = drag
    setDrag(0)
    if (dx < -w * SWIPE_RATIO) step(1)
    else if (dx > w * SWIPE_RATIO) step(-1)
    else setAnim(true)
    setPaused(false)
  }

  /* un drag non deve navigare il link */
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault()
      e.stopPropagation()
      moved.current = false
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  return (
    <section
      className={paused ? `${styles.sez} ${styles.paused}` : styles.sez}
      aria-roledescription="carousel"
      aria-label={eyebrow}
      onKeyDown={onKey}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div className={`wrap ${styles.head}`}>
        <span className={`mono ${styles.eyebrow}`}>{eyebrow}</span>
        <div className={styles.controls}>
          <span className={`mono ${styles.counter}`}>
            0{real + 1} <em>/ 0{n}</em>
          </span>
          <button
            type="button"
            className={styles.arrow}
            aria-label="precedente"
            onClick={() => step(-1)}
          >
            <ArrowIcon dir={-1} />
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label="successiva"
            onClick={() => step(1)}
          >
            <ArrowIcon dir={1} />
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className={dragging.current ? `${styles.viewport} ${styles.grabbing}` : styles.viewport}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClickCapture}
        /* il drag nativo di link/immagini ucciderebbe i pointer event */
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className={anim && drag === 0 ? `${styles.track} ${styles.animate}` : styles.track}
          style={
            {
              '--pos': pos,
              '--drag': `${drag}px`,
            } as React.CSSProperties
          }
          onTransitionEnd={onEnd}
        >
          {ext.map((slide, i) => {
            const logical = ((i - 1) % n + n) % n
            const { img, accent } = LOOK[logical]
            const active = i === pos
            const clone = i === 0 || i === n + 1
            return (
              <Link
                key={`${logical}-${i}`}
                href={hrefs[logical]}
                className={active ? `${styles.slide} ${styles.slideOn}` : styles.slide}
                style={
                  {
                    '--accent': accent,
                    '--par': `${(i - pos) * -5}%`,
                  } as React.CSSProperties
                }
                aria-hidden={clone || !active}
                tabIndex={active ? 0 : -1}
                draggable={false}
                onClick={(e) => {
                  if (!active) {
                    e.preventDefault()
                    go(i)
                  }
                }}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="(max-width: 860px) 88vw, 64vw"
                  className={styles.img}
                  placeholder="blur"
                  draggable={false}
                />
                <div className={styles.shade} />
                <div className={styles.body}>
                  <span className={`mono ${styles.kicker}`}>{slide.kicker}</span>
                  <h3 className={`display-black ${styles.title}`}>{slide.title}</h3>
                  <p className={styles.text}>{slide.text}</p>
                  <div className={styles.foot}>
                    {slide.tags.map((tag) => (
                      <span key={tag} className={`mono ${styles.tag}`}>
                        {tag}
                      </span>
                    ))}
                    <span className={styles.cta}>
                      {slide.cta} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* progress stile storia: la barra attiva si riempie e detta il tempo */}
      <div className={`wrap ${styles.bars}`}>
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={s.kicker}
            className={i === real ? `${styles.bar} ${styles.barOn}` : styles.bar}
            style={{ '--accent': LOOK[i].accent } as React.CSSProperties}
            onClick={() => go(i + 1)}
          >
            {i === real ? (
              <span
                className={styles.barLive}
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                onAnimationEnd={() => step(1)}
              />
            ) : i < real ? (
              <span className={styles.barDone} />
            ) : null}
          </button>
        ))}
      </div>
    </section>
  )
}
