import styles from './MethodCards.module.css'

export type MethodItem = {
  n: string
  title: string
  text: string
}

/**
 * Metodo senza card: statement, poi quattro colonne nude — hairline in
 * testa, numerone, titolo, testo. L'etichetta di sezione la mette la
 * pagina (kicker "04 — metodo"): qui non va ripetuta.
 */
export function MethodCards({
  title,
  items,
}: {
  title: string
  items: MethodItem[]
}) {
  return (
    <div className={styles.wrap}>
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
