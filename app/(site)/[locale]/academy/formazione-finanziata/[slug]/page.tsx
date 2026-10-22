import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseDetail, courseDetailMetadata } from '@/components/sections/CourseDetail'
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

  return <CourseDetail locale={locale} slug={slug} basePath={BASE} />
}
