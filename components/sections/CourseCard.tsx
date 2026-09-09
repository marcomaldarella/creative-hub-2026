import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Thumb } from './Thumb'
import type { Locale } from '@/lib/i18n/config'
import type { Course } from '@/lib/sanity/types'
import { l } from '@/lib/sanity/l'
import styles from './CourseCard.module.css'

export type CourseCardProps = {
  course: Course
  locale: Locale
  href: string
  /** indice nella lista: pilota il colore del placeholder e il ritardo reveal */
  index: number
  /** aspect-ratio della cover (default 3:4 verticale) */
  ratio?: string
  /** senza riquadro: foto libera e caption sotto, niente corpo nero
   *  (usata dalla sezione "in evidenza") */
  flat?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Card corso verticale (cover 3:4 + categoria, titolo, sommario, meta).
 * Ri-asserisce i token scuri del testo: dentro le fasce nere le card
 * restano chiare col proprio testo nero.
 */
export function CourseCard({
  course,
  locale,
  href,
  index,
  ratio = '3 / 4',
  flat = false,
  className,
  style,
}: CourseCardProps) {
  const meta = [
    l(course.duration, locale),
    l(course.startDate, locale),
    l(course.mode, locale),
  ]
    .filter(Boolean)
    .map((s) => s?.toLowerCase())
    .join(' · ')

  return (
    <Link
      href={href}
      className={[styles.course, flat ? styles.courseFlat : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <Thumb image={course.coverImage} index={index} ratio={ratio} />
      <div className={styles.courseBody}>
        <span className={`mono ${styles.courseKicker}`}>
          {l(course.category?.title, locale)?.toLowerCase()}
        </span>
        <h3 className={styles.courseTitle}>{l(course.title, locale)}</h3>
        <p className={styles.courseSummary}>{l(course.summary, locale)}</p>
        {meta && <span className={`mono ${styles.courseMeta}`}>{meta}</span>}
      </div>
    </Link>
  )
}
