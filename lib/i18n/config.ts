export const locales = ['it', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'it'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Costruisce un href rispettando la regola: IT senza prefisso, EN con /en */
export function localeHref(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return locale === 'it' ? clean : `/en${clean === '/' ? '' : clean}`
}
