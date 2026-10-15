import Link from 'next/link'
import Image from 'next/image'
import styles from './ExploreField.module.css'

/**
 * Campo dell'offerta formativa: un muro STATICO di titoli corso — tutti
 * dello stesso corpo — con le foto della sede intercalate, tutte della
 * stessa misura. Niente scroll, niente drag: il campo si legge com'è,
 * a capo naturale dentro la gabbia. Zero JavaScript.
 */

export type ExploreWord = {
  kind: 'word'
  label: string
  tag?: string
  href: string
}

export type ExplorePic = {
  kind: 'pic'
  src: string
  alt: string
  caption: string
}

export type ExploreItem = ExploreWord | ExplorePic

export function ExploreField({ items }: { items: ExploreItem[] }) {
  return (
    <div className={styles.field}>
      {items.map((item, i) =>
        item.kind === 'word' ? (
          <Link key={`${item.label}-${i}`} href={item.href} className={styles.word}>
            <span className={styles.wordLabel}>{item.label}</span>
            {item.tag && <small className={styles.tag}>{item.tag}</small>}
          </Link>
        ) : (
          <figure key={`pic-${i}`} className={styles.pic}>
            <Image
              src={item.src}
              alt={item.alt}
              width={320}
              height={240}
              className={styles.picImg}
              sizes="(max-width: 760px) 46vw, 280px"
            />
            <figcaption className={styles.picCap}>{item.caption}</figcaption>
          </figure>
        )
      )}
    </div>
  )
}
