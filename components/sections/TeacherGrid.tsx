import { RevealGroup } from '@/components/ui'
import { l } from '@/lib/sanity/l'
import type { Locale } from '@/lib/i18n/config'
import type { Teacher } from '@/lib/sanity/types'
import { Thumb } from './Thumb'
import styles from './TeacherGrid.module.css'

export type TeacherGridProps = {
  teachers: Teacher[]
  locale: Locale
  /** strip: fila compatta scrollabile · grid: griglia completa */
  variant?: 'strip' | 'grid'
  className?: string
}

/**
 * Docenti/team: ritratto tondo (placeholder gradient se la foto manca),
 * nome e ruolo mono. Usato in academy (strip) e chi-siamo (grid).
 */
export function TeacherGrid({
  teachers,
  locale,
  variant = 'grid',
  className,
}: TeacherGridProps) {
  if (teachers.length === 0) return null

  const cls = [
    variant === 'strip' ? styles.strip : styles.grid,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <RevealGroup as="ul" className={cls}>
      {teachers.map((teacher, i) => (
        <li
          key={teacher._id}
          className={`rv ${styles.person}`}
          style={{ transitionDelay: `${(i % 6) * 50}ms` }}
        >
          <Thumb
            image={teacher.photo}
            alt={teacher.name ?? ''}
            index={i}
            round
            width={320}
            className={styles.photo}
          />
          <span className={styles.name}>{teacher.name}</span>
          {l(teacher.role, locale) && (
            <span className={`mono ${styles.role}`}>
              {l(teacher.role, locale)}
            </span>
          )}
        </li>
      ))}
    </RevealGroup>
  )
}
