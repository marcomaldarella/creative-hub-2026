'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { RevealGroup } from '@/components/ui'
import { Thumb } from './Thumb'
import type { SanityImage } from '@/lib/sanity/types'
import { matchesQuery } from '@/lib/search'
import styles from './UniScreen.module.css'
/* stessa pill-campo della ricerca di sezione: qui il filtro è locale
   (useState), non serve scrivere ?q= nell'URL */
import search from '@/components/ui/SearchBox.module.css'

export type UniCourseCard = {
  slug: string
  href: string
  title: string
  image?: SanityImage
  ciclo: 'primo' | 'master'
  area: string
  areaLabel: string
  tag: string
  desc: string
  instruments?: string[]
  meta: string[]
}

export type UniCoursesLabels = {
  pathLabel: string
  areaLabel: string
  all: string
  allAreas: string
  primo: string
  master: string
  areas: Record<string, string>
  countOne: string
  countMany: string
  cycles: Record<'primo' | 'master', string>
  goLabel: string
  search: string
}

/* freccia della card: SVG, mai unicode */
function GoArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

/**
 * Griglia corsi della landing universitari: card a foto piena con testo
 * sovrapposto (disposizione dal layout B del cliente), filtri a pillola
 * per percorso e area. La card con gli strumenti (Creative Musicianship)
 * è un div — dentro ha link veri — le altre sono interamente cliccabili.
 */
export function UniCourses({
  cards,
  labels,
}: {
  cards: UniCourseCard[]
  labels: UniCoursesLabels
}) {
  const [ciclo, setCiclo] = useState<'tutti' | 'primo' | 'master'>('tutti')
  const [area, setArea] = useState<string>('tutte')
  const [q, setQ] = useState('')

  const visible = (c: UniCourseCard) =>
    (ciclo === 'tutti' || c.ciclo === ciclo) &&
    (area === 'tutte' || c.area === area) &&
    matchesQuery(q, c.title, c.desc, c.areaLabel, c.tag, ...(c.instruments ?? []))

  const n = cards.filter(visible).length

  const pill = (on: boolean) =>
    on ? `${styles.pill} ${styles.pillOn}` : styles.pill

  const renderCard = (c: UniCourseCard, i: number) => {
    const body: ReactNode = (
      <>
        <figure className={styles.ph}>
          <Thumb image={c.image} index={i} fill alt={c.title} />
        </figure>
        <div className={styles.cardTop}>
          <span className={styles.area}>{c.areaLabel}</span>
          {c.tag && <span className={styles.tag}>{c.tag}</span>}
        </div>
        <h3 className={styles.cardTitle}>{c.title}</h3>
        <p className={styles.cardDesc}>{c.desc}</p>
        {c.instruments && (
          <div className={styles.instr}>
            {c.instruments.map((s) => (
              <Link key={s} href={c.href}>
                {s}
              </Link>
            ))}
          </div>
        )}
        <div className={styles.cardMeta}>
          {c.meta.map((m, k) => (k === 0 ? <b key={m}>{m}</b> : <span key={m}>{m}</span>))}
        </div>
      </>
    )

    const cls = `${styles.card} rv`
    const style = { '--rvd': `${(i % 3) * 60}ms` } as CSSProperties

    /* dentro la card-div la freccia è un link suo; sulla card-link è
       solo un segno, il click lo prende tutta la card */
    return c.instruments ? (
      <div key={c.slug} className={cls} style={style}>
        {body}
        <Link
          href={c.href}
          className={styles.go}
          aria-label={`${labels.goLabel} — ${c.title}`}
        >
          <span className={styles.goLabel}>{labels.goLabel}</span>
          <GoArrow />
        </Link>
      </div>
    ) : (
      <Link key={c.slug} href={c.href} className={cls} style={style}>
        {body}
        <span className={styles.go}>
          <span className={styles.goLabel}>{labels.goLabel}</span>
          <GoArrow />
        </span>
      </Link>
    )
  }

  const primoCards = cards.filter((c) => c.ciclo === 'primo')
  const masterCards = cards.filter((c) => c.ciclo === 'master')
  const showPrimo = primoCards.some(visible)
  const showMaster = masterCards.some(visible)

  return (
    <>
      <div className={styles.filters}>
        <span className={`mono ${styles.filterLab}`}>{labels.pathLabel}</span>
        <button type="button" className={pill(ciclo === 'tutti')} onClick={() => setCiclo('tutti')}>
          {labels.all}
        </button>
        <button type="button" className={pill(ciclo === 'primo')} onClick={() => setCiclo('primo')}>
          {labels.primo}
        </button>
        <button type="button" className={pill(ciclo === 'master')} onClick={() => setCiclo('master')}>
          {labels.master}
        </button>
        <span className={styles.filterSep} aria-hidden="true" />
        <span className={`mono ${styles.filterLab}`}>{labels.areaLabel}</span>
        <button type="button" className={pill(area === 'tutte')} onClick={() => setArea('tutte')}>
          {labels.allAreas}
        </button>
        {Object.entries(labels.areas).map(([slug, label]) => (
          <button
            key={slug}
            type="button"
            className={pill(area === slug)}
            onClick={() => setArea(slug === area ? 'tutte' : slug)}
          >
            {label}
          </button>
        ))}
        {/* il cerca chiude la riga dei filtri, prima del conteggio */}
        <span className={search.box}>
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.4 10.4 14 14" />
          </svg>
          <input
            type="search"
            value={q}
            placeholder={labels.search}
            aria-label={labels.search}
            className={search.input}
            onChange={(e) => setQ(e.target.value)}
          />
        </span>
        <span className={`mono ${styles.count}`}>
          {n} {n === 1 ? labels.countOne : labels.countMany}
        </span>
      </div>

      {/* le card filtrate si SMONTANO (niente display:none): al rientro
          si rimontano da zero e il reveal riparte — nascoste e basta
          restavano a opacity 0, mai ri-osservate */}
      <RevealGroup className={styles.grid}>
        {showPrimo && (
          <div className={`mono ${styles.cycle}`}>{labels.cycles.primo}</div>
        )}
        {primoCards.filter(visible).map((c, i) => renderCard(c, i))}
        {showMaster && (
          <div className={`mono ${styles.cycle}`}>{labels.cycles.master}</div>
        )}
        {masterCards
          .filter(visible)
          .map((c, i) => renderCard(c, primoCards.length + i))}
      </RevealGroup>
    </>
  )
}
