import styles from './MethodCards.module.css'

export type MethodItem = {
  n: string
  title: string
  text: string
}

/**
 * Metodo senza card: eyebrow + statement, poi quattro colonne nude —
 * hairline in testa, numerone, titolo, testo. Tutto su token semantici.
 */
export function MethodCards({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string
  title: string
  items: MethodItem[]
}) {
  return (
    <div className={styles.wrap}>
      <span className={`mono ${styles.eyebrow}`}>{eyebrow}</span>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {items.map((m) => (
          <div key={m.n} className={styles.item}>
            <span className={styles.num}>{m.n}</span>
            <h3 className={styles.itemTitle}>{m.title}</h3>
            <p className={styles.text}>{m.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
