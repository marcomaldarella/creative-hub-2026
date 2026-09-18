'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FluidTrail } from './FluidTrail'
import styles from './HeroSlider.module.css'

/* rgb (0-1) dei colori di sezione per l'inchiostro della scia fluida —
   stesse terne vivide di HeroWords, chiave = token passato in accent */
const ACCENT_RGB: Record<string, [number, number, number]> = {
  'var(--azzurro-ink)': [0.443, 0.722, 1.0], // academy #71B8FF
  'var(--arancio)': [1.0, 0.43, 0.07], // studio #FF6E12
  'var(--giallo-fluo)': [0.87, 1.0, 0.23], // coworking #DFFF3A
}

export type HeroSlide = {
  title: string
  text: string
  href: string
  video: string
  /* colore del nodo (stessi token del bento): tinge voce attiva e glow */
  accent: string
}

/**
 * Hero a tre voci sul modello Indaco: titoli giganti piani che si
 * accendono col colore del nodo, video di sfondo in crossfade. Il rullo
 * è uno scroll infinito: le voci sono triplicate e lo scrollLeft viene
 * teletrasportato di un set (misura identica, salto invisibile) quando
 * ci si avvicina agli estremi; a riposo la voce agganciata si posiziona
 * sempre a sinistra, dove sta Academy in partenza. Desktop: drag col
 * mouse + snap con ease-in-out; mobile: swipe nativo con scroll-snap.
 * La pagina sotto scorre normalmente: nessun hijack della rotella.
 */
export function HeroSlider({
  slides,
  annot,
  caption,
  cta,
}: {
  slides: HeroSlide[]
  /* le due annotazioni della hero: [sinistra, destra] — college e coordinate */
  annot?: [string, string]
  /* blocco tagline + caption ancorato a destra, sempre visibile */
  caption?: { tagline: string; text: string; sub: string }
  /* tasto "scopri l'hub", affiancato alla paginazione */
  cta?: { label: string; href: string }
}) {
  const [active, setActive] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const trackRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  /* nav bucata solo sull'hero: finché la sezione sta sotto la barra,
     html porta data-nav-clear e la nav perde lo sfondo (Nav.module) */
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const nav = document.querySelector(
      'body > .scheme-dark > header, body > header',
    )
    const navH = nav ? Math.round(nav.getBoundingClientRect().height) : 64
    const io = new IntersectionObserver(
      ([e]) =>
        document.documentElement.toggleAttribute(
          'data-nav-clear',
          e.isIntersecting,
        ),
      { rootMargin: `-${navH}px 0px 0px 0px` },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      document.documentElement.removeAttribute('data-nav-clear')
    }
  }, [])
  const N = slides.length
  const settleT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const anim = useRef<number | null>(null)
  const drag = useRef<{
    x: number
    lastX: number
    t0: number
    left: number
    moved: boolean
  } | null>(null)

  /* rullo triplicato: [cloni][voci reali][cloni] — il set centrale è
     quello "vero" per la tastiera e gli screen reader */
  const roll = [0, 1, 2].flatMap((set) =>
    slides.map((s, i) => ({ ...s, real: i, clone: set !== 1 })),
  )

  /* larghezza di un set: distanza tra la prima voce di due set adiacenti */
  const setWidth = (el: HTMLElement) => {
    const kids = el.children
    return (
      (kids[N] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft
    )
  }

  const padLeft = (el: HTMLElement) =>
    parseFloat(getComputedStyle(el).paddingLeft) || 0

  /* gira solo la clip attiva: le altre restano in pausa */
  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active && !reduced) v.play().catch(() => {})
      else v.pause()
    })
  }, [active])

  /* si parte con l'Academy del set centrale agganciata a sinistra */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const mid = el.children[N] as HTMLElement
    el.scrollTo({ left: mid.offsetLeft - padLeft(el), behavior: 'instant' })
  }, [N])

  /* teletrasporto del loop: scrollLeft riportato nell'intorno del set
     centrale; durante il drag si compensa anche il punto di presa */
  const normalize = (el: HTMLElement) => {
    if (anim.current) return
    const sw = setWidth(el)
    if (!sw) return
    if (el.scrollLeft < sw * 0.5) {
      el.scrollLeft += sw
      if (drag.current) drag.current.left += sw
    } else if (el.scrollLeft >= sw * 1.5) {
      el.scrollLeft -= sw
      if (drag.current) drag.current.left -= sw
    }
  }

  /* glide ease-in-out del rullo (rAF: serve la curva simmetrica) */
  const glide = (el: HTMLElement, to: number) => {
    if (anim.current) cancelAnimationFrame(anim.current)
    const from = el.scrollLeft
    const d = to - from
    if (Math.abs(d) < 2) return
    const t0 = performance.now()
    const DUR = 800 /* stessa speed dello swiper Indaco */
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / DUR)
      el.scrollLeft = from + d * ease(p)
      if (p < 1) anim.current = requestAnimationFrame(step)
      else {
        anim.current = null
        normalize(el)
      }
    }
    anim.current = requestAnimationFrame(step)
  }

  /* dock di ogni slide: offsetLeft meno il padding del binario, clampato
     alla corsa utile — è il punto dove sta Academy a riposo */
  const docks = (el: HTMLElement) => {
    const max = el.scrollWidth - el.clientWidth
    return (Array.from(el.children) as HTMLElement[]).map((k) =>
      Math.min(max, Math.max(0, k.offsetLeft - padLeft(el))),
    )
  }

  const nearestIndex = (el: HTMLElement, x: number) => {
    let best = 0
    let bestDist = Infinity
    docks(el).forEach((d, i) => {
      const dist = Math.abs(d - x)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    return best
  }

  /* aggancio alla voce con dock più vicino (equivale al longSwipe di
     swiper: oltre metà corsa si avanza, altrimenti si torna) */
  const snapToNearest = () => {
    const el = trackRef.current
    if (!el || drag.current) return
    const best = nearestIndex(el, el.scrollLeft)
    setActive(best % N)
    glide(el, docks(el)[best])
  }

  /* aggancio a un indice preciso (per i flick) */
  const snapToIndex = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(3 * N - 1, i))
    setActive(clamped % N)
    glide(el, docks(el)[clamped])
  }

  /* l'indice segue lo scroll; il loop viene rinormalizzato a riposo su
     mobile (mai a metà del momentum: iOS lo ucciderebbe), subito altrove */
  const onScroll = () => {
    const el = trackRef.current
    if (!el) return
    clearTimeout(settleT.current)
    if (window.matchMedia('(max-width: 760px)').matches) {
      /* passo reale tra slide (non è il viewport: le slide sono all'86%
         per lasciar spuntare la voce successiva) */
      const step =
        (el.children[1] as HTMLElement).offsetLeft -
        (el.children[0] as HTMLElement).offsetLeft
      if (!step) return
      const real = ((Math.round(el.scrollLeft / step) % N) + N) % N
      if (real !== active) setActive(real)
      settleT.current = setTimeout(() => normalize(el), 120)
      return
    }
    normalize(el)
    /* a scroll fermo (trackpad o fine drag) il rullo si aggancia */
    settleT.current = setTimeout(snapToNearest, 160)
  }

  /* drag-to-scroll col mouse; moved sopravvive fino al click successivo:
     un drag non deve navigare il link su cui finisce */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = trackRef.current
    if (!el) return
    if (anim.current) cancelAnimationFrame(anim.current)
    anim.current = null
    drag.current = {
      x: e.clientX,
      lastX: e.clientX,
      t0: performance.now(),
      left: el.scrollLeft,
      moved: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    const el = trackRef.current
    if (!d || !el) return
    d.lastX = e.clientX
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true
      el.setPointerCapture(e.pointerId)
    }
    if (d.moved) el.scrollLeft = d.left - dx
  }

  const onPointerUp = () => {
    const d = drag.current
    if (!d?.moved) {
      drag.current = null
      return
    }
    /* short swipe alla Swiper: un flick sotto i 300ms avanza di una voce
       nella direzione del gesto, anche se la corsa è breve */
    const dt = performance.now() - d.t0
    const dx = d.lastX - d.x
    const flick = dt < 300 && Math.abs(dx) > 30
    setTimeout(() => {
      drag.current = null
      const el = trackRef.current
      if (!el) return
      if (flick) snapToIndex(nearestIndex(el, d.left) + (dx < 0 ? 1 : -1))
      else snapToNearest()
    }, 0)
  }

  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  /* ————— cursore dello slider (solo desktop): disco-freccia che segue
     il mouse e indica avanti/indietro secondo la metà dello schermo;
     il click su area vuota volta di una voce ————— */
  const cursorRef = useRef<HTMLDivElement>(null)
  const cur = useRef({ x: 0, y: 0, tx: 0, ty: 0, on: false, raf: 0 })

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches)
      return
    const loop = () => {
      const c = cur.current
      const el = cursorRef.current
      if (el) {
        c.x += (c.tx - c.x) * 0.22
        c.y += (c.ty - c.y) * 0.22
        el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%)`
        el.style.opacity = c.on ? '1' : '0'
      }
      c.raf = requestAnimationFrame(loop)
    }
    cur.current.raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(cur.current.raf)
  }, [])

  const onHeroPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const host = heroRef.current
    const el = cursorRef.current
    if (!host || !el) return
    const r = host.getBoundingClientRect()
    const c = cur.current
    c.tx = e.clientX - r.left
    c.ty = e.clientY - r.top
    if (!c.on) {
      /* appare sul posto, senza volare dal punto vecchio */
      c.x = c.tx
      c.y = c.ty
    }
    c.on = true
    /* sopra voci/link/tasti il disco resta e mostra il punto centrale
       (= cliccabile); altrove mostra la freccia avanti/indietro */
    el.dataset.mode = (e.target as HTMLElement).closest('a, button')
      ? 'link'
      : 'nav'
    el.dataset.dir = e.clientX > window.innerWidth / 2 ? 'next' : 'prev'
  }

  const onHeroPointerLeave = () => {
    cur.current.on = false
  }

  const onHeroClick = (e: React.MouseEvent) => {
    /* il click-per-voltare è del cursore-disco desktop: su touch il tap
       accende la scia fluida e NON deve muovere lo slider (il glide rAF
       litigherebbe anche con lo scroll nativo di uno swipe successivo) */
    const pt = (e.nativeEvent as PointerEvent).pointerType
    if (pt === 'touch' || pt === 'pen') return
    if (
      pt === undefined &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    )
      return
    if ((e.target as HTMLElement).closest('a, button')) return
    const el = trackRef.current
    if (!el) return
    const dir = e.clientX > window.innerWidth / 2 ? 1 : -1
    snapToIndex(nearestIndex(el, el.scrollLeft) + dir)
  }

  return (
    <section
      ref={heroRef}
      className={`${styles.hero} scheme-dark`}
      onPointerMove={onHeroPointerMove}
      onPointerLeave={onHeroPointerLeave}
      onClick={onHeroClick}
    >
      <div className={styles.bg} aria-hidden="true">
        {slides.map((s, i) => (
          <video
            key={s.video}
            ref={(el) => {
              videoRefs.current[i] = el
            }}
            className={i === active ? styles.videoOn : styles.video}
            src={s.video}
            muted
            loop
            playsInline
            autoPlay={i === 0}
            preload={i === 0 ? 'auto' : 'metadata'}
          />
        ))}
        <div className={styles.veil} />
      </div>

      {/* scia fluida sopra a tutto, in difference: interagisce con video
          e titoli; l'inchiostro segue il colore della voce attiva */}
      <FluidTrail
        className={styles.fluid}
        color={ACCENT_RGB[slides[active]?.accent] ?? [1, 1, 1]}
      />

      {annot && (
        <div className={styles.annot}>
          <span className="mono">{annot[0]}</span>
          <span className="mono">{annot[1]}</span>
        </div>
      )}

      <div
        className={styles.track}
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {roll.map((s, idx) => (
          <div
            key={`${s.real}-${idx}`}
            className={styles.slide}
            aria-hidden={s.clone || undefined}
            /* --wcol: colore di sezione (trattino); --i: indice reale,
               detta lo stagger dell'animazione di ingresso */
            style={
              { '--wcol': s.accent, '--i': s.real } as React.CSSProperties
            }
          >
            <Link
              href={s.href}
              tabIndex={s.clone ? -1 : undefined}
              draggable={false}
              className={`display-black ${styles.title} ${
                s.real === active ? styles.on : ''
              }`}
              aria-current={s.real === active && !s.clone ? 'true' : undefined}
              onMouseEnter={() => setActive(s.real)}
              onFocus={() => setActive(s.real)}
            >
              <span className={`mono ${styles.num}`} aria-hidden="true">
                0{s.real + 1}
              </span>
              {s.title}
            </Link>
            {/* su mobile il sottotitolo vive sotto la voce e viaggia con
                la slide; su desktop resta il blocco .sub in basso */}
            <span
              className={styles.slideSub}
              aria-hidden={s.clone || undefined}
            >
              {s.text}
            </span>
          </div>
        ))}
      </div>

      <div
        className={styles.sub}
        style={{ '--wcol': slides[active]?.accent } as React.CSSProperties}
      >
        {slides.map((s, i) => (
          <p
            key={s.title}
            className={i === active ? styles.subOn : styles.subOff}
          >
            {s.text}
          </p>
        ))}
      </div>

      {caption && (
        <div className={styles.captionBox}>
          <span className={`mono ${styles.tagline}`}>{caption.tagline}</span>
          <p className={styles.captionText}>
            {caption.text}
            <span className={styles.captionSub}>{caption.sub}</span>
          </p>
        </div>
      )}

      {/* cursore dello slider: disco-freccia, direzione da metà schermo */}
      <div
        ref={cursorRef}
        className={styles.cursor}
        data-dir="next"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12h15" />
          <path d="M13 5.5 19.5 12 13 18.5" />
        </svg>
      </div>

      <div className={styles.pagRow}>
        <div className={`mono ${styles.pag}`}>
          <span>0{active + 1}</span>
          <span className={styles.pagLine} aria-hidden="true" />
          <span className={styles.pagDim}>0{slides.length}</span>
        </div>
        {cta && (
          <a href={cta.href} className={styles.cta}>
            {cta.label}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12h15" />
              <path d="M13 5.5 19.5 12 13 18.5" />
            </svg>
          </a>
        )}
      </div>
    </section>
  )
}
