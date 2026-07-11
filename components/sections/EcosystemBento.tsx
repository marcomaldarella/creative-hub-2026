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
}

export type EcosystemBentoProps = {
  /** [corsi di formazione, registrazione e produzione, spazi di lavoro] */
  items: BentoItem[]
  hrefs: [string, string, string]
  /** fila secondaria: gli altri nodi (innovazione, editorial, chi siamo) */
  minor?: BentoItem[]
  minorHrefs?: string[]
}

const IMAGES = [academyImg, studioImg, spaziImg]

/**
 * Bento alla Vercel ("Recently shipped"): card grande a sinistra con
 * media pieno e testo in basso, due card orizzontali impilate a destra
 * con testo a sinistra e media a filo sul lato destro.
 */
export function EcosystemBento({ items, hrefs, minor, minorHrefs }: EcosystemBentoProps) {
  const [big, ...side] = items
  return (
    <RevealGroup className={styles.bento}>
      <Link href={hrefs[0]} className={`rv ${styles.big}`}>
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
          <h3 className={styles.title}>{big.title}</h3>
          <p className={styles.text}>{big.text}</p>
        </div>
      </Link>

      {side.map((item, i) => (
        <Link
          key={item.title}
          href={hrefs[i + 1]}
          className={`rv ${styles.side}`}
          style={{ transitionDelay: `${(i + 1) * 90}ms` }}
        >
          <div className={styles.sideBody}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
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

      {minor && minorHrefs && (
        <div className={styles.minorRow}>
          {minor.map((item, i) => (
            <Link
              key={item.title}
              href={minorHrefs[i]}
              className={`rv ${styles.mini}`}
              style={{ transitionDelay: `${240 + i * 90}ms` }}
            >
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </Link>
          ))}
        </div>
      )}
    </RevealGroup>
  )
}
