import { Reveal } from '@/components/ui'
import styles from './FundingBand.module.css'

/**
 * Fascia del cofinanziamento FSE+ (obbligo normativo sui corsi finanziati):
 * pill dei loghi istituzionali — tratteggiate finché non arrivano gli SVG
 * ufficiali, stesso pattern dei finLogos di innovazione/cte-cobo — e
 * dicitura di cofinanziamento per esteso.
 */
export function FundingBand({
  logos,
  text,
}: {
  logos: string[]
  text: string
}) {
  return (
    <section className={`wrap ${styles.band}`}>
      <Reveal className={styles.logos}>
        {logos.map((l) => (
          <span key={l} className={styles.logo}>
            {l}
          </span>
        ))}
      </Reveal>
      <Reveal as="p" className={styles.text} delay={60}>
        {text}
      </Reveal>
    </section>
  )
}
