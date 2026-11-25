import { PartnerMark, RevealGroup } from '@/components/ui'
import styles from './PartnerGrid.module.css'

/**
 * I partner come tabella di quadrati: un logo per cella, hairline
 * condivise fra le celle (niente doppio bordo) e schiarita in hover.
 */
export function PartnerGrid({
  names,
  columns = 4,
}: {
  names: string[]
  /** colonne della tabella da desktop (la home ne vuole 6, celle 4:3) */
  columns?: 4 | 5 | 6
}) {
  const variant =
    columns === 6 ? ` ${styles.grid6}` : columns === 5 ? ` ${styles.grid5}` : ''
  return (
    <RevealGroup className={`${styles.grid}${variant}`}>
      {names.map((name, i) => (
        <div
          key={name}
          className={`rv ${styles.cell}`}
          style={{ transitionDelay: `${Math.min(i, 11) * 45}ms` }}
        >
          <PartnerMark name={name} />
        </div>
      ))}
    </RevealGroup>
  )
}
