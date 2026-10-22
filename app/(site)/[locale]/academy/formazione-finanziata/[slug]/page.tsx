import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseDetail, courseDetailMetadata } from '@/components/sections/CourseDetail'
import { hasScheda } from '@/lib/courses'
import { isLocale } from '@/lib/i18n/config'
import { getCourseBySlug } from '@/lib/sanity/queries'

export const dynamic = 'force-dynamic'

/* le schede dei corsi finanziati stanno SOTTO la loro pagina di
   categoria, non appese ad /academy (note sviluppatore del mockup):
   /academy/formazione-finanziata/[corso]. Il rendering è lo stesso
   modulo della route /academy/[slug]; i vecchi URL arrivano qui con un
   301 definito in next.config.ts. */
const BASE = '/academy/formazione-finanziata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  return courseDetailMetadata(locale, slug, BASE)
}

export default async function CorsoFinanziatoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  /* sotto questa pagina vivono SOLO i corsi finanziati: un corso a
     catalogo qui sarebbe un doppione dell'URL /academy/[slug] */
  const course = await getCourseBySlug(slug)
  if (!course?.types?.includes('finanziato')) notFound()
  /* e solo i corsi che hanno davvero una scheda scritta: l'unica
     edizione attiva è Music Data Analyst & Strategist, gli altri sei
     sono "prossima edizione da annunciare" e in Sanity hanno il corpo
     vuoto. Senza questo controllo l'URL rispondeva 200 con un guscio:
     nessun contenuto ma fascia di stato e form di candidatura, cioè
     una promessa d'iscrizione su un corso che non esiste ancora.
     Stessa regola con cui la griglia non li linka e la sitemap non li
     elenca (lib/courses.ts). */
  if (!hasScheda(course, locale)) notFound()

  return <CourseDetail locale={locale} slug={slug} basePath={BASE} />
}
