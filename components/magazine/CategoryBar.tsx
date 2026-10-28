import Link from 'next/link'
import { localeHref, type Locale } from '@/lib/i18n/config'
import { l } from '@/lib/sanity/l'
import type { Category } from '@/lib/sanity/types'
import { ScrollerRow } from '@/components/ui'
import { categoryHref } from './helpers'
import styles from './CategoryBar.module.css'

export type CategoryBarProps = {
  categories: Category[]
  locale: Locale
  /** slug della categoria attiva (undefined su /magazine) */
  activeSlug?: string
  /** label del pill "tutti" (da dizionario) */
  allLabel: string
  /** aria-label della barra (da dizionario) */
  ariaLabel: string
  /** aria-label delle due frecce mobile (da dizionario) */
  prevLabel: string
  nextLabel: string
  className?: string
}

/** Barra categorie a pill, con "Tutti" per il listing completo. */
export function CategoryBar({
  categories,
  locale,
  activeSlug,
  allLabel,
  ariaLabel,
  prevLabel,
  nextLabel,
  className,
}: CategoryBarProps) {
  if (categories.length === 0) return null

  return (
    <ScrollerRow
      aria-label={ariaLabel}
      tabIndex={0}
      className={[styles.bar, className].filter(Boolean).join(' ')}
      arrows={{ prev: prevLabel, next: nextLabel }}
    >
      <Link
        href={localeHref(locale, '/magazine')}
        className={`${styles.pill} ${activeSlug ? '' : styles.active}`}
        aria-current={activeSlug ? undefined : 'page'}
      >
        {allLabel}
      </Link>
      {categories.map((category) => {
        const slug = category.slug?.current
        const title = l(category.title, locale)
        if (!slug || !title) return null
        const active = slug === activeSlug
        return (
          <Link
            key={category._id}
            href={categoryHref(category, locale)}
            className={`${styles.pill} ${active ? styles.active : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {/* il titolo resta com'è in Sanity: le pill del sito hanno
                tutte l'iniziale maiuscola */}
            {title}
          </Link>
        )
      })}
    </ScrollerRow>
  )
}
