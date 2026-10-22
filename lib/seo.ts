import type { Metadata } from 'next'
import { localeHref, type Locale } from './i18n/config'
import { getDictionary } from './i18n/dictionaries'
import type { Topic, TopicBase } from './topics'

/** dominio del sito live: serve negli @id assoluti dello structured data */
export const SITE_URL = 'https://bologna-creativehub.it'

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

/* ————— BreadcrumbList ————— */

/** una briciola: il nome mostrato e il percorso SENZA prefisso locale */
export type Crumb = { name: string; path: string }

/**
 * JSON-LD BreadcrumbList da emettere in pagina con
 * `<script type="application/ld+json" dangerouslySetInnerHTML={...} />`,
 * come già fa l'Organization nel layout e il Service di /coworking/prenota.
 *
 * Gli `item` sono URL assoluti e localizzati (EN con prefisso /en), così
 * la catena inglese non rimanda alle pagine italiane.
 */
export function breadcrumbJsonLd(locale: Locale, crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${localeHref(locale, crumb.path)}`,
    })),
  }
}

/** la voce di menu a cui appartiene ogni sezione: dà il nome alla briciola */
const NAV_KEY: Record<TopicBase, 'academy' | 'studio' | 'coworking' | 'innovation' | 'about'> =
  {
    '/academy': 'academy',
    '/studios': 'studio',
    '/coworking': 'coworking',
    '/innovazione': 'innovation',
    '/chi-siamo': 'about',
  }

/** prima lettera maiuscola: l'eyebrow in pagina è minuscolo per scelta di
    design, ma dentro un breadcrumb il nome della pagina va capitalizzato */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * BreadcrumbList di una voce di menu con pagina propria (lib/topics):
 * home → sezione → pagina. Il nome della pagina viene dall'eyebrow del
 * topic, che è la stessa dicitura della voce di menu (es. «stage &
 * placement» → «Stage & placement»).
 *
 * Torna `null` quando il topic non ha copy nel dizionario (gli slug che
 * vivono solo per nav e sitemap): meglio nessuno structured data che uno
 * con il nome sbagliato.
 */
export function topicBreadcrumbJsonLd(locale: Locale, topic: Topic) {
  const t = getDictionary(locale)
  const copy = t.topics[topic.key as keyof typeof t.topics] as
    | { title?: string; eyebrow?: string }
    | undefined
  const name = copy?.eyebrow ?? copy?.title?.split('\n')[0]
  if (!name) return null

  return breadcrumbJsonLd(locale, [
    { name: t.nav.home, path: '/' },
    { name: t.nav[NAV_KEY[topic.base]], path: topic.base },
    { name: capitalize(name.trim()), path: `${topic.base}/${topic.slug}` },
  ])
}
