import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseTemplateShell } from '@/components/mockup/CourseTemplateShell'
import { buildCourseHtml, css } from '@/components/mockup/templates/v3'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { TopicScreen } from '@/components/sections/TopicScreen'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { urlFor } from '@/lib/sanity/image'
import { l } from '@/lib/sanity/l'
import { getCourseBySlug, getSiteSettings } from '@/lib/sanity/queries'
import type { CourseEntry, SanityImage } from '@/lib/sanity/types'
import { findTopic } from '@/lib/topics'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  /* le voci di menu vivono nello stesso spazio degli slug dei corsi */
  const topic = findTopic('/academy', slug)
  if (topic) {
    const t = getDictionary(locale)
    const copy = t.topics[topic.key as keyof typeof t.topics] as {
      title: string
      lede: string
    }
    return { title: copy.title, description: copy.lede }
  }
  const course = await getCourseBySlug(slug)
  const title = l(course?.title, locale)
  const description = l(course?.summary, locale)
  return title ? { title, description } : {}
}

/* dal PortableText del body ai paragrafi piani per la panoramica */
function paragraphs(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return []
  return blocks
    .filter(
      (b): b is { _type: string; style?: string; children?: { text?: string }[] } =>
        typeof b === 'object' &&
        b !== null &&
        (b as { _type?: string })._type === 'block' &&
        (!(b as { style?: string }).style ||
          (b as { style?: string }).style === 'normal'),
    )
    .map((b) => (b.children ?? []).map((c) => c.text ?? '').join('').trim())
    .filter(Boolean)
}

function imgUrl(
  image: SanityImage | undefined,
  w: number,
  h: number,
): string | undefined {
  return image?.asset
    ? urlFor(image).width(w).height(h).fit('crop').url()
    : undefined
}

/**
 * Scheda corso: la struttura approvata di corso-v3 (riunione Duessenza
 * 17/09) applicata a TUTTI i corsi — l'HTML viene generato dal builder
 * del template con i dati Sanity del corso (hero, fatti, panoramica dal
 * body, foto della gallery nelle competenze, docente).
 */
export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  /* /academy/corsi-universitari e simili non sono corsi: sono le pagine
     delle voci di menu, hanno la precedenza sullo slug del corso */
  const topic = findTopic('/academy', slug)
  if (topic) return <TopicScreen locale={locale} topic={topic} />

  const t = getDictionary(locale)
  const [course, settings] = await Promise.all([
    getCourseBySlug(slug),
    getSiteSettings(),
  ])
  if (!course) notFound()

  const gallery = course.gallery ?? []
  const teacher = course.teachers?.[0]
  const title = l(course.title, locale) ?? slug

  /* voci titolo+testo delle sezioni editabili (fieldset "Scheda corso"):
     una voce senza né titolo né testo non arriva al template */
  const entries = (arr?: CourseEntry[]) => {
    const out = (arr ?? [])
      .map((it) => ({
        title: l(it.title, locale) ?? '',
        text: l(it.text, locale) ?? '',
      }))
      .filter((it) => it.title || it.text)
    return out.length ? out : undefined
  }

  const html = buildCourseHtml({
    eyebrow: `Academy · ${
      l(course.category?.title, locale) ?? t.academy.kicker
    }`,
    title,
    sub: l(course.summary, locale) ?? '',
    courseLine: [title, l(course.level, locale)].filter(Boolean).join(' — '),
    meta: [
      { label: t.common.duration, value: l(course.duration, locale) },
      { label: t.common.start, value: l(course.startDate, locale) },
      { label: t.common.level, value: l(course.level, locale) },
      { label: t.common.language, value: l(course.language, locale) },
      { label: t.common.mode, value: l(course.mode, locale) },
    ].filter((m): m is { label: string; value: string } => Boolean(m.value)),
    heroImage: imgUrl(course.coverImage, 1600, 1200),
    secondaryCta: {
      label: t.common.bookOn,
      href: course.shopUrl ?? shopHref(settings),
    },
    panoramica: paragraphs(l(course.body, locale)),
    panImage: imgUrl(gallery[0] ?? course.coverImage, 1200, 800),
    skillImages: gallery.length
      ? Array.from(
          { length: 6 },
          (_, i) => imgUrl(gallery[i % gallery.length], 900, 563)!,
        )
      : undefined,
    skillsLede: l(course.skillsLede, locale) ?? undefined,
    skills: entries(course.skills),
    structureIntro: l(course.structureIntro, locale)
      ?.split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean),
    structure: entries(course.structure),
    admissionsKeys: (course.admissionsKeys ?? [])
      .map((k) => l(k, locale) ?? '')
      .filter(Boolean),
    admissions: entries(course.admissions),
    faq: entries(course.faq),
    teacher: teacher?.name
      ? {
          name: teacher.name,
          role: l(teacher.role, locale) ?? '',
          bio: l(teacher.bio, locale) ?? '',
          img: imgUrl(teacher.photo, 800, 1000),
        }
      : undefined,
  })

  return (
    <SiteChrome locale={locale} path={`/academy/${slug}`}>
      <CourseTemplateShell css={css} html={html} />
    </SiteChrome>
  )
}
