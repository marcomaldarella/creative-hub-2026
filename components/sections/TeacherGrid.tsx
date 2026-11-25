import { RevealGroup } from '@/components/ui'
import { l } from '@/lib/sanity/l'
import type { Locale } from '@/lib/i18n/config'
import type { Teacher } from '@/lib/sanity/types'
import { Thumb } from './Thumb'
import styles from './TeacherGrid.module.css'

/* nome e, a capo, cognome: si spezza al primo spazio (i cognomi
   composti restano insieme sulla seconda riga) — come in TeacherStrip */
function nameLines(name?: string | null): [string] | [string, string] {
  const n = name ?? ''
  const i = n.indexOf(' ')
  return i === -1 ? [n] : [n.slice(0, i), n.slice(i + 1)]
}

export type TeacherGridProps = {
  /* basta la parte anagrafica: così la griglia serve anche lo staff
     (teamMember) di chi-siamo, non solo i docenti */
  teachers: Array<Pick<Teacher, '_id' | 'name' | 'role' | 'photo'>>
  locale: Locale
  className?: string
}

/**
 * Persone in griglia con la STESSA carta della fila docenti
 * (TeacherStrip): ritratto 4:5 a tutta colonna, nome su due righe,
 * ruolo mono. Placeholder gradient se la foto manca.
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
            ratio="4 / 5"
            width={480}
            className={styles.photo}
          />
          <span className={styles.name}>
            {nameLines(teacher.name).map((line, j) => (
              <span key={j} className={styles.nameLine}>
                {line}
              </span>
            ))}
          </span>
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
