import { RevealGroup } from '@/components/ui'
import { l } from '@/lib/sanity/l'
import type { Locale } from '@/lib/i18n/config'
import type { Teacher } from '@/lib/sanity/types'
import { Thumb } from './Thumb'
import styles from './TeacherGrid.module.css'

export type TeacherGridProps = {
  teachers: Teacher[]
  locale: Locale
  className?: string
}

/**
 * Docenti/team in griglia: ritratto tondo (placeholder gradient se la foto
 * manca), nome e ruolo mono. Per la fila scorrevole c'è <TeacherStrip>.
 */
export function TeacherGrid({ teachers, locale, className }: TeacherGridProps) {
  if (teachers.length === 0) return null

  const cls = [styles.grid, className].filter(Boolean).join(' ')

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
