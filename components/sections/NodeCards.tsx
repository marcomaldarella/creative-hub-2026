import Link from 'next/link'
import { RevealGroup } from '@/components/ui'
import styles from './NodeCards.module.css'

export type NodeCard = {
  n: string
  tags: string
  title: string
  text: string
  cta: string
}

export type NodeCardsProps = {
  cards: NodeCard[]
  hrefs: string[]
  className?: string
}

/**
 * I nodi secondari come da reference: eyebrow "N° 0X" + tag a destra,
 * titolo FreeFat gigante in basso, testo e "Entra nel nodo →".
 * Colonne separate da hairline, fondo trasparente.
 */
export function NodeCards({ cards, hrefs, className }: NodeCardsProps) {
  return (
    <RevealGroup
      className={className ? `${styles.row} ${className}` : styles.row}
    >
      {cards.map((card, i) => (
        <Link
          key={card.n}
          href={hrefs[i]}
          className={`rv ${styles.card}`}
          style={{ transitionDelay: `${i * 90}ms` }}
        >
          <div className={`mono ${styles.head}`}>
            <span className={styles.n}>n° {card.n}</span>
            <span className={styles.tags}>{card.tags}</span>
          </div>
          <h3 className={styles.title}>{card.title}</h3>
          <p className={styles.text}>{card.text}</p>
          <span className={styles.cta}>
            {card.cta} <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
    </RevealGroup>
  )
}
