import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseDetail, courseDetailMetadata } from '@/components/sections/CourseDetail'
import { TopicScreen } from '@/components/sections/TopicScreen'
import { UniScreen } from '@/components/sections/UniScreen'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates, topicBreadcrumbJsonLd } from '@/lib/seo'
import { findTopic } from '@/lib/topics'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  /* corsi-universitari ha una landing propria con la sua SEO */
  if (slug === 'corsi-universitari') {
    const t = getDictionary(locale)
    return {
      title: t.uni.seo.title,
      description: t.uni.seo.description,
      alternates: pageAlternates(locale, `/academy/${slug}`),
    }
  }
  /* le voci di menu vivono nello stesso spazio degli slug dei corsi */
  const topic = findTopic('/academy', slug)
  if (topic) {
    const t = getDictionary(locale)
    const copy = t.topics[topic.key as keyof typeof t.topics] as {
      title: string
      lede: string
      /* titolo e descrizione scritti per la ricerca, quando il topic li
         ha: altrimenti valgono h1 e lede come prima */
      metaTitle?: string
      metaDesc?: string
    }
    return {
      /* l'h1 può andare a capo (il \n spezza il titolo in pagina): nel
         <title> il ritorno a capo non ci va mai */
      title: copy.metaTitle ?? copy.title.replace(/\s*\n\s*/g, ' '),
      description: copy.metaDesc ?? copy.lede,
      alternates: pageAlternates(locale, `/academy/${slug}`),
    }
  }
  /* tutto il resto è uno slug di corso: la SEO della scheda sta nel
     modulo condiviso con /academy/formazione-finanziata/[corso] */
  return courseDetailMetadata(locale, slug, '/academy')
}

/**
 * Le pagine che vivono sotto /academy: le voci di menu (che hanno la
 * precedenza sugli slug dei corsi) e, per tutto il resto, la scheda del
 * corso — renderizzata dal modulo condiviso con la route gemella
 * /academy/formazione-finanziata/[corso].
 */
export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  /* /academy/corsi-universitari e simili non sono corsi: sono le pagine
     delle voci di menu, hanno la precedenza sullo slug del corso.
     corsi-universitari ha la landing dedicata (layout B del cliente). */
  const topic = findTopic('/academy', slug)
  if (topic) {
    /* BreadcrumbList: home → academy → pagina (nota sviluppatore) */
    const breadcrumb = topicBreadcrumbJsonLd(locale, topic)
    return (
      <>
        {breadcrumb && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
          />
        )}
        {slug === 'corsi-universitari' ? (
          <UniScreen locale={locale} />
        ) : (
          <TopicScreen locale={locale} topic={topic} />
        )}
      </>
    )
  }

  return <CourseDetail locale={locale} slug={slug} basePath="/academy" />
}
