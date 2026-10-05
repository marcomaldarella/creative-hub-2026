import type { Metadata } from 'next'
import type { Locale } from './i18n/config'

/* canonical + hreflang PER PAGINA. Il layout non definisce più alternates
   globali: con un canonical fisso '/' tutto il sito si canonicalizzava
   alla home e Google avrebbe de-indicizzato le pagine interne. */

/** path SENZA prefisso locale (es. '/', '/academy', `/magazine/${slug}`) */
export function pageAlternates(
  locale: Locale,
  path: string
): NonNullable<Metadata['alternates']> {
  const clean = path.startsWith('/') ? path : `/${path}`
  const it = clean
  const en = clean === '/' ? '/en' : `/en${clean}`
  return {
    canonical: locale === 'it' ? it : en,
    languages: { it, en, 'x-default': it },
  }
}
