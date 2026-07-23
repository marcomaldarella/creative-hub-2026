import styles from './MethodCards.module.css'

export type MethodItem = {
  n: string
  title: string
  text: string
}

/* ————— visual astratti per card: SVG su token, invertono col tema ————— */

/* 01 formazione: barre che crescono, l'ultima accesa */
function VisBars() {
  const hs = [26, 38, 52, 64, 78, 92]
  return (
    <svg viewBox="0 0 240 100" className={styles.vis} aria-hidden="true">
      {hs.map((h, i) => (
        <rect
          key={h}
          x={10 + i * 38}
          y={100 - h}
          width={26}
          height={h}
          rx={5}
          className={i === hs.length - 1 ? styles.visAccent : styles.visFill}
        />
      ))}
    </svg>
  )
}

/* 02 collaborazioni: costellazione di nodi collegati */
function VisNet() {
  const dots = [
    [30, 72], [86, 26], [130, 60], [186, 20], [210, 78], [118, 92],
  ]
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [0, 5],
  ]
  return (
    <svg viewBox="0 0 240 110" className={styles.vis} aria-hidden="true">
      {links.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={dots[a][0]}
          y1={dots[a][1]}
          x2={dots[b][0]}
          y2={dots[b][1]}
          className={styles.visLine}
        />
      ))}
      {dots.map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={i === 2 ? 6 : 4}
          className={i === 2 ? styles.visAccent : styles.visDot}
        />
      ))}
    </svg>
  )
}

/* 03 tecnologie: waveform audio, cluster centrale acceso */
function VisWave() {
  const hs = [
    12, 20, 16, 30, 24, 44, 36, 58, 48, 72, 62, 84, 92, 84, 62, 72, 48, 58,
    36, 44, 24, 30, 16, 20, 12,
  ]
  return (
    <svg viewBox="0 0 250 100" className={styles.vis} aria-hidden="true">
      {hs.map((h, i) => (
        <rect
          key={i}
          x={4 + i * 10}
          y={50 - h / 2}
          width={5}
          height={h}
          rx={2.5}
          className={i >= 10 && i <= 14 ? styles.visAccent : styles.visFill}
        />
      ))}
    </svg>
  )
}

/* 04 networking: orbite concentriche con satelliti */
function VisOrbits() {
  return (
    <svg viewBox="0 0 240 110" className={styles.vis} aria-hidden="true">
      <circle cx={120} cy={55} r={24} className={styles.visLine} fill="none" />
      <circle cx={120} cy={55} r={44} className={styles.visLine} fill="none" />
      <circle cx={120} cy={55} r={64} className={styles.visLine} fill="none" />
      <circle cx={120} cy={55} r={5} className={styles.visAccent} />
      <circle cx={152} cy={24} r={4} className={styles.visDot} />
      <circle cx={78} cy={78} r={4} className={styles.visDot} />
      <circle cx={184} cy={62} r={4} className={styles.visDot} />
    </svg>
  )
}

const VISUALS = [VisBars, VisNet, VisWave, VisOrbits]

/**
 * Metodo come griglia 2×2 di card alla Vercel: label mono in alto,
 * visual astratto al centro su colonne tratteggiate, titolo+testo in
 * basso. Tutto su token semantici: inverte col tema da solo.
 */
export function MethodCards({ items }: { items: MethodItem[] }) {
  return (
    <div className={styles.grid}>
      {items.map((m, i) => {
        const Visual = VISUALS[i % VISUALS.length]
        return (
          <article key={m.n} className={styles.card}>
            <span className={`mono ${styles.label}`}>I/{m.n}</span>
            <div className={styles.stage}>
              <Visual />
            </div>
            <h3 className={styles.title}>{m.title}</h3>
            <p className={styles.text}>{m.text}</p>
          </article>
        )
      })}
    </div>
  )
}
