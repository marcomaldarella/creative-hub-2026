import type { Locale } from '@/lib/i18n/config'

/**
 * Legge un campo localizzato { it, en } nella lingua richiesta,
 * con fallback su it quando la traduzione manca.
 *
 *   l(course.title, locale) → string
 *   l(article.body, locale) → PortableTextBlock[]
 */
export function l<T>(
  field: { it?: T; en?: T } | null | undefined,
  locale: Locale
): T | undefined {
  if (!field) return undefined
  if (locale === 'en' && field.en != null && field.en !== '') return field.en
  return field.it
}
