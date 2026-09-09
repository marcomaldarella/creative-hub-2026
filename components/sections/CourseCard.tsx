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
      className={[styles.course, className].filter(Boolean).join(' ')}
      style={style}
    >
      <Thumb image={course.coverImage} index={index} ratio="3 / 4" />
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
