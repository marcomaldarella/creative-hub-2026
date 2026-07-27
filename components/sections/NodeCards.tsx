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
 * I nodi secondari, ridotti all'osso: eyebrow "n° 0X" + titolo in basso.
 * Testo e CTA nascosti (i campi restano nei dizionari), hover bianco.
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
            <span className={styles.n}>{card.n}</span>
          </div>
          <h3 className={styles.title}>{card.title}</h3>
        </Link>
      ))}
    </RevealGroup>
  )
}
