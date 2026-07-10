import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { l } from '@/lib/sanity/l'
import { urlFor } from '@/lib/sanity/image'
import type { Article } from '@/lib/sanity/types'
import { articleHref, formatDate, gradientIndex } from './helpers'
import gradients from './gradients.module.css'
import styles from './ArticleCard.module.css'

export type ArticleCardProps = {
  article: Article
  locale: Locale
  /** card grande orizzontale (articolo in evidenza) */
  featured?: boolean
  /** aggiunge la classe .rv — da usare dentro un <RevealGroup> */
  reveal?: boolean
  className?: string
}

const gradientClasses = [gradients.g0, gradients.g1, gradients.g2]

/**
 * Card articolo — stile Vercel (templates): scatola bordata larga con
 * immagine 16:9 sopra (gradient placeholder se assente), pill categoria +
 * data, titolo, excerpt, autore, freccia ↙ del brand on-hover.
 * La variante featured è orizzontale: immagine a sinistra, contenuto a destra.
 */
export function ArticleCard({
  article,
  locale,
  featured = false,
  reveal = false,
  className,
}: ArticleCardProps) {
  const title = l(article.title, locale)
  const excerpt = l(article.excerpt, locale)
  const category = l(article.categories?.[0]?.title, locale)
  const date = formatDate(article.publishedAt, locale)
  const author = article.author?.name

  const imageUrl = article.coverImage?.asset
    ? urlFor(article.coverImage)
        .width(featured ? 1400 : 960)
        .height(featured ? 900 : 540)
        .fit('crop')
        .url()
    : undefined

  const cls = [
    styles.card,
    featured ? styles.featured : '',
    reveal ? 'rv' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link href={articleHref(article, locale)} className={cls}>
      <div
        className={`${styles.media} ${
          imageUrl ? '' : gradientClasses[gradientIndex(article._id)]
        }`}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={article.coverImage?.alt ?? title ?? ''}
            loading="lazy"
            className={styles.img}
          />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.top}>
          {category && <span className={styles.pill}>{category.toLowerCase()}</span>}
          <span className={`mono ${styles.date}`}>{date}</span>
        </div>
        {featured ? (
          <h2 className={styles.title}>{title}</h2>
        ) : (
          <h3 className={styles.title}>{title}</h3>
        )}
        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
        <div className={styles.foot}>
          {author && <span className={`mono ${styles.author}`}>{author}</span>}
          <span className={styles.arrow} aria-hidden>
            ↙
          </span>
        </div>
      </div>
    </Link>
  )
}
