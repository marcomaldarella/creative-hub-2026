import Image from 'next/image'
import Link from 'next/link'
import { RevealGroup } from '@/components/ui'
import academyImg from '@/public/img/sections/node-academy.jpg'
import studioImg from '@/public/img/sections/node-studio.jpg'
import spaziImg from '@/public/img/sections/node-spazi.jpg'
import styles from './EcosystemBento.module.css'

export type BentoItem = {
  title: string
  text: string
  n?: string
  tags?: string
  cta?: string
}

export type EcosystemBentoProps = {
  /** [corsi di formazione, registrazione e produzione, spazi di lavoro] */
  items: BentoItem[]
  hrefs: [string, string, string]
}

const IMAGES = [academyImg, studioImg, spaziImg]

/* labeling di sezione: ogni nodo porta il colore della sua area */
const SECTIONS = [
  { label: 'Academy', accent: 'var(--azzurro-ink)' },
  { label: 'Studio', accent: 'var(--arancio)' },
  { label: 'Coworking', accent: 'var(--giallo-fluo)' },
] as const

/**
 * Bento alla Vercel ("Recently shipped"): card grande a sinistra con
 * media pieno e testo in basso, due card orizzontali impilate a destra
 * con testo a sinistra e media a filo sul lato destro.
 */
export function EcosystemBento({ items, hrefs }: EcosystemBentoProps) {
  const [big, ...side] = items
  return (
    <RevealGroup className={styles.bento}>
      <Link
        href={hrefs[0]}
        className={`rv ${styles.big}`}
        style={{ '--accent': SECTIONS[0].accent } as React.CSSProperties}
      >
        <div className={styles.bigMedia}>
          <Image
            src={IMAGES[0]}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.img}
            placeholder="blur"
          />
        </div>
        <div className={styles.bigFoot}>
          <div className={`mono ${styles.head}`}>
            <span className={styles.n}>{big.n}</span>
            <span className={styles.badge}>{SECTIONS[0].label}</span>
          </div>
          <h3 className={styles.title}>{big.title}</h3>
          <p className={styles.text}>{big.text}</p>
          {big.cta && (
            <span className={styles.cta}>
              {big.cta} <span aria-hidden="true">→</span>
            </span>
          )}
        </div>
      </Link>

      {side.map((item, i) => (
        <Link
          key={item.title}
          href={hrefs[i + 1]}
          className={`rv ${styles.side}`}
          style={
            {
              transitionDelay: `${(i + 1) * 90}ms`,
              '--accent': SECTIONS[i + 1].accent,
            } as React.CSSProperties
          }
        >
          <div className={styles.sideBody}>
            <div className={`mono ${styles.head}`}>
              <span className={styles.n}>{item.n}</span>
              <span className={styles.badge}>{SECTIONS[i + 1].label}</span>
            </div>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
            {item.cta && (
              <span className={styles.cta}>
                {item.cta} <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
          <div className={styles.sideMedia}>
            <Image
              src={IMAGES[i + 1]}
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 25vw"
              className={styles.img}
              placeholder="blur"
            />
          </div>
        </Link>
      ))}
    </RevealGroup>
  )
}
