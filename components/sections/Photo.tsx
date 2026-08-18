import Image, { type StaticImageData } from 'next/image'
import { Reveal } from '@/components/ui'
import styles from './Photo.module.css'

export type PhotoFullProps = {
  src: StaticImageData
  alt: string
  /** etichetta mono in alto a sinistra */
  kicker?: string
  /** didascalia in basso */
  caption?: string
  /** full: uno schermo intero · band: fascia più bassa (prima del footer) */
  height?: 'full' | 'band'
  priority?: boolean
}

/**
 * Foto a tutta larghezza: esce dal `wrap` e occupa il viewport.
 * Le etichette stanno sopra un velo scuro che parte dai bordi, così il
 * testo mono resta leggibile su qualsiasi foto.
 */
export function PhotoFull({
  src,
  alt,
  kicker,
  caption,
  height = 'full',
  priority = false,
}: PhotoFullProps) {
  return (
    <figure
      className={`${styles.full} ${height === 'band' ? styles.band : ''}`}
      /* ParallaxMedia muove l'immagine di queste figure durante lo scroll */
      data-parallax=""
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className={styles.img}
        placeholder="blur"
        priority={priority}
      />
      {(kicker || caption) && (
        <figcaption className={styles.fullCap}>
          {kicker && <span className={`mono ${styles.kicker}`}>{kicker}</span>}
          {caption && <span className={styles.caption}>{caption}</span>}
        </figcaption>
      )}
    </figure>
  )
}

export type PhotoSplitProps = {
  src: StaticImageData
  alt: string
  kicker?: string
  title: string
  text?: string
  /** foto a destra invece che a sinistra */
  flip?: boolean
}

/**
 * Foto verticale accostata a un blocco di testo: mai a tutta pagina,
 * il ritratto del formato va rispettato (3:4).
 */
export function PhotoSplit({
  src,
  alt,
  kicker,
  title,
  text,
  flip = false,
}: PhotoSplitProps) {
  return (
    <div className={`wrap ${styles.split} ${flip ? styles.flip : ''}`}>
      <Reveal className={styles.splitMedia}>
        <Image
          src={src}
          alt={alt}
          sizes="(max-width: 900px) 100vw, 42vw"
          className={styles.splitImg}
          placeholder="blur"
        />
      </Reveal>
      <Reveal className={styles.splitBody} delay={80}>
        {kicker && <span className={`mono ${styles.kicker}`}>{kicker}</span>}
        <h2 className={`display-thin ${styles.splitTitle}`}>{title}</h2>
        {text && <p className={styles.splitText}>{text}</p>}
      </Reveal>
    </div>
  )
}

export type PhotoDuoProps = {
  photos: [{ src: StaticImageData; alt: string }, { src: StaticImageData; alt: string }]
  kicker?: string
  title?: string
  text?: string
}

/** Due foto quadrate affiancate (una sopra l'altra sotto i 760px). */
export function PhotoDuo({ photos, kicker, title, text }: PhotoDuoProps) {
  return (
    <div className={styles.duoBlock}>
      {(kicker || title || text) && (
        <Reveal className={styles.duoHead}>
          {kicker && <span className={`mono ${styles.kicker}`}>{kicker}</span>}
          {title && <h2 className={`display-thin ${styles.duoTitle}`}>{title}</h2>}
          {text && <p className={styles.duoText}>{text}</p>}
        </Reveal>
      )}
      <div className={styles.duo}>
        {photos.map((photo, i) => (
          <Reveal key={i} className={styles.duoItem} delay={i * 90}>
            <Image
              src={photo.src}
              alt={photo.alt}
              sizes="(max-width: 760px) 100vw, 46vw"
              className={styles.duoImg}
              placeholder="blur"
            />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
