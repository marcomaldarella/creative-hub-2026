'use client'

import { useEffect, useState } from 'react'
import { Arrow, ScrollerNav, useScrollerOverflow } from '@/components/ui'
import { LessonPrefill } from '@/components/sections/LessonForm'
import styles from './LessonTeachers.module.css'

/** un insegnante già risolto per il client: niente oggetti Sanity qui */
export type LessonTeacher = {
  id: string
  /** nome completo, come titolo della scheda */
  name: string
  /** nome corto per la pillola e per "Prova con…" (Paolo T., Paolo P.) */
  short: string
  role: string
  bio: string
  /** iniziali, quando non c'è né foto né video */
  initials: string
  /** foto già passata da urlFor: fa anche da poster del video */
  photo: string
  /** facoltativo: file .mp4 o link YouTube */
  video: string
}

export type LessonTeachersLabels = {
  prev: string
  next: string
  /** etichetta della fila di pillole per chi usa lo screen reader */
  group: string
  /** "{name}" viene sostituito col nome dell'insegnante */
  play: string
  /** "Prova con" */
  try: string
}

/** YouTube → embed nocookie, caricato SOLO al clic (mai in pagina prima) */
function youtubeEmbed(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  )
  return m
    ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`
    : null
}

/* il tasto play: cerchio + triangolo disegnati, mai un glifo */
function PlayMark() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.5 16.5 33 24l-13.5 7.5z" fill="currentColor" />
    </svg>
  )
}

/**
 * Il riquadro di sinistra: foto come poster, e col video un tasto play
 * disegnato. Il player (tag video o iframe YouTube) nasce al clic, mai
 * prima: la pagina non scarica niente finché non serve davvero.
 *
 * Senza foto e senza video resta un riquadro scuro con le iniziali —
 * nessuna scritta segnaposto.
 */
function TeacherMedia({
  teacher,
  label,
}: {
  teacher: LessonTeacher
  label: string
}) {
  const [playing, setPlaying] = useState(false)
  const embed = teacher.video ? youtubeEmbed(teacher.video) : null

  if (playing && teacher.video) {
    return (
      <div className={styles.media}>
        {embed ? (
          <iframe
            className={styles.player}
            src={embed}
            title={teacher.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className={styles.player}
            src={teacher.video}
            poster={teacher.photo || undefined}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        )}
      </div>
    )
  }

  const poster = teacher.photo ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={teacher.photo} alt={teacher.name} className={styles.photo} loading="lazy" />
  ) : (
    <span className={styles.initials} aria-hidden="true">
      {teacher.initials}
    </span>
  )

  if (!teacher.video) return <div className={styles.media}>{poster}</div>

  return (
    <button
      type="button"
      className={`${styles.media} ${styles.mediaBtn}`}
      aria-label={label}
      onClick={() => setPlaying(true)}
    >
      {poster}
      <span className={styles.play}>
        <PlayMark />
      </span>
    </button>
  )
}

/**
 * Gli insegnanti del corso, uno alla volta: le pillole coi nomi in alto
 * (quella attiva è piena), il contatore sul numero vero di insegnanti e
 * le due frecce tonde condivise di Scroller — mai frecce ridisegnate.
 *
 * La fila di pillole scorre di lato sul telefono con la grammatica
 * scroller del sito; cambiando scheda la pillola attiva rientra da sola
 * nella vista spostando il nastro, non la pagina.
 */
export function LessonTeachers({
  items,
  labels,
}: {
  items: LessonTeacher[]
  labels: LessonTeachersLabels
}) {
  const [i, setI] = useState(0)
  /* la fila di pillole è un nastro come gli altri: stessa utility
     globale .scroller e stessa sfumatura al taglio destro */
  const { attach, el: rail, overflow } = useScrollerOverflow<HTMLDivElement>()
  const current = items[i]

  /* la pillola attiva rientra nel nastro: si muove solo il nastro
     (scrollTo sul contenitore), mai lo scroll verticale del documento */
  useEffect(() => {
    if (!rail) return
    const pill = rail.querySelector<HTMLElement>(`[data-i="${i}"]`)
    if (!pill) return
    const left = pill.offsetLeft - (rail.clientWidth - pill.clientWidth) / 2
    rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [i, rail])

  if (!current) return null

  return (
    <div className={styles.slider}>
      <div className={styles.bar}>
        <div
          ref={attach}
          role="group"
          aria-label={labels.group}
          className={[
            'scroller',
            overflow ? 'scroller-fade-end' : '',
            styles.pills,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {items.map((tc, k) => (
            <button
              key={tc.id}
              type="button"
              data-i={k}
              className={k === i ? `${styles.pill} ${styles.pillOn}` : styles.pill}
              aria-current={k === i ? 'true' : undefined}
              onClick={() => setI(k)}
            >
              {tc.short}
            </button>
          ))}
        </div>
        {items.length > 1 && (
          <div className={styles.arrows}>
            <ScrollerNav
              dir="w"
              label={labels.prev}
              disabled={i === 0}
              onClick={() => setI((v) => Math.max(0, v - 1))}
            />
            <ScrollerNav
              dir="e"
              label={labels.next}
              disabled={i === items.length - 1}
              onClick={() => setI((v) => Math.min(items.length - 1, v + 1))}
            />
          </div>
        )}
      </div>

      {/* la chiave rimonta il pannello a ogni cambio: il player si
          richiude e la scheda entra con una sola dissolvenza */}
      <div key={current.id} className={styles.panel}>
        <TeacherMedia
          teacher={current}
          label={labels.play.replace('{name}', current.name)}
        />
        <div className={styles.info}>
          <span className={`mono ${styles.count}`}>
            {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <h3 className={styles.name}>{current.name}</h3>
          {current.role && <p className={styles.role}>{current.role}</p>}
          {current.bio && <p className={styles.bio}>{current.bio}</p>}
          <LessonPrefill teacher={current.name} className={styles.try}>
            {labels.try} {current.short} <Arrow size={11} />
          </LessonPrefill>
        </div>
      </div>
    </div>
  )
}
