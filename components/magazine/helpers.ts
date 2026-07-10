import { localeHref, type Locale } from '@/lib/i18n/config'
import type { Article, Category } from '@/lib/sanity/types'

/**
 * Data editoriale, sempre lowercase come nel reference:
 * it → "12 giu 2026" · en → "12 jun 2026"
 */
export function formatDate(
  dateString: string | undefined,
  locale: Locale
): string | undefined {
  if (!dateString) return undefined
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .toLowerCase()
}

export function articleHref(article: Article, locale: Locale): string {
  return localeHref(locale, `/magazine/${article.slug?.current ?? ''}`)
}

export function categoryHref(category: Category, locale: Locale): string {
  return localeHref(locale, `/magazine/categoria/${category.slug?.current ?? ''}`)
}

/**
 * Indice stabile (0..2) per la variante di gradient del thumb,
 * derivato dall'_id così listing e dettaglio mostrano lo stesso fallback.
 */
export function gradientIndex(seed: string | undefined): 0 | 1 | 2 {
  if (!seed) return 0
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return (sum % 3) as 0 | 1 | 2
}
