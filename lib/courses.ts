import { localeHref, type Locale } from '@/lib/i18n/config'
import { l } from '@/lib/sanity/l'
import type { Course } from '@/lib/sanity/types'

/**
 * Una scheda corso esiste solo se qualcuno l'ha scritta: senza corpo
 * non c'è niente da aprire.
 *
 * È la regola con cui la griglia della formazione finanziata decide se
 * la card linka (mai un link finto su un corso ancora da annunciare) e
 * con cui la sitemap decide se l'URL della scheda esiste — vive qui
 * perché ora la usa anche la route della scheda, che senza corpo
 * risponde 404 invece di servire un guscio vuoto con la CTA del form.
 */
export function hasScheda(course: Course, locale: Locale): boolean {
  const body = l(course.body, locale)
  return Array.isArray(body) && body.length > 0
}

/**
 * Dove porta la card di un corso: la sua scheda, oppure — per i corsi
 * finanziati senza scheda scritta (la route risponde 404 apposta) — la
 * pagina della formazione finanziata, dove il corso è in griglia con
 * l'avvisami. Mai un link che atterra su un 404 (28/10).
 */
export function courseHref(course: Course, locale: Locale): string {
  if (course.types?.includes('finanziato') && !hasScheda(course, locale)) {
    return localeHref(locale, '/academy/formazione-finanziata')
  }
  return localeHref(locale, `/academy/${course.slug?.current ?? ''}`)
}
