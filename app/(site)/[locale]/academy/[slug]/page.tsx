import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLink, Button, Reveal, Rule } from '@/components/ui'
import { PortableBlocks } from '@/components/sections/PortableBlocks'
import { SiteChrome, shopHref } from '@/components/sections/SiteChrome'
import { TeacherGrid } from '@/components/sections/TeacherGrid'
import { isLocale, localeHref } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getCourseBySlug, getSiteSettings } from '@/lib/sanity/queries'
import { l } from '@/lib/sanity/l'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const course = await getCourseBySlug(slug)
  const title = l(course?.title, locale)
  const description = l(course?.summary, locale)
  return title ? { title, description } : {}
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const t = getDictionary(locale)

  const [course, settings] = await Promise.all([
    getCourseBySlug(slug),
    getSiteSettings(),
  ])
  if (!course) notFound()

  const bookHref = course.shopUrl ?? shopHref(settings)
  const teachers = course.teachers ?? []

  const facts = [
    { label: t.common.duration, value: l(course.duration, locale) },
    { label: t.common.start, value: l(course.startDate, locale) },
    { label: t.common.level, value: l(course.level, locale) },
    { label: t.common.language, value: l(course.language, locale) },
    { label: t.common.mode, value: l(course.mode, locale) },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value))

  return (
    <SiteChrome locale={locale} path={`/academy/${slug}`}>
      <main className={styles.main}>
        {/* ————— hero testuale ————— */}
        <header className={`wrap ${styles.head}`}>
          <Reveal className={styles.back}>
            <ArrowLink href={localeHref(locale, '/academy')} reverse>
              {t.academy.backToCourses}
            </ArrowLink>
          </Reveal>
          <Reveal as="span" className={`mono ${styles.kicker}`} delay={60}>
            {l(course.category?.title, locale)?.toLowerCase() ?? t.academy.kicker}
          </Reveal>
          <Reveal as="h1" className={`display-thin ${styles.title}`} delay={120}>
            {l(course.title, locale)}
          </Reveal>
          {l(course.summary, locale) && (
            <Reveal as="p" className={styles.lede} delay={180}>
              {l(course.summary, locale)}
            </Reveal>
          )}
        </header>

        <Rule left={t.nav.academy} right={t.academy.courseInfo} />

        {/* ————— corpo + sidebar sticky ————— */}
        <section className={`wrap ${styles.layout}`}>
          <div className={styles.body}>
            <Reveal>
              <PortableBlocks value={l(course.body, locale)} />
            </Reveal>

            {teachers.length > 0 && (
              <div className={styles.teachers}>
                <Reveal as="span" className={`mono ${styles.teachersKicker}`}>
                  {t.academy.courseTeachers}
                </Reveal>
                <TeacherGrid teachers={teachers} locale={locale} variant="strip" />
              </div>
            )}
          </div>

          <aside className={styles.aside}>
            <div className={styles.sticky}>
              <dl className={`mono ${styles.facts}`}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value.toLowerCase()}</dd>
                  </div>
                ))}
              </dl>
              <Button variant="azzurro" href={bookHref} external>
                {t.common.bookOn}
              </Button>
            </div>
          </aside>
        </section>
      </main>
    </SiteChrome>
  )
}
