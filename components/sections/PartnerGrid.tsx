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
  /** colonne della tabella da desktop (la home ne vuole 5) */
  columns?: 4 | 5
}) {
  return (
    <RevealGroup
      className={columns === 5 ? `${styles.grid} ${styles.grid5}` : styles.grid}
    >
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
