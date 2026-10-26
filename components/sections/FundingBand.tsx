import { Reveal } from '@/components/ui'
import styles from './FundingBand.module.css'

/**
 * Fascia del cofinanziamento FSE+ (obbligo normativo sui corsi finanziati):
 * lockup ufficiale dei quattro loghi istituzionali (Coesione Italia 21-27
 * Emilia-Romagna · Cofinanziato dall'Unione europea · Repubblica Italiana ·
 * Regione Emilia-Romagna) dal kit immagine coordinata 2021-2027 della
 * Regione, su targa chiara dedicata — i loghi istituzionali non si
 * ricolorano né si mascherano, e devono leggere anche in tema dark — e
 * dicitura di cofinanziamento per esteso. Le voci di `logos` che iniziano
 * per "/" sono path immagine; le altre restano pill testuali (fallback).
 */
export function FundingBand({
  logos,
  logosAlt,
  text,
}: {
  logos: string[]
  logosAlt?: string
  text: string
}) {
  return (
    <section className={`wrap ${styles.band}`}>
      <Reveal className={styles.logos}>
        {logos.map((l) =>
          l.startsWith('/') ? (
            <span key={l} className={styles.plate}>
              {/* SVG statico normato: niente pipeline di ottimizzazione */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l}
                alt={logosAlt ?? ''}
                className={styles.lockup}
                loading="lazy"
                decoding="async"
              />
            </span>
          ) : (
            <span key={l} className={styles.logo}>
              {l}
            </span>
          ),
        )}
      </Reveal>
      <Reveal as="p" className={styles.text} delay={60}>
        {text}
      </Reveal>
    </section>
  )
}
