import Image from 'next/image'
import Link from 'next/link'
import { BgVideo } from './BgVideo'
import { Arrow, RevealGroup } from '@/components/ui'
import { getSectionImages } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
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

/* le foto di repo dei tre nodi: fallback quando il CMS non le sostituisce */
const FALLBACK = [academyImg, studioImg, spaziImg]

/* labeling di sezione: ogni nodo porta il colore della sua area */
const SECTIONS = [
  /* accent = colore come TESTO · fill = superficie piena dell'hover ·
     video = clip muta in loop al posto della foto (la foto resta poster) */
  { label: 'Academy', accent: 'var(--azzurro-ink)', fill: 'var(--azzurro)', video: '/video/node-academy.mp4' },
  {
    label: 'Studio',
    accent: 'var(--arancio)',
    fill: 'var(--arancio)',
    video: '/video/creative-hub-8s-1920x1080.mp4',
  },
  {
    label: 'Coworking',
    accent: 'var(--giallo-fluo)',
    fill: 'var(--giallo-fluo)',
    video: '/video/node-coworking.mp4',
  },
] as const

/**
 * Bento alla Vercel ("Recently shipped"): card grande a sinistra con
 * media pieno e testo in basso, due card orizzontali impilate a destra
 * con testo a sinistra e media a filo sul lato destro.
 */
export async function EcosystemBento({ items, hrefs }: EcosystemBentoProps) {
  /* foto sostituibili dal CMS (Media del sito → doc "comuni"): gli slot
     node-* sono condivisi da bento, carosello e pagine di sezione;
     senza slot compilato resta la foto di repo (1200×1500) */
  const media = await getSectionImages('comuni')
  const foto = (slot: string, i: number) =>
    media[slot]
      ? urlFor(media[slot]).width(1200).height(1500).fit('crop').auto('format').url()
      : FALLBACK[i].src
  const IMAGES = [
    foto('node-academy', 0),
    foto('node-studio', 1),
    foto('node-spazi', 2),
  ]
  const [big, ...side] = items
  return (
    <RevealGroup className={styles.bento}>
      <Link
        href={hrefs[0]}
        className={`rv ${styles.big}`}
        style={
          {
            '--accent': SECTIONS[0].accent,
            '--fill': SECTIONS[0].fill,
          } as React.CSSProperties
        }
      >
        <div className={styles.bigMedia}>
          {SECTIONS[0].video ? (
            <BgVideo
              src={SECTIONS[0].video}
              poster={IMAGES[0]}
              className={styles.img}
            />
          ) : (
            <Image
              src={IMAGES[0]}
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.img}
            />
          )}
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
              {big.cta} <Arrow />
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
              '--fill': SECTIONS[i + 1].fill,
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
                {item.cta} <Arrow />
              </span>
            )}
          </div>
          <div className={styles.sideMedia}>
            {SECTIONS[i + 1].video ? (
              <BgVideo
                src={SECTIONS[i + 1].video as string}
                poster={IMAGES[i + 1]}
                className={styles.img}
              />
            ) : (
              <Image
                src={IMAGES[i + 1]}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 25vw"
                className={styles.img}
              />
            )}
          </div>
        </Link>
      ))}
    </RevealGroup>
  )
}
