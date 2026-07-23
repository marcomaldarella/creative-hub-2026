import styles from './MethodCards.module.css'

export type MethodItem = {
  n: string
  title: string
  text: string
}

/**
 * Metodo come griglia 2×2 di card alla Vercel: label mono in alto,
 * titolo+testo ancorati in basso. Tutto su token semantici: inverte
 * col tema da solo.
 */
export function MethodCards({ items }: { items: MethodItem[] }) {
  return (
    <div className={styles.grid}>
      {items.map((m) => (
        <article key={m.n} className={styles.card}>
          <span className={`mono ${styles.label}`}>I/{m.n}</span>
          <h3 className={styles.title}>{m.title}</h3>
          <p className={styles.text}>{m.text}</p>
        </article>
      ))}
    </div>
  )
}
