import Image from 'next/image'
import Link from 'next/link'
import { Reveal, RevealGroup } from '@/components/ui'
import studioImg from '@/public/img/sections/node-studio.jpg'
import styles from './StudioFocus.module.css'

export type StudioFocusProps = {
  eyebrow: string
  /** prima riga del titolo (es. "uno studio") */
  titleA: string
  /** seconda riga, evidenziata in azzurro (es. "SSL") */
  titleB: string
  desc: string
  services: string[]
  ctaLabel: string
  ctaHref: string
  captionLeft: string
  captionRight: string
}

/**
 * Focus studio (reference § 06): split panel scuro + foto console
 * full-bleed. Il type entra staggerato: le righe del titolo salgono
 * da una mask, poi lede, servizi e CTA in cascata.
 */
export function StudioFocus({
  eyebrow,
  titleA,
  titleB,
  desc,
  services,
  ctaLabel,
  ctaHref,
  captionLeft,
  captionRight,
}: StudioFocusProps) {
  return (
    <section className={styles.sez}>
      <RevealGroup className={styles.grid}>
        <div className={styles.content}>
          <Reveal as="span" className={`mono ${styles.eyebrow}`}>
            {eyebrow}
          </Reveal>

          <h2 className={`display-black ${styles.title}`}>
            <span className={`rv ${styles.line}`}>
              <span className={styles.lineIn}>{titleA}</span>
            </span>
            <span
              className={`rv ${styles.line}`}
              style={{ transitionDelay: '110ms' }}
            >
              <span className={styles.lineIn}>
                <em className={styles.ssl}>{titleB}</em>
                <span className={styles.dot} aria-hidden="true">
                  .
                </span>
              </span>
            </span>
          </h2>

          <Reveal as="p" className={styles.desc} delay={200}>
            {desc}
          </Reveal>

          <ul className={styles.services}>
            {services.map((service, i) => (
              <Reveal
                as="li"
                key={service}
                className={styles.service}
                delay={280 + i * 70}
              >
                <span className={styles.serviceLabel}>{service}</span>
                <span className={styles.serviceFill} aria-hidden="true" />
                <span className={`mono ${styles.serviceN}`}>
                  0{i + 1}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={280 + services.length * 70}>
            <Link href={ctaHref} className={styles.cta}>
              {ctaLabel} <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        <Reveal className={styles.media} delay={140}>
          <Image
            src={studioImg}
            alt={captionLeft}
            fill
            sizes="(max-width: 900px) 100vw, 58vw"
            className={styles.img}
            placeholder="blur"
          />
          <div className={styles.caption}>
            <span className="mono">{captionLeft}</span>
            <span className="mono">{captionRight}</span>
          </div>
        </Reveal>
      </RevealGroup>
    </section>
  )
}
